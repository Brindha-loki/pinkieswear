'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import insforge from '@/lib/insforge';
import { ImagePreview } from '@/components/admin/ImagePreview';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = ['gloss', '3d', 'glitter', 'ombre', 'french', 'floral', 'abstract', 'minimal', 'bold'];
const EMPTY_FORM = { name: '', description: '', price: '', category: '', is_active: true };

async function uploadProductImage(dataUrl: string, productName: string): Promise<string> {
  const parts = dataUrl.split(';base64,');
  const mimeType = parts[0].split(':')[1];
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  const blob = new Blob([u8arr], { type: mimeType });

  const slug = productName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
  const fileName = `${slug}-${Date.now()}.jpg`;

  const { data, error } = await insforge.storage.from('reference-images').upload(fileName, blob);
  if (error) throw new Error('Image upload failed: ' + error.message);

  const { data: urlData } = insforge.storage.from('reference-images').getPublicUrl(fileName);
  if (!urlData?.publicUrl) throw new Error('Failed to get public URL for product image');
  return urlData.publicUrl;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await insforge.database
        .from('gallery_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImagePreview('');
    setImageFile('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ name: p.name, description: p.description || '', price: p.price.toString(), category: p.category || '', is_active: p.is_active });
    setImagePreview(p.image_url || '');
    setImageFile('');
    setShowForm(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageFile(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    setSaving(true);
    try {
      let finalImageUrl = editingProduct?.image_url || '';

      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile, formData.name);
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image_url: finalImageUrl || null,
        category: formData.category || null,
        is_active: formData.is_active,
      };

      if (editingProduct) {
        const { error } = await insforge.database.from('gallery_products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await insforge.database.from('gallery_products').insert([payload]);
        if (error) throw error;
      }

      setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert('Failed to save product: ' + (err.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      const { error } = await insforge.database.from('gallery_products').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await insforge.database.from('gallery_products').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Edit Gallery</h1>
          <p className="text-sm text-foreground/50 mt-1">Add, edit, or remove gallery products</p>
        </div>
        <button
          onClick={openAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"
        >
          + Add Product
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 mb-6 border border-rose-gold/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground text-lg">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-foreground/40 hover:text-foreground text-xl">?</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-gold/20 bg-white focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Price (?) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-gold/20 bg-white focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none text-sm"
                  required min="0" step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-gold/20 bg-white focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none text-sm"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-rose-gold"
                />
                <label htmlFor="isActive" className="text-sm text-foreground">Active (visible in gallery)</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-gold/20 bg-white focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none resize-none text-sm"
                rows={3}
                placeholder="Describe this nail design..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Product Image</label>
              <div
                className="border-2 border-dashed border-rose-gold/30 rounded-xl p-5 text-center hover:border-rose-gold/60 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-40 h-40 object-contain rounded-xl mx-auto" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImagePreview(''); setImageFile(''); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                    >?</button>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">???</div>
                    <p className="text-sm text-foreground/60">Click to upload product image</p>
                    <p className="text-xs text-foreground/40 mt-1">JPG, PNG, WebP supported</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 text-sm"
              >
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-rose-gold/30 text-foreground rounded-xl font-medium hover:bg-rose-gold/5 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12 text-foreground/50">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">??</div>
          <p className="text-foreground/60">No gallery products yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} className="glass-card rounded-2xl overflow-hidden group">
              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-baby-pink to-blush-pink">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">??</div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {product.is_active ? 'Live' : 'Hidden'}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-semibold text-foreground text-sm truncate">{product.name}</p>
                {product.category && <p className="text-xs text-foreground/50 mb-1">{product.category}</p>}
                <p className="text-rose-gold font-bold text-sm">?{product.price}</p>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 py-1.5 text-xs font-medium bg-rose-gold/10 hover:bg-rose-gold/20 text-rose-gold rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(product.id, product.is_active)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${product.is_active ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
                  >
                    {product.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="py-1.5 px-2 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                  >
                    ??
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[900] bg-black/60 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">???</div>
              <h3 className="font-serif text-lg font-bold text-foreground mb-1">Delete Product?</h3>
              <p className="text-sm text-foreground/60">
                <strong>{products.find(p => p.id === deleteConfirm)?.name}</strong> will be permanently removed from the gallery.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-rose-gold/20 text-foreground rounded-xl text-sm font-medium hover:bg-rose-gold/5">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
