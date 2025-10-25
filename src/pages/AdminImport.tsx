// Admin CSV import page

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { HistoricalData } from '../utils/types';
import { GHANA_REGIONS } from '../data/regions';
import { updatePredictions } from '../utils/predictions';

export function AdminImport() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(['Please upload a CSV file']);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setSuccess(false);

    // Read and parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(selectedFile);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      setErrors(['CSV file is empty or invalid']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['Date', 'Region', 'Disease', 'Confirmed_Cases', 'Population'];

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
      return;
    }

    const data: any[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < Math.min(lines.length, 11); i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};

      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      // Validate row
      if (!row.Date || !row.Region || !row.Disease || !row.Confirmed_Cases || !row.Population) {
        parseErrors.push(`Row ${i}: Missing required fields`);
        continue;
      }

      if (!GHANA_REGIONS.includes(row.Region as any)) {
        parseErrors.push(`Row ${i}: Invalid region "${row.Region}"`);
        continue;
      }

      if (!['Typhoid', 'Cholera'].includes(row.Disease)) {
        parseErrors.push(`Row ${i}: Disease must be "Typhoid" or "Cholera"`);
        continue;
      }

      const cases = parseInt(row.Confirmed_Cases);
      if (isNaN(cases) || cases < 0) {
        parseErrors.push(`Row ${i}: Invalid confirmed cases`);
        continue;
      }

      data.push(row);
    }

    setPreview(data);
    setErrors(parseErrors);
  };

  const handleImport = () => {
    if (preview.length === 0) {
      setErrors(['No valid data to import']);
      return;
    }

    const historicalData = getFromStorage<HistoricalData[]>(STORAGE_KEYS.HISTORICAL_DATA, []);

    preview.forEach(row => {
      const newData: HistoricalData = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: row.Date,
        region: row.Region,
        district: row.District || undefined,
        disease: row.Disease,
        confirmedCases: parseInt(row.Confirmed_Cases),
        population: parseInt(row.Population),
        deaths: parseInt(row.Deaths) || 0,
        hospitalized: parseInt(row.Hospitalized) || 0,
        importedAt: new Date().toISOString()
      };

      historicalData.push(newData);
    });

    saveToStorage(STORAGE_KEYS.HISTORICAL_DATA, historicalData);

    // Update predictions
    updatePredictions();

    setSuccess(true);
    setFile(null);
    setPreview([]);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Import Historical Outbreak Data</h1>
        <p className="text-gray-600 mb-8">
          Upload CSV files containing past outbreak data to improve prediction accuracy
        </p>

        {success && (
          <div className="mb-6 p-4 border-2 border-green-500 bg-green-50 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Import Successful!</p>
              <p className="text-sm">
                {preview.length} records imported and predictions have been recalculated.
              </p>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-2">Validation Errors:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* CSV Format Instructions */}
        <div className="mb-8 border-2 border-black p-6">
          <h2 className="text-2xl font-bold mb-4">Required CSV Format</h2>
          <p className="mb-4">Your CSV file must include the following columns:</p>
          
          <div className="bg-gray-100 p-4 mb-4 font-mono text-sm overflow-x-auto">
            Date,Region,District,Disease,Confirmed_Cases,Population,Deaths,Hospitalized
          </div>

          <div className="space-y-2 text-sm">
            <div><strong>Date:</strong> YYYY-MM-DD format (e.g., 2024-01-15)</div>
            <div><strong>Region:</strong> Must match one of the 16 Ghana regions exactly</div>
            <div><strong>District:</strong> Optional, free text</div>
            <div><strong>Disease:</strong> Must be "Typhoid" or "Cholera"</div>
            <div><strong>Confirmed_Cases:</strong> Number of confirmed cases</div>
            <div><strong>Population:</strong> Population of affected area</div>
            <div><strong>Deaths:</strong> Number of deaths (optional)</div>
            <div><strong>Hospitalized:</strong> Number hospitalized (optional)</div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="border-2 border-black p-8">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-400 hover:border-black transition-colors">
              <Upload className="h-12 w-12 mb-4 text-gray-400" />
              <p className="font-bold mb-2">Click to upload CSV file</p>
              <p className="text-sm text-gray-600">or drag and drop</p>
              {file && <p className="text-sm mt-4 font-bold">{file.name}</p>}
            </div>
          </label>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              Preview ({preview.length} valid rows)
            </h2>
            <div className="border-2 border-black overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Region</th>
                    <th className="p-3 text-left">Disease</th>
                    <th className="p-3 text-right">Cases</th>
                    <th className="p-3 text-right">Deaths</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 border-t border-gray-200">{row.Date}</td>
                      <td className="p-3 border-t border-gray-200">{row.Region}</td>
                      <td className="p-3 border-t border-gray-200">{row.Disease}</td>
                      <td className="p-3 border-t border-gray-200 text-right">
                        {row.Confirmed_Cases}
                      </td>
                      <td className="p-3 border-t border-gray-200 text-right">
                        {row.Deaths || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              className="w-full py-4 bg-black text-white hover:bg-gray-800 transition-colors font-bold"
              disabled={errors.length > 0}
            >
              Confirm Import ({preview.length} records)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
