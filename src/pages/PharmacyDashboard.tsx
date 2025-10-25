// Pharmacy dashboard

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, Clock, Plus } from 'lucide-react';
import { getFromStorage, STORAGE_KEYS } from '../utils/storage';
import { Pharmacy, Medication } from '../utils/types';
import { User } from '../utils/types';

interface PharmacyDashboardProps {
  user: User;
}

export function PharmacyDashboard({ user }: PharmacyDashboardProps) {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [stats, setStats] = useState({
    totalMedications: 0,
    lowStock: 0,
    expiringSoon: 0
  });

  useEffect(() => {
    const pharmacies = getFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);
    const found = pharmacies.find(p => p.username === user.username);
    
    if (found) {
      setPharmacy(found);

      // Calculate stats
      const lowStock = found.inventory.filter(m => m.stock < 10).length;
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringSoon = found.inventory.filter(
        m => new Date(m.expiry) <= thirtyDaysFromNow
      ).length;

      setStats({
        totalMedications: found.inventory.length,
        lowStock,
        expiringSoon
      });
    }
  }, [user]);

  if (!pharmacy) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading pharmacy data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">{pharmacy.name}</h1>
        <p className="text-gray-600 mb-8">Manage your inventory and pharmacy profile</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 border-2 border-black">
            <Package className="h-8 w-8 mb-3" />
            <div className="text-3xl font-bold mb-1">{stats.totalMedications}</div>
            <div className="font-bold">Total Medications</div>
            <div className="text-sm text-gray-600">In inventory</div>
          </div>

          <div className={`p-6 border-2 ${stats.lowStock > 0 ? 'border-yellow-500 bg-yellow-50' : 'border-black'}`}>
            <AlertTriangle className={`h-8 w-8 mb-3 ${stats.lowStock > 0 ? 'text-yellow-500' : ''}`} />
            <div className={`text-3xl font-bold mb-1 ${stats.lowStock > 0 ? 'text-yellow-500' : ''}`}>
              {stats.lowStock}
            </div>
            <div className="font-bold">Low Stock Alerts</div>
            <div className="text-sm text-gray-600">Less than 10 units</div>
          </div>

          <div className={`p-6 border-2 ${stats.expiringSoon > 0 ? 'border-red-500 bg-red-50' : 'border-black'}`}>
            <Clock className={`h-8 w-8 mb-3 ${stats.expiringSoon > 0 ? 'text-red-500' : ''}`} />
            <div className={`text-3xl font-bold mb-1 ${stats.expiringSoon > 0 ? 'text-red-500' : ''}`}>
              {stats.expiringSoon}
            </div>
            <div className="font-bold">Expiring Soon</div>
            <div className="text-sm text-gray-600">Within 30 days</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/pharmacy/inventory"
              className="p-6 border-2 border-black hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-lg mb-1">Manage Inventory</div>
                <div className="text-sm text-gray-600">Add, edit, or remove medications</div>
              </div>
              <Plus className="h-6 w-6" />
            </Link>

            <Link
              to="/pharmacy/inventory"
              className="p-6 border-2 border-black hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-lg mb-1">View Full Inventory</div>
                <div className="text-sm text-gray-600">See all medications and stock levels</div>
              </div>
              <Package className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Pharmacy Info */}
        <div className="border-2 border-black p-6">
          <h2 className="text-2xl font-bold mb-4">Pharmacy Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-bold mb-1">License Number:</div>
              <div className="text-gray-700">{pharmacy.license}</div>
            </div>
            <div>
              <div className="font-bold mb-1">Region:</div>
              <div className="text-gray-700">{pharmacy.region}</div>
            </div>
            <div>
              <div className="font-bold mb-1">Address:</div>
              <div className="text-gray-700">{pharmacy.address}</div>
            </div>
            <div>
              <div className="font-bold mb-1">Phone:</div>
              <div className="text-gray-700">{pharmacy.phone}</div>
            </div>
            <div>
              <div className="font-bold mb-1">Email:</div>
              <div className="text-gray-700">{pharmacy.email}</div>
            </div>
            {pharmacy.operatingHours && (
              <div>
                <div className="font-bold mb-1">Operating Hours:</div>
                <div className="text-gray-700">{pharmacy.operatingHours}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
