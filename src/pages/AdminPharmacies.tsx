// Admin pharmacy management

import { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { Pharmacy } from '../utils/types';
import { GHANA_REGIONS, GhanaRegion } from '../data/regions';
import { hashPassword } from '../utils/encryption';

export function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    license: '',
    region: '' as GhanaRegion | '',
    address: '',
    phone: '',
    email: '',
    operatingHours: ''
  });

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = () => {
    const allPharmacies = getFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);
    setPharmacies(allPharmacies);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      license: '',
      region: '',
      address: '',
      phone: '',
      email: '',
      operatingHours: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.username || !formData.password || !formData.license || !formData.region || !formData.address || !formData.phone || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    const allPharmacies = getFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);

    // Check if username already exists
    if (allPharmacies.some(p => p.username === formData.username)) {
      alert('Username already exists');
      return;
    }

    const newPharmacy: Pharmacy = {
      id: `ph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      username: formData.username,
      password: hashPassword(formData.password),
      license: formData.license,
      region: formData.region as GhanaRegion,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      operatingHours: formData.operatingHours || undefined,
      status: 'active',
      inventory: [],
      createdAt: new Date().toISOString()
    };

    allPharmacies.push(newPharmacy);
    saveToStorage(STORAGE_KEYS.PHARMACIES, allPharmacies);

    // Also add to users list
    const users = getFromStorage<any[]>(STORAGE_KEYS.USERS, []);
    users.push({
      id: newPharmacy.id,
      username: newPharmacy.username,
      password: newPharmacy.password,
      email: newPharmacy.email,
      role: 'pharmacy',
      createdAt: newPharmacy.createdAt
    });
    saveToStorage(STORAGE_KEYS.USERS, users);

    loadPharmacies();
    setShowForm(false);
    resetForm();
    alert('Pharmacy account created successfully!');
  };

  const toggleStatus = (pharmacy: Pharmacy) => {
    const allPharmacies = getFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);
    const updated = allPharmacies.map(p =>
      p.id === pharmacy.id
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    );
    saveToStorage(STORAGE_KEYS.PHARMACIES, updated);
    loadPharmacies();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Pharmacy Management</h1>
            <p className="text-gray-600">{pharmacies.length} registered pharmacies</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              resetForm();
            }}
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Pharmacy Account
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 border-2 border-black p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">Create New Pharmacy Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Pharmacy Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border-2 border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">License Number *</label>
                  <input
                    type="text"
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    className="w-full p-3 border-2 border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-3 border-2 border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-3 border-2 border-black"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Region *</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value as GhanaRegion })}
                    className="w-full p-3 border-2 border-black"
                    required
                  >
                    <option value="">Select region</option>
                    {GHANA_REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 border-2 border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border-2 border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Operating Hours</label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    className="w-full p-3 border-2 border-black"
                    placeholder="e.g., Mon-Sat: 8AM-8PM"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 border-2 border-black"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border-2 border-black hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pharmacies List */}
        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Region</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No pharmacies registered yet
                  </td>
                </tr>
              ) : (
                pharmacies.map((pharmacy, idx) => (
                  <tr key={pharmacy.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border-t border-gray-200">
                      <div className="font-bold">{pharmacy.name}</div>
                      <div className="text-xs text-gray-600">{pharmacy.license}</div>
                    </td>
                    <td className="p-3 border-t border-gray-200">{pharmacy.region}</td>
                    <td className="p-3 border-t border-gray-200 font-mono text-sm">
                      {pharmacy.username}
                    </td>
                    <td className="p-3 border-t border-gray-200 text-sm">
                      <div>{pharmacy.phone}</div>
                      <div className="text-gray-600">{pharmacy.email}</div>
                    </td>
                    <td className="p-3 border-t border-gray-200 text-center">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-bold ${
                          pharmacy.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {pharmacy.status}
                      </span>
                    </td>
                    <td className="p-3 border-t border-gray-200 text-center">
                      <button
                        onClick={() => toggleStatus(pharmacy)}
                        className="text-sm underline hover:text-gray-600"
                      >
                        {pharmacy.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
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
