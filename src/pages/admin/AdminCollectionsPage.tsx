import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  Edit,
  Trash2,
  FolderTree,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Upload,
} from 'lucide-react';
import {
  getAllCollectionsAdmin,
  createCollection,
  updateCollection,
  deleteCollection,
  toggleCollectionStatus,
} from '../../services/collectionService';
import { uploadProductImage, validateImageFile } from '../../services/storageService';
import type { Collection } from '../../types';
import { slugify } from '../../utils/formatters';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

export const AdminCollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCollection, setEditingCollection] = useState<Partial<Collection> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllCollectionsAdmin();
      setCollections(data);
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCollection({
      name: '',
      slug: '',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
      displayOrder: collections.length + 1,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCollection({ ...col });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (col: Collection) => {
    try {
      const newStatus = await toggleCollectionStatus(col.id, col.status);
      setCollections((prev) =>
        prev.map((c) => (c.id === col.id ? { ...c, status: newStatus } : c))
      );
      setNotice(`"${col.name}" is now ${newStatus}.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error('Failed to toggle collection status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      setDeletingId(null);
      setNotice('Collection removed successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setDeleteError(err.message || 'Cannot delete collection.');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const val = validateImageFile(file);
    if (!val.valid) {
      alert(val.error);
      return;
    }

    try {
      setUploadProgress(10);
      const res = await uploadProductImage(file, 'collections', (p) => setUploadProgress(p));
      setEditingCollection((prev) => ({
        ...prev,
        coverImage: res.url,
        storagePath: res.storagePath,
      }));
      setUploadProgress(null);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
      setUploadProgress(null);
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection?.name?.trim()) {
      alert('Collection name is required.');
      return;
    }

    setSaving(true);
    try {
      const cleanSlug = editingCollection.slug
        ? slugify(editingCollection.slug)
        : slugify(editingCollection.name);

      const payload = {
        ...editingCollection,
        name: editingCollection.name.trim(),
        slug: cleanSlug,
        displayOrder: Number(editingCollection.displayOrder) || 1,
      };

      if (editingCollection.id) {
        await updateCollection(editingCollection.id, payload);
      } else {
        await createCollection(payload as Omit<Collection, 'id'>);
      }

      await loadData();
      setIsModalOpen(false);
      setNotice('Collection saved successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D5] pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
            Catalogue Organisation
          </span>
          <h1 className="font-serif text-3xl text-[#292522] font-normal">
            Boutique Collections ({collections.length})
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#E8DCCB]" />
          <span>Add Collection</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 rounded-sm fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Grid of collections */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#8A7869]">
          Loading collections...
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white p-12 border border-[#E8E0D5] text-center">
          <FolderTree className="w-12 h-12 text-[#D9CEBF] mx-auto mb-3" />
          <p className="text-xs text-[#8A7869]">No collections configured.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-wider font-semibold"
          >
            Create First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-white border border-[#E8E0D5] shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="relative aspect-[16/9] bg-[#F5EFE6] border-b border-[#E8E0D5] overflow-hidden group">
                  <ImageWithFallback
                    src={col.coverImage}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-sm ${
                        col.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {col.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-sm">
                    Order: {col.displayOrder}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2">
                  <h3 className="font-serif text-xl text-[#292522]">{col.name}</h3>
                  <span className="text-[11px] text-[#8A7869] block">
                    /{col.slug}
                  </span>
                  {col.description && (
                    <p className="text-xs text-[#8A7869] line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E0D5] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(col)}
                  className="text-[#8A7869] hover:text-[#292522] flex items-center gap-1 text-[11px]"
                >
                  {col.status === 'published' ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Unpublish</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                      <span>Publish</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(col)}
                    className="p-1.5 text-[#8A7869] hover:text-[#292522]"
                    title="Edit Collection"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(col.id)}
                    className="p-1.5 text-[#8A7869] hover:text-red-700"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Prompt Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full border border-[#E8E0D5] shadow-2xl text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="font-serif text-xl text-[#292522]">Delete Collection?</h3>
            <p className="text-xs text-[#8A7869] leading-relaxed">
              If any garments are currently assigned to this collection, deletion will be blocked to protect catalog integrity.
            </p>
            {deleteError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs text-left rounded-sm">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-700"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => {
                  setDeletingId(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 bg-gray-100 text-[#292522] text-xs font-medium uppercase tracking-wider hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Collection Modal */}
      {isModalOpen && editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 max-w-lg w-full border border-[#E8E0D5] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-3">
              <h3 className="font-serif text-2xl text-[#292522]">
                {editingCollection.id ? 'Edit Collection' : 'Create New Collection'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8A7869] hover:text-[#292522]"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                  Collection Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCollection.name || ''}
                  onChange={(e) =>
                    setEditingCollection({
                      ...editingCollection,
                      name: e.target.value,
                      slug: !editingCollection.id ? slugify(e.target.value) : editingCollection.slug,
                    })
                  }
                  placeholder="e.g. Mulberry Silks &amp; Handloom"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCollection.slug || ''}
                  onChange={(e) =>
                    setEditingCollection({
                      ...editingCollection,
                      slug: slugify(e.target.value),
                    })
                  }
                  placeholder="mulberry-silks"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingCollection.description || ''}
                  onChange={(e) =>
                    setEditingCollection({
                      ...editingCollection,
                      description: e.target.value,
                    })
                  }
                  placeholder="Short introduction for this collection..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] resize-none"
                />
              </div>

              {/* Cover Image Upload / URL */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                  Cover Photo URL
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={editingCollection.coverImage || ''}
                    onChange={(e) =>
                      setEditingCollection({
                        ...editingCollection,
                        coverImage: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
                  />
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] border border-[#D9CEBF] text-[#292522] text-xs cursor-pointer hover:bg-[#F5EFE6]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                    {uploadProgress !== null && (
                      <span className="text-xs text-[#8A7869]">Uploading {uploadProgress}%</span>
                    )}
                  </div>
                </div>

                {editingCollection.coverImage && (
                  <div className="mt-2 w-32 aspect-[16/9] border border-[#E8E0D5] overflow-hidden">
                    <img
                      src={editingCollection.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingCollection.displayOrder || 1}
                    onChange={(e) =>
                      setEditingCollection({
                        ...editingCollection,
                        displayOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                    Status
                  </label>
                  <select
                    value={editingCollection.status || 'published'}
                    onChange={(e) =>
                      setEditingCollection({
                        ...editingCollection,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D9CEBF] text-xs uppercase tracking-wider hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black"
                >
                  {saving ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
