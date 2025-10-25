// Symptom tracker page for collecting symptom data

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { GHANA_REGIONS } from '../data/regions';
import { SYMPTOMS, AGE_GROUPS, Symptom, AgeGroup } from '../data/symptoms';
import { SymptomReport } from '../utils/types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { generateAnonymousId, encryptData } from '../utils/encryption';
import { updatePredictions } from '../utils/predictions';
import { getCurrentUser } from '../utils/auth';

export function SymptomTracker() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    region: '',
    district: '',
    symptoms: [] as Symptom[],
    date: '',
    ageGroup: '' as AgeGroup | '',
    severity: 3
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [anonymousId, setAnonymousId] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSymptomToggle = (symptom: Symptom) => {
    if (formData.symptoms.includes(symptom)) {
      setFormData({
        ...formData,
        symptoms: formData.symptoms.filter(s => s !== symptom)
      });
    } else {
      setFormData({
        ...formData,
        symptoms: [...formData.symptoms, symptom]
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.region) {
      newErrors.push('Please select a region');
    }
    if (formData.symptoms.length === 0) {
      newErrors.push('Please select at least one symptom');
    }
    if (!formData.date) {
      newErrors.push('Please select the date of symptom onset');
    }
    if (!formData.ageGroup) {
      newErrors.push('Please select an age group');
    }
    if (!termsAccepted) {
      newErrors.push('You must accept the terms and conditions');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Get current user if logged in
    const currentUser = getCurrentUser();

    // Generate anonymous ID
    const anonId = generateAnonymousId();

    // Create encrypted data
    const encryptedData = encryptData({
      userId: currentUser?.id || null,
      actualLocation: formData.district || null
    });

    // Create symptom report
    const report: SymptomReport = {
      id: `sym_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      anonymousId: anonId,
      encrypted: encryptedData,
      region: formData.region as any,
      district: formData.district || undefined,
      symptoms: formData.symptoms,
      date: formData.date,
      ageGroup: formData.ageGroup as AgeGroup,
      severity: formData.severity,
      submittedAt: new Date().toISOString()
    };

    // Save to storage
    const symptoms = getFromStorage<SymptomReport[]>(STORAGE_KEYS.SYMPTOMS, []);
    symptoms.push(report);
    saveToStorage(STORAGE_KEYS.SYMPTOMS, symptoms);

    // Update predictions
    updatePredictions();

    // Show success
    setAnonymousId(anonId);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full border-2 border-black p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-lg mb-6">
            Your symptoms have been recorded anonymously. Your contribution helps predict and prevent outbreaks in Ghana.
          </p>
          <div className="bg-gray-100 p-4 mb-6">
            <p className="font-bold mb-2">Your Anonymous ID:</p>
            <p className="text-2xl font-mono">{anonymousId}</p>
            <p className="text-sm text-gray-600 mt-2">
              Save this ID for your records. It cannot be used to identify you.
            </p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-500 p-4 mb-6 text-left">
            <p className="font-bold mb-2">⚠️ Important Reminder:</p>
            <ul className="text-sm space-y-1">
              <li>• Do not self-medicate</li>
              <li>• Seek professional medical advice if symptoms persist or worsen</li>
              <li>• Use the Pharmacy Finder to locate nearby medications if prescribed</li>
            </ul>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => navigate('/pharmacy-finder')}
              className="px-6 py-3 border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Find Pharmacy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Report Your Symptoms</h1>
        <p className="text-gray-600 mb-8">
          Help us track and prevent disease outbreaks by anonymously reporting your symptoms
        </p>

        {errors.length > 0 && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-2">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Region */}
          <div>
            <label className="block font-bold mb-2">
              Region <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full p-3 border-2 border-black"
              required
            >
              <option value="">Select your region</option>
              {GHANA_REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block font-bold mb-2">
              District/City <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full p-3 border-2 border-black"
              placeholder="e.g., Accra Metro, Kumasi"
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block font-bold mb-2">
              Symptoms <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">Select all symptoms you are experiencing:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SYMPTOMS.map(symptom => (
                <label
                  key={symptom}
                  className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-colors ${
                    formData.symptoms.includes(symptom)
                      ? 'border-black bg-gray-100'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.symptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="w-5 h-5"
                  />
                  <span>{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date of Onset */}
          <div>
            <label className="block font-bold mb-2">
              Date of Symptom Onset <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border-2 border-black"
              required
            />
          </div>

          {/* Age Group */}
          <div>
            <label className="block font-bold mb-2">
              Age Group <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ageGroup}
              onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })}
              className="w-full p-3 border-2 border-black"
              required
            >
              <option value="">Select age group</option>
              {AGE_GROUPS.map(group => (
                <option key={group} value={group}>{group} years</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block font-bold mb-2">
              Severity Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm">Mild</span>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm">Severe</span>
              <span className="font-bold text-2xl w-8 text-center">{formData.severity}</span>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-2 border-black p-6 bg-gray-50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 mt-1 flex-shrink-0"
              />
              <div>
                <span className="font-bold">
                  I agree to the terms and conditions <span className="text-red-500">*</span>
                </span>
                <ul className="text-sm mt-2 space-y-1 text-gray-700">
                  <li>• I agree to not self-medicate and will seek professional medical advice</li>
                  <li>• I consent to anonymous data collection for outbreak prediction</li>
                  <li>• I understand this is not a diagnostic tool</li>
                </ul>
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-sm underline mt-2 hover:text-gray-600"
                >
                  View Full Terms & Conditions
                </button>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-black text-white hover:bg-gray-800 transition-colors font-bold text-lg"
          >
            Submit Symptom Report
          </button>
        </form>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-black">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
              
              <div className="space-y-4 text-sm">
                <section>
                  <h3 className="font-bold mb-2">Data Collection & Privacy</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>All data is anonymized and encrypted</li>
                    <li>Only administrators can decrypt identifying information for public health purposes</li>
                    <li>Data is used solely for outbreak prediction and public health monitoring</li>
                    <li>Aggregated data may be shared with Ghana Ministry of Health</li>
                    <li>No personally identifiable information is collected without consent</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold mb-2">Medical Disclaimer</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>This system is NOT a diagnostic tool</li>
                    <li>You must NOT self-medicate based on this system</li>
                    <li>You MUST seek professional medical advice for all health concerns</li>
                    <li>For severe symptoms or medical emergencies, call 112 immediately</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold mb-2">User Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Provide accurate symptom information</li>
                    <li>Report symptoms honestly for public health benefit</li>
                    <li>Follow medical professionals' advice</li>
                    <li>Practice good hygiene and preventive measures</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold mb-2">Data Usage</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Data helps predict disease outbreaks</li>
                    <li>Contributes to public health research</li>
                    <li>Helps allocate healthcare resources</li>
                    <li>Informs public health interventions</li>
                  </ul>
                </section>
              </div>

              <button
                onClick={() => setShowTerms(false)}
                className="mt-6 w-full py-3 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
