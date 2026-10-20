import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Star,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  getProductById,
  createProduct,
  updateProduct,
} from '../../services/productService';
import { getAllCollectionsAdmin } from '../../services/collectionService';
import { uploadProductImage, validateImageFile } from '../../services/storageService';
import type { Product, Collection, ProductImage } from '../../types';
import { slugify, formatINR } from '../../utils/formatters';
import { validateProductForm } from '../../utils/validation';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom Made'];
const STANDARD_COLOURS = ['Ivory', 'Champagne', 'Midnight Black', 'Rose Gold', 'Sage Green', 'Crimson Red', 'Powder Blue', 'Terracotta'];

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedCollectionId = searchParams.get('collection');
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColourInput, setCustomColourInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    price: 0,
    compareAtPrice: null,
    categoryId: '',
    categoryName: '',
    images: [],
    primaryImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
    sizes: ['S', 'M', 'L'],
    colours: ['Ivory', 'Champagne'],
    material: '',
    fit: '',
    careInstructions: 'Dry clean only',
    additionalDetails: '',
    featured: false,
    newArrival: true,
    status: 'published',
    displayOrder: 1,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const cols = await getAllCollectionsAdmin();
        setCollections(cols);

        if (isEditing && id) {
          const existing = await getProductById(id);
          if (existing) {
            setFormData(existing);
          } else {
            alert('Garment not found.');
            navigate('/admin/products');
          }
        } else if (cols.length > 0) {
          const matched = preselectedCollectionId
            ? cols.find((c) => c.id === preselectedCollectionId || c.slug === preselectedCollectionId)
            : null;
          const targetCol = matched || cols[0];
          setFormData((prev) => ({
            ...prev,
            categoryId: targetCol.id,
            categoryName: targetCol.name,
          }));
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEditing, navigate, preselectedCollectionId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-update slug only if newly creating or user hasn't customized it manually
      slug: !isEditing ? slugify(name) : prev.slug,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const col = collections.find((c) => c.id === categoryId);
    setFormData((prev) => ({
      ...prev,
      categoryId,
      categoryName: col ? col.name : '',
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const file = files[0];

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploadProgress(10);
      const res = await uploadProductImage(file, formData.id || 'draft', (p) => {
        setUploadProgress(p);
      });

      const newImage: ProductImage = {
        id: `img-${Date.now()}`,
        url: res.url,
        storagePath: res.storagePath,
        isCover: (formData.images || []).length === 0,
      };

      setFormData((prev) => {
        const currentImages = prev.images || [];
        const nextImages = [...currentImages, newImage];
        return {
          ...prev,
          images: nextImages,
          primaryImage: prev.primaryImage && currentImages.length > 0 ? prev.primaryImage : res.url,
        };
      });

      setUploadProgress(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Image upload failed.');
      setUploadProgress(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;

    const newImage: ProductImage = {
      id: `img-${Date.now()}`,
      url: imageUrlInput.trim(),
      isCover: (formData.images || []).length === 0,
    };

    setFormData((prev) => {
      const currentImages = prev.images || [];
      const nextImages = [...currentImages, newImage];
      return {
        ...prev,
        images: nextImages,
        primaryImage: prev.primaryImage && currentImages.length > 0 ? prev.primaryImage : newImage.url,
      };
    });

    setImageUrlInput('');
  };

  const handleSetCover = (imgUrl: string) => {
    setFormData((prev) => {
      const updated = (prev.images || []).map((img) => ({
        ...img,
        isCover: img.url === imgUrl,
      }));
      return {
        ...prev,
        images: updated,
        primaryImage: imgUrl,
      };
    });
  };

  const handleRemoveImage = (imgUrl: string) => {
    setFormData((prev) => {
      const filtered = (prev.images || []).filter((img) => img.url !== imgUrl);
      const newCover = filtered.length > 0 ? filtered[0].url : '';
      return {
        ...prev,
        images: filtered,
        primaryImage: prev.primaryImage === imgUrl ? newCover : prev.primaryImage,
      };
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.images || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;

    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    setFormData((prev) => ({ ...prev, images: list }));
  };

  // Sizes management
  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const current = prev.sizes || [];
      const next = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size];
      return { ...prev, sizes: next };
    });
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSizeInput.trim() && !(formData.sizes || []).includes(customSizeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...(prev.sizes || []), customSizeInput.trim()],
      }));
      setCustomSizeInput('');
    }
  };

  // Colours management
  const toggleColour = (col: string) => {
    setFormData((prev) => {
      const current = prev.colours || [];
      const next = current.includes(col)
        ? current.filter((c) => c !== col)
        : [...current, col];
      return { ...prev, colours: next };
    });
  };

  const handleAddCustomColour = (e: React.FormEvent) => {
    e.preventDefault();
    if (customColourInput.trim() && !(formData.colours || []).includes(customColourInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        colours: [...(prev.colours || []), customColourInput.trim()],
      }));
      setCustomColourInput('');
    }
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valResult = validateProductForm(formData);
    if (!valResult.isValid) {
      setErrors(valResult.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData as Omit<Product, 'id'>);
      }
      navigate('/admin/products');
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert(`Save failed: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#8A7869]">
        Loading garment details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/products"
            className="p-2 bg-white border border-[#E8E0D5] text-[#292522] hover:bg-[#F5EFE6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-0.5">
              {isEditing ? 'Editing Garment' : 'New Creation'}
            </span>
            <h1 className="font-serif text-3xl text-[#292522] font-normal">
              {isEditing ? formData.name || 'Edit Garment' : 'Add New Garment to Catalogue'}
            </h1>
          </div>
        </div>

        {formData.slug && isEditing && (
          <Link
            to={`/product/${formData.slug}`}
            target="_blank"
            className="text-xs uppercase tracking-wider text-[#8A7869] hover:text-[#292522] flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Store Preview</span>
          </Link>
        )}
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm space-y-1">
          <span className="font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Please address the following requirements:
          </span>
          <ul className="list-disc pl-5">
            {Object.values(errors).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <h2 className="font-serif text-xl text-[#292522] border-b border-[#E8E0D5] pb-3">
            Garment Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Garment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={handleNameChange}
                placeholder="e.g. Mulberry Silk Evening Gown"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                placeholder="mulberry-silk-evening-gown"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Collection / Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId || ''}
                onChange={handleCategoryChange}
                className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border ${
                  errors.categoryId ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E8E0D5]'
                } focus:outline-none focus:border-[#292522]`}
              >
                <option value="">Select a collection...</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} {col.status === 'draft' ? '(Draft)' : ''}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-[11px] text-red-600 mt-1">{errors.categoryId}</p>
              )}
              {collections.length === 0 && (
                <p className="text-[11px] text-amber-700 mt-1">
                  No collections available. <Link to="/admin/collections" className="underline font-semibold">Create a collection first</Link>.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Display Order Priority
              </label>
              <input
                type="number"
                value={formData.displayOrder || 1}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
              Short Summary Description
            </label>
            <input
              type="text"
              value={formData.shortDescription || ''}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="e.g. Pure mulberry silk draped evening gown with cowl neckline and tailored silhouette."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
              Full Garment Description &amp; Story
            </label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the silhouette, drape, lining, occasion suitability, and craftsmanship details..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] resize-none"
            />
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <h2 className="font-serif text-xl text-[#292522] border-b border-[#E8E0D5] pb-3">
            Pricing (INR)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.price !== undefined ? formData.price : ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="14500"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] font-sans font-semibold"
              />
              <span className="text-[11px] text-[#8A7869] mt-1 block">
                Preview: {formatINR(formData.price || 0)}
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Reference / Original Price (₹) <span className="font-normal text-[#8A7869] lowercase">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.compareAtPrice !== null && formData.compareAtPrice !== undefined ? formData.compareAtPrice : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    compareAtPrice: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="18500"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] font-sans"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Photography Gallery */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-3">
            <div>
              <h2 className="font-serif text-xl text-[#292522]">
                Garment Photography
              </h2>
              <p className="text-xs text-[#8A7869] mt-0.5">
                Upload clothing images to Firebase Storage or enter high-resolution image URLs
              </p>
            </div>
            <span className="text-xs text-[#8A7869]">
              {(formData.images || []).length} images added
            </span>
          </div>

          {/* Upload progress & error */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#292522]">
                <span>Uploading to Firebase Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#E8E0D5] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#292522] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
              {uploadError}
            </div>
          )}

          {/* Dropzone & URL Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D9CEBF] hover:border-[#292522] bg-[#FAF7F2] p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Upload className="w-6 h-6 text-[#8A7869]" />
              <span className="text-xs font-semibold text-[#292522] uppercase tracking-wider">
                Upload File from Device
              </span>
              <span className="text-[10px] text-[#8A7869]">
                Supports JPEG, PNG, WebP up to 10MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="border border-[#E8E0D5] bg-[#FAF7F2] p-5 flex flex-col justify-center space-y-3">
              <span className="text-xs font-semibold text-[#292522] uppercase tracking-wider block">
                Or Attach Image Web URL
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-wider font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Image Thumbnails Gallery */}
          {(formData.images || []).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {(formData.images || []).map((img, idx) => {
                const isCover = img.url === formData.primaryImage;
                return (
                  <div
                    key={img.id || idx}
                    className={`relative border p-2 bg-[#FAF7F2] space-y-2 ${
                      isCover ? 'border-[#292522] ring-2 ring-[#292522]' : 'border-[#E8E0D5]'
                    }`}
                  >
                    <div className="aspect-[3/4] bg-[#F5EFE6] overflow-hidden relative">
                      <ImageWithFallback
                        src={img.url}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      {isCover && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#292522] text-[#FAF7F2] text-[9px] uppercase tracking-wider font-semibold shadow">
                          Cover
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'up')}
                          className="p-1 hover:text-[#292522] text-[#8A7869] disabled:opacity-30"
                          title="Move earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (formData.images || []).length - 1}
                          onClick={() => handleMoveImage(idx, 'down')}
                          className="p-1 hover:text-[#292522] text-[#8A7869] disabled:opacity-30"
                          title="Move later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(img.url)}
                            className="p-1 text-[#8A7869] hover:text-[#292522]"
                            title="Set as Cover Photograph"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.url)}
                          className="p-1 text-[#8A7869] hover:text-red-700"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 4: Sizes & Colours */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <h2 className="font-serif text-xl text-[#292522] border-b border-[#E8E0D5] pb-3">
            Sizes &amp; Colour Variations
          </h2>

          {/* Sizes */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-2">
              Available Sizes
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {STANDARD_SIZES.map((size) => {
                const active = (formData.sizes || []).includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium border transition-colors ${
                      active
                        ? 'border-[#292522] bg-[#292522] text-[#FAF7F2]'
                        : 'border-[#E8E0D5] bg-white text-[#8A7869] hover:border-[#8A7869]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Custom size input */}
            <div className="flex gap-2 max-w-xs">
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                placeholder="Add custom size (e.g. 3XL, Petite)"
                className="flex-1 px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3 py-1.5 bg-[#8A7869] text-white text-xs uppercase tracking-wider"
              >
                Add
              </button>
            </div>
          </div>

          {/* Colours */}
          <div className="pt-4 border-t border-[#E8E0D5]">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-2">
              Available Colours
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {STANDARD_COLOURS.map((col) => {
                const active = (formData.colours || []).includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => toggleColour(col)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      active
                        ? 'border-[#292522] bg-[#FAF7F2] text-[#292522] ring-1 ring-[#292522]'
                        : 'border-[#E8E0D5] bg-white text-[#8A7869] hover:border-[#8A7869]'
                    }`}
                  >
                    {col}
                  </button>
                );
              })}
            </div>

            {/* Custom colour input */}
            <div className="flex gap-2 max-w-xs">
              <input
                type="text"
                value={customColourInput}
                onChange={(e) => setCustomColourInput(e.target.value)}
                placeholder="Add custom colour (e.g. Lavender Blush)"
                className="flex-1 px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomColour}
                className="px-3 py-1.5 bg-[#8A7869] text-white text-xs uppercase tracking-wider"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Garment Craft Specifications */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <h2 className="font-serif text-xl text-[#292522] border-b border-[#E8E0D5] pb-3">
            Garment Specifications (Optional)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Fabric &amp; Material
              </label>
              <input
                type="text"
                value={formData.material || ''}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g. 100% Pure Mulberry Silk / Georgette"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Silhouette &amp; Fit
              </label>
              <input
                type="text"
                value={formData.fit || ''}
                onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                placeholder="e.g. Tailored Bodice with Flowing A-Line Hem"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Care Instructions
              </label>
              <input
                type="text"
                value={formData.careInstructions || ''}
                onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                placeholder="e.g. Dry Clean Only. Gentle Steam Ironing."
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Additional Notes &amp; Highlights
              </label>
              <input
                type="text"
                value={formData.additionalDetails || ''}
                onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                placeholder="e.g. Features concealed back zip and organic cotton lining."
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Visibility & Status */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <h2 className="font-serif text-xl text-[#292522] border-b border-[#E8E0D5] pb-3">
            Publishing Status &amp; Badges
          </h2>

          <div className="flex flex-wrap items-center gap-8">
            {/* Status */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-2">
                Catalogue Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'published' })}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold border ${
                    formData.status === 'published'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-[#8A7869] border-[#E8E0D5]'
                  }`}
                >
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'draft' })}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold border ${
                    formData.status === 'draft'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-[#8A7869] border-[#E8E0D5]'
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>

            {/* Featured Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={Boolean(formData.featured)}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-[#292522] rounded focus:ring-0"
              />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                Feature on Homepage
              </span>
            </label>

            {/* New Arrival Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={Boolean(formData.newArrival)}
                onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                className="w-4 h-4 text-[#292522] rounded focus:ring-0"
              />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                Mark as New Arrival
              </span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 bg-white border border-[#D9CEBF] text-[#292522] text-xs uppercase tracking-wider font-medium hover:bg-[#F5EFE6] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-all shadow-md disabled:opacity-50"
          >
            {saving ? 'Saving Garment...' : isEditing ? 'Save Changes' : 'Create Garment'}
          </button>
        </div>
      </form>
    </div>
  );
};
