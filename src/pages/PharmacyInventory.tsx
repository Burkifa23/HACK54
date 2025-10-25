// Pharmacy inventory management

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { Pharmacy, Medication, MedicationCategory, User } from '../utils/types';

const CATEGORIES: MedicationCategory[] = [
  'Antibiotic',
  'Pain Relief',
  'Rehydration',
  'Antimalarial',
  'Antidiarrheal',
  'Other'
];

interface PharmacyInventoryProps {
  user: User;
}

export function PharmacyInventory({ user }: PharmacyInventoryProps) {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: '',
    generic: '',
    category: 'Antibiotic',
    price: 0,
    stock: 0,
    expiry: '',
    manufacturer: ''
  });

  useEffect(() => {
    loadPharmacy();
  }, [user]);

  const loadPharmacy = () => {
    const pharmacies = getFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);
    const found = pharmacies.find(p => p.username === user.username);
    if (found) {
      setPharmacy(found);
    }
  };

  const savePharmacy = (updatedPharmacy: Pharmacy) => {
    const pharmacies = getFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);
    const index = pharmacies.findIndex(p => p.id === updatedPharmacy.id);
    if (index !== -1) {
      pharmacies[index] = updatedPharmacy;
      saveToStorage(STORAGE_KEYS.PHARMACIES, pharmacies);
      setPharmacy(updatedPharmacy);
    }
  };

  const handleAdd = () => {
    if (!pharmacy || !formData.name || !formData.price || !formData.stock || !formData.expiry) {
      alert('Please fill in all required fields');
      return;
    }

    const newMed: Medication = {
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      generic: formData.generic || undefined,
      category: formData.category as MedicationCategory,
      price: formData.price,
      stock: formData.stock,
      expiry: formData.expiry,
      manufacturer: formData.manufacturer || undefined
    };

    const updated = {
      ...pharmacy,
      inventory: [...pharmacy.inventory, newMed]
    };

    savePharmacy(updated);
    setShowAddForm(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!pharmacy || !editingMed || !formData.name || !formData.price || !formData.stock || !formData.expiry) {
      alert('Please fill in all required fields');
      return;
    }

    const updated = {
      ...pharmacy,
      inventory: pharmacy.inventory.map(m =>
        m.id === editingMed.id
          ? {
              ...m,
              name: formData.name!,
              generic: formData.generic || undefined,
              category: formData.category as MedicationCategory,
              price: formData.price!,
              stock: formData.stock!,
              expiry: formData.expiry!,
              manufacturer: formData.manufacturer || undefined
            }
          : m
      )
    };

    savePharmacy(updated);
    setEditingMed(null);
    resetForm();
  };

  const handleDelete = (medId: string) => {
    if (!pharmacy) return;
    
    if (confirm('Are you sure you want to delete this medication?')) {
      const updated = {
        ...pharmacy,
        inventory: pharmacy.inventory.filter(m => m.id !== medId)
      };
      savePharmacy(updated);
    }
  };

  const startEdit = (med: Medication) => {
    setEditingMed(med);
    setFormData(med);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      generic: '',
      category: 'Antibiotic',
      price: 0,
      stock: 0,
      expiry: '',
      manufacturer: ''
    });
  };

  const getStockWarning = (stock: number) => {
    if (stock < 10) {
      return 'text-red-500 font-bold';
    } else if (stock < 50) {
      return 'text-yellow-600 font-bold';
    }
    return '';
  };

  const isExpiringSoon = (expiry: string) => {
    const expiryDate = new Date(expiry);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  };

  if (!pharmacy) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Inventory Management</h1>
            <p className="text-gray-600">{pharmacy.inventory.length} medications in stock</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingMed(null);
              resetForm();
            }}
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Medication
          </button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingMed) && (
          <div className="mb-8 border-2 border-black p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">
              {editingMed ? 'Edit Medication' : 'Add New Medication'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-bold mb-2">Medication Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border-2 border-black"
                  placeholder="e.g., Ciprofloxacin 500mg"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Generic Name</label>
                <input
                  type="text"
                  value={formData.generic}
                  onChange={(e) => setFormData({ ...formData, generic: e.target.value })}
                  className="w-full p-3 border-2 border-black"
                  placeholder="e.g., Ciprofloxacin"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MedicationCategory })}
                  className="w-full p-3 border-2 border-black"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2">Price (GHS) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full p-3 border-2 border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full p-3 border-2 border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Expiry Date *</label>
                <input
                  type="date"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  className="w-full p-3 border-2 border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full p-3 border-2 border-black"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={editingMed ? handleUpdate : handleAdd}
                className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                {editingMed ? 'Update' : 'Add'} Medication
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMed(null);
                  resetForm();
                }}
                className="px-6 py-3 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3 text-left">Medication</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">Price (GHS)</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-center">Expiry</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pharmacy.inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No medications in inventory. Click "Add Medication" to get started.
                  </td>
                </tr>
              ) : (
                pharmacy.inventory.map((med, idx) => (
                  <tr key={med.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border-t border-gray-200">
                      <div className="font-bold">{med.name}</div>
                      {med.generic && <div className="text-sm text-gray-600">{med.generic}</div>}
                    </td>
                    <td className="p-3 border-t border-gray-200">{med.category}</td>
                    <td className="p-3 border-t border-gray-200 text-right font-bold">
                      {med.price.toFixed(2)}
                    </td>
                    <td className={`p-3 border-t border-gray-200 text-center ${getStockWarning(med.stock)}`}>
                      {med.stock}
                      {med.stock < 10 && (
                        <div className="flex items-center justify-center gap-1 text-xs mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          Low
                        </div>
                      )}
                    </td>
                    <td className={`p-3 border-t border-gray-200 text-center ${isExpiringSoon(med.expiry) ? 'text-red-500 font-bold' : ''}`}>
                      {med.expiry}
                      {isExpiringSoon(med.expiry) && (
                        <div className="flex items-center justify-center gap-1 text-xs mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          Soon
                        </div>
                      )}
                    </td>
                    <td className="p-3 border-t border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(med)}
                          className="p-2 hover:bg-gray-200 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="p-2 hover:bg-red-100 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
