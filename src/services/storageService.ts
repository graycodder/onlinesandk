import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../config/firebase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  url: string;
  storagePath: string;
  filename: string;
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format "${file.type}". Please upload JPEG, PNG, or WebP images only.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 10 MB per image.`,
    };
  }

  return { valid: true };
};

/**
 * Compresses and resizes an image file client-side using an HTML5 Canvas.
 * Produces a high-resolution, web-optimized JPEG (~100KB-180KB) that can safely
 * be stored in Firestore or uploaded to Firebase Storage quickly.
 */
export const compressImageFile = async (
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.85
): Promise<{ dataUrl: string; blob: Blob }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ dataUrl, blob });
            } else {
              reject(new Error('Failed to create blob from image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Resilient upload function that attempts Firebase Storage upload first with a timeout,
 * and automatically falls back to an optimized base64 DataURL if Firebase Storage
 * is not enabled or encounters any errors.
 */
export const uploadProductImage = async (
  file: File,
  productId: string = 'new-product',
  onProgress?: (percentage: number) => void
): Promise<UploadResult> => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 1. First compress the image client-side to ensure fast loading and reliable storage
  let compressedDataUrl: string;
  let compressedBlob: Blob;

  try {
    if (onProgress) onProgress(20);
    const compressed = await compressImageFile(file);
    compressedDataUrl = compressed.dataUrl;
    compressedBlob = compressed.blob;
  } catch (err) {
    console.warn('Image compression failed, using original file', err);
    compressedDataUrl = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    compressedBlob = file;
  }

  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `products/${productId}/${timestamp}_${cleanName}`;

  // 2. Attempt Firebase Storage upload if configured, with a 6-second timeout
  if (isFirebaseConfigured() && storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
        contentType: 'image/jpeg',
      });

      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const progress = Math.round(
                20 + ((snapshot.bytesTransferred / snapshot.totalBytes) * 75)
              );
              if (onProgress) onProgress(progress);
            }
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve({
                url,
                storagePath,
                filename: file.name,
              });
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      // 6-second timeout before falling back to compressed DataURL
      const timeoutPromise = new Promise<UploadResult>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase Storage upload timed out')), 6000)
      );

      return await Promise.race([uploadPromise, timeoutPromise]);
    } catch (err) {
      console.warn('Firebase Storage upload failed/timed out, using optimized client fallback:', err);
    }
  }

  // 3. Fallback: Return client-compressed DataURL so the admin can always use their image immediately
  if (onProgress) onProgress(100);
  return {
    url: compressedDataUrl,
    storagePath: `local/${cleanName}`,
    filename: file.name,
  };
};

export const deleteStorageImage = async (storagePath: string): Promise<void> => {
  if (!storagePath || storagePath.startsWith('local/') || storagePath.startsWith('demo/')) {
    return;
  }

  if (isFirebaseConfigured() && storage) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Could not delete image from Storage:', err);
    }
  }
};
