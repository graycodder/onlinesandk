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

export const uploadProductImage = async (
  file: File,
  productId: string = 'new-product',
  onProgress?: (percentage: number) => void
): Promise<UploadResult> => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `products/${productId}/${timestamp}_${cleanName}`;

  if (isFirebaseConfigured() && storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      return new Promise<UploadResult>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(progress));
          },
          (error) => {
            console.error('Firebase Storage upload error:', error);
            reject(new Error(`Image upload failed: ${error.message}`));
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                url,
                storagePath,
                filename: file.name,
              });
            } catch (err: any) {
              reject(new Error(`Failed to retrieve image download URL: ${err.message}`));
            }
          }
        );
      });
    } catch (err: any) {
      console.warn('Firebase Storage error, falling back to local object URL:', err);
    }
  }

  // Graceful offline/demo mode fallback:
  // Convert to persistent Data URL for testing
  return new Promise<UploadResult>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve({
        url: reader.result as string,
        storagePath: `demo/${cleanName}`,
        filename: file.name,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file locally'));
    reader.readAsDataURL(file);
  });
};

export const deleteStorageImage = async (storagePath: string): Promise<void> => {
  if (!storagePath || storagePath.startsWith('demo/')) {
    return;
  }

  if (isFirebaseConfigured() && storage) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Could not delete image from Storage (it may already be gone):', err);
    }
  }
};
