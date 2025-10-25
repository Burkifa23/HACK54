// Pharmacy finder page

import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, DollarSign, Package } from 'lucide-react';
import { getFromStorage, STORAGE_KEYS } from '../utils/storage';
import { Pharmacy, Medication, PriceFilter } from '../utils/types';
import { GHANA_REGIONS } from '../data/regions';

export function PharmacyFinder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [results, setResults] = useState<Array<{
    pharmacy: Pharmacy;
    medication: Medication;
    distance: number;
  }>>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const pharmacies = getFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);
    const allResults: typeof results = [];

    pharmacies.forEach(pharmacy => {
      // Skip inactive pharmacies
      if (pharmacy.status !== 'active') return;

      // Filter by region if selected
      if (selectedRegion && pharmacy.region !== selectedRegion) return;

      // Search in inventory
      pharmacy.inventory.forEach(medication => {
        const matchesSearch =
          !searchTerm ||
          medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medication.generic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medication.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return;

        // Apply price filter
        const matchesPrice =
          priceFilter === 'all' ||
          (priceFilter === 'budget' && medication.price < 20) ||
          (priceFilter === 'medium' && medication.price >= 20 && medication.price <= 50) ||
          (priceFilter === 'premium' && medication.price > 50);

        if (!matchesPrice) return;

        // Generate random distance for MVP
        const distance = Math.floor(Math.random() * 50) + 1;

        allResults.push({
          pharmacy,
          medication,
          distance
        });
      });
    });

    // Sort by distance
    allResults.sort((a, b) => a.distance - b.distance);

    setResults(allResults);
    setSearched(true);
  };

  const getStockStatus = (stock: number) => {
    if (stock >= 50) {
      return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' };
    } else if (stock >= 10) {
      return { text: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    } else {
      return { text: 'Very Low Stock', color: 'text-red-600', bg: 'bg-red-50' };
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Find Affordable Pharmacies</h1>
        <p className="text-gray-600 mb-8">
          Search for medications and find nearby pharmacies with the best prices
        </p>

        {/* Search Form */}
        <div className="border-2 border-black p-6 mb-8">
          <div className="space-y-4">
            {/* Medication Search */}
            <div>
              <label className="block font-bold mb-2">Search Medication</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g., Ciprofloxacin, ORS, Paracetamol"
                  className="flex-1 p-3 border-2 border-black"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region Filter */}
              <div>
                <label className="block font-bold mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-3 border-2 border-black"
                >
                  <option value="">All Regions</option>
                  {GHANA_REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block font-bold mb-2">Price Range</label>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'All Prices' },
                    { value: 'budget', label: '< GHS 20' },
                    { value: 'medium', label: 'GHS 20-50' },
                    { value: 'premium', label: '> GHS 50' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPriceFilter(option.value as PriceFilter)}
                      className={`flex-1 py-2 border-2 transition-colors ${
                        priceFilter === option.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {results.length} Result{results.length !== 1 ? 's' : ''} Found
            </h2>

            {results.length === 0 ? (
              <div className="text-center py-12 border-2 border-gray-300">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600">
                  No pharmacies found matching your criteria
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, idx) => {
                  const stockStatus = getStockStatus(result.medication.stock);
                  
                  return (
                    <div key={idx} className="border-2 border-black p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{result.pharmacy.name}</h3>
                          
                          <div className="flex items-start gap-2 text-sm mb-2">
                            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{result.pharmacy.address}, {result.pharmacy.region}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm mb-2">
                            <Phone className="h-4 w-4" />
                            <span>{result.pharmacy.phone}</span>
                          </div>

                          <div className="text-sm text-gray-600">
                            Distance: ~{result.distance}km
                          </div>
                        </div>

                        <div className="border-l-0 md:border-l-2 border-t-2 md:border-t-0 border-black pt-4 md:pt-0 md:pl-6">
                          <div className="mb-3">
                            <div className="font-bold text-lg mb-1">{result.medication.name}</div>
                            {result.medication.generic && (
                              <div className="text-sm text-gray-600">
                                Generic: {result.medication.generic}
                              </div>
                            )}
                            <div className="text-sm text-gray-600">
                              Category: {result.medication.category}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="h-5 w-5" />
                            <span className="text-2xl font-bold">GHS {result.medication.price.toFixed(2)}</span>
                          </div>

                          <div className={`inline-block px-3 py-1 ${stockStatus.bg} ${stockStatus.color} font-bold text-sm mb-3`}>
                            {stockStatus.text} ({result.medication.stock} units)
                          </div>

                          <button
                            onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(result.pharmacy.address)}`, '_blank')}
                            className="w-full py-2 bg-black text-white hover:bg-gray-800 transition-colors"
                          >
                            Get Directions
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
