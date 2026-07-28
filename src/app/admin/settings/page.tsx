'use client';

import React, { useState, useEffect } from 'react';
import insforge from '@/lib/insforge';

interface ThreeDArtOption {
  id?: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
}

interface NailShape {
  id?: string;
  name: string;
  description?: string;
}

export default function AdminSettingsPage() {
  const [options, setOptions] = useState<ThreeDArtOption[]>([]);
  const [nailShapes, setNailShapes] = useState<NailShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNailShapeForm, setShowNailShapeForm] = useState(false);
  const [editingOption, setEditingOption] = useState<ThreeDArtOption | null>(null);
  const [editingNailShape, setEditingNailShape] = useState<NailShape | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 199,
    is_active: true,
  });
  const [nailShapeFormData, setNailShapeFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchOptions();
    fetchNailShapes();
  }, []);

  const fetchOptions = async () => {
    try {
      const { data, error } = await insforge.database
        .from('three_d_art_options')
        .select('*')
        .order('created_at', { ascending: true });

      if (data && !error) {
        setOptions(data);
      }
    } catch (error) {
      console.error('Error fetching 3D art options:', error);
    }
  };

  const fetchNailShapes = async () => {
    try {
      const { data, error } = await insforge.database
        .from('nail_sizes')
        .select('*')
        .order('name', { ascending: true });

      if (data && !error) {
        setNailShapes(data);
      }
    } catch (error) {
      console.error('Error fetching nail shapes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOption?.id) {
        const { error } = await insforge.database
          .from('three_d_art_options')
          .update(formData)
          .eq('id', editingOption.id);
        if (error) throw error;
      } else {
        const { error } = await insforge.database
          .from('three_d_art_options')
          .insert([formData]);
        if (error) throw error;
      }
      setFormData({ name: '', description: '', price: 199, is_active: true });
      setShowAddForm(false);
      setEditingOption(null);
      fetchOptions();
    } catch (error: any) {
      console.error('Error saving option:', error);
      const errorMessage = error?.message || error?.error?.message || JSON.stringify(error) || 'Unknown error';
      alert(`Failed to save option: ${errorMessage}`);
    }
  };

  const handleEdit = (option: ThreeDArtOption) => {
    setEditingOption(option);
    setFormData({
      name: option.name,
      description: option.description,
      price: option.price,
      is_active: option.is_active,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return;
    try {
      const { error } = await insforge.database
        .from('three_d_art_options')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchOptions();
    } catch (error) {
      console.error('Error deleting option:', error);
      alert('Failed to delete option');
    }
  };

  const handleToggleActive = async (option: ThreeDArtOption) => {
    try {
      const { error } = await insforge.database
        .from('three_d_art_options')
        .update({ is_active: !option.is_active })
        .eq('id', option.id);
      if (error) throw error;
      fetchOptions();
    } catch (error) {
      console.error('Error toggling option:', error);
      alert('Failed to update option');
    }
  };

  const handleNailShapeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNailShape?.id) {
        const { error } = await insforge.database
          .from('nail_sizes')
          .update(nailShapeFormData)
          .eq('id', editingNailShape.id);
        if (error) throw error;
      } else {
        const { error } = await insforge.database
          .from('nail_sizes')
          .insert([nailShapeFormData]);
        if (error) throw error;
      }
      setNailShapeFormData({ name: '', description: '' });
      setShowNailShapeForm(false);
      setEditingNailShape(null);
      fetchNailShapes();
    } catch (error: any) {
      console.error('Error saving nail shape:', error);
      const errorMessage = error?.message || error?.error?.message || JSON.stringify(error) || 'Unknown error';
      alert(`Failed to save nail shape: ${errorMessage}`);
    }
  };

  const handleEditNailShape = (shape: NailShape) => {
    setEditingNailShape(shape);
    setNailShapeFormData({
      name: shape.name,
      description: shape.description || '',
    });
    setShowNailShapeForm(true);
  };

  const handleDeleteNailShape = async (id: string) => {
    if (!confirm('Are you sure you want to delete this nail shape?')) return;
    try {
      const { error } = await insforge.database
        .from('nail_sizes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchNailShapes();
    } catch (error) {
      console.error('Error deleting nail shape:', error);
      alert('Failed to delete nail shape');
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Settings</h1>
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Settings</h1>

      {/* 3D Art Options Section */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">3D Art Options</h2>
          <button
            onClick={() => {
              setEditingOption(null);
              setFormData({ name: '', description: '', price: 199, is_active: true });
              setShowAddForm(!showAddForm);
            }}
            className="bg-gradient-to-r from-rose-gold to-blush-pink text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            {showAddForm ? 'Cancel' : 'Add Option'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="glass-card-strong rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Option Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-rose-gold/30"
                  placeholder="e.g., Yes, contains 3d art"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-rose-gold/30"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 resize-none focus:ring-2 focus:ring-rose-gold/30"
                placeholder="Describe this option..."
                required
              />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-rose-gold/30 text-rose-gold focus:ring-rose-gold/30"
              />
              <label htmlFor="isActive" className="text-sm text-foreground">Active</label>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-rose-gold to-blush-pink text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              {editingOption?.id ? 'Update Option' : 'Add Option'}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {options.length === 0 ? (
            <p className="text-foreground/60 text-center py-8">No 3D art options configured yet</p>
          ) : (
            options.map((option) => (
              <div
                key={option.id}
                className={`glass-card-strong rounded-xl p-4 flex items-center justify-between transition-all ${
                  !option.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{option.name}</h3>
                    <span className="font-bold text-rose-gold">₹{option.price}</span>
                    {!option.is_active && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70 mt-1">{option.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(option)}
                    className="text-sm px-3 py-1 rounded-lg border border-rose-gold/30 hover:bg-rose-gold/10 transition-colors"
                  >
                    {option.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(option)}
                    className="text-sm px-3 py-1 rounded-lg border border-rose-gold/30 hover:bg-rose-gold/10 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(option.id!)}
                    className="text-sm px-3 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Nail Shapes Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">Nail Shapes</h2>
          <button
            onClick={() => {
              setEditingNailShape(null);
              setNailShapeFormData({ name: '', description: '' });
              setShowNailShapeForm(!showNailShapeForm);
            }}
            className="bg-gradient-to-r from-rose-gold to-blush-pink text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            {showNailShapeForm ? 'Cancel' : 'Add Shape'}
          </button>
        </div>

        {showNailShapeForm && (
          <form onSubmit={handleNailShapeSubmit} className="glass-card-strong rounded-xl p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Shape Name</label>
              <input
                type="text"
                value={nailShapeFormData.name}
                onChange={(e) => setNailShapeFormData({ ...nailShapeFormData, name: e.target.value })}
                className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-rose-gold/30"
                placeholder="e.g., Long Oval"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={nailShapeFormData.description}
                onChange={(e) => setNailShapeFormData({ ...nailShapeFormData, description: e.target.value })}
                rows={3}
                className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 resize-none focus:ring-2 focus:ring-rose-gold/30"
                placeholder="Describe this nail shape..."
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-rose-gold to-blush-pink text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              {editingNailShape?.id ? 'Update Shape' : 'Add Shape'}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {nailShapes.length === 0 ? (
            <p className="text-foreground/60 text-center py-8">No nail shapes configured yet</p>
          ) : (
            nailShapes.map((shape) => (
              <div
                key={shape.id}
                className="glass-card-strong rounded-xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{shape.name}</h3>
                  </div>
                  {shape.description && (
                    <p className="text-sm text-foreground/70 mt-1">{shape.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditNailShape(shape)}
                    className="text-sm px-3 py-1 rounded-lg border border-rose-gold/30 hover:bg-rose-gold/10 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNailShape(shape.id!)}
                    className="text-sm px-3 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
