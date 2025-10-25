// Admin data management page

import { useState, useEffect } from 'react';
import { Download, Eye } from 'lucide-react';
import { getFromStorage, STORAGE_KEYS } from '../utils/storage';
import { SymptomReport } from '../utils/types';
import { decryptData } from '../utils/encryption';
import { GHANA_REGIONS } from '../data/regions';
import { format } from 'date-fns';

export function AdminDataManagement() {
  const [symptoms, setSymptoms] = useState<SymptomReport[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<SymptomReport[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [decryptedIds, setDecryptedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSymptoms();
  }, []);

  useEffect(() => {
    if (!selectedRegion) {
      setFilteredSymptoms(symptoms);
    } else {
      setFilteredSymptoms(symptoms.filter(s => s.region === selectedRegion));
    }
  }, [selectedRegion, symptoms]);

  const loadSymptoms = () => {
    const allSymptoms = getFromStorage<SymptomReport[]>(STORAGE_KEYS.SYMPTOMS, []);
    allSymptoms.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setSymptoms(allSymptoms);
    setFilteredSymptoms(allSymptoms);
  };

  const handleDecrypt = (symptom: SymptomReport) => {
    const decrypted = decryptData(symptom.encrypted);
    if (decrypted) {
      alert(`Decrypted Data:\nUser ID: ${decrypted.userId || 'Anonymous'}\nLocation: ${decrypted.actualLocation || 'Not provided'}`);
      setDecryptedIds(new Set([...decryptedIds, symptom.id]));
    } else {
      alert('Failed to decrypt data');
    }
  };

  const exportToCSV = () => {
    const headers = ['Anonymous_ID', 'Region', 'District', 'Symptoms', 'Date_Onset', 'Age_Group', 'Severity', 'Submitted_Date'];
    
    const rows = filteredSymptoms.map(s => [
      s.anonymousId,
      s.region,
      s.district || '',
      s.symptoms.join('|'),
      s.date,
      s.ageGroup,
      s.severity,
      s.submittedAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `symptom_reports_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Symptom Data Management</h1>
            <p className="text-gray-600">{filteredSymptoms.length} reports found</p>
          </div>
          <button
            onClick={exportToCSV}
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Export to CSV
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 border-2 border-black">
          <label className="block font-bold mb-2">Filter by Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full md:w-64 p-3 border-2 border-black"
          >
            <option value="">All Regions</option>
            {GHANA_REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* Data Table */}
        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3 text-left">Anonymous ID</th>
                <th className="p-3 text-left">Region</th>
                <th className="p-3 text-left">Symptoms</th>
                <th className="p-3 text-center">Age Group</th>
                <th className="p-3 text-center">Severity</th>
                <th className="p-3 text-center">Date</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSymptoms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No symptom reports found
                  </td>
                </tr>
              ) : (
                filteredSymptoms.map((symptom, idx) => (
                  <tr key={symptom.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border-t border-gray-200 font-mono text-xs">
                      {symptom.anonymousId}
                    </td>
                    <td className="p-3 border-t border-gray-200">
                      <div>{symptom.region}</div>
                      {symptom.district && (
                        <div className="text-xs text-gray-600">{symptom.district}</div>
                      )}
                    </td>
                    <td className="p-3 border-t border-gray-200">
                      <div className="max-w-xs">
                        {symptom.symptoms.slice(0, 3).join(', ')}
                        {symptom.symptoms.length > 3 && ` +${symptom.symptoms.length - 3} more`}
                      </div>
                    </td>
                    <td className="p-3 border-t border-gray-200 text-center">
                      {symptom.ageGroup}
                    </td>
                    <td className="p-3 border-t border-gray-200 text-center font-bold">
                      {symptom.severity}/5
                    </td>
                    <td className="p-3 border-t border-gray-200 text-center text-xs">
                      {format(new Date(symptom.submittedAt), 'PP')}
                    </td>
                    <td className="p-3 border-t border-gray-200 text-center">
                      <button
                        onClick={() => handleDecrypt(symptom)}
                        className={`px-3 py-1 text-xs ${
                          decryptedIds.has(symptom.id)
                            ? 'bg-gray-300 text-gray-600'
                            : 'bg-black text-white hover:bg-gray-800'
                        } transition-colors flex items-center gap-1 mx-auto`}
                        disabled={decryptedIds.has(symptom.id)}
                      >
                        <Eye className="h-3 w-3" />
                        {decryptedIds.has(symptom.id) ? 'Viewed' : 'Decrypt'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-500">
          <p className="text-sm">
            <strong>Privacy Notice:</strong> All data is anonymized by default. Use the "Decrypt" button responsibly 
            and only when necessary for public health purposes. All decrypt actions are logged for accountability.
          </p>
        </div>
      </div>
    </div>
  );
}
