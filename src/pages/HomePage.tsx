// Homepage with outbreak dashboard

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Building2, FileText, TrendingUp } from 'lucide-react';
import { getFromStorage, STORAGE_KEYS } from '../utils/storage';
import { PredictionsCache, SymptomReport, Pharmacy, BlogPost } from '../utils/types';
import { RiskPercentage } from '../components/RiskBadge';
import { updatePredictions } from '../utils/predictions';
import { format } from 'date-fns';

export function HomePage() {
  const [predictions, setPredictions] = useState<PredictionsCache | null>(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    pharmacies: 0,
    blogPosts: 0,
    highRiskRegions: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load predictions
    let predictionsData = getFromStorage<PredictionsCache | null>(STORAGE_KEYS.PREDICTIONS, null);
    
    // If no predictions exist, calculate them
    if (!predictionsData) {
      updatePredictions();
      predictionsData = getFromStorage<PredictionsCache | null>(STORAGE_KEYS.PREDICTIONS, null);
    }
    
    setPredictions(predictionsData);

    // Load statistics
    const symptoms = getFromStorage<SymptomReport[]>(STORAGE_KEYS.SYMPTOMS, []);
    const pharmacies = getFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);
    const blogPosts = getFromStorage<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, []);
    
    // Count reports from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReports = symptoms.filter(s => new Date(s.submittedAt) >= thirtyDaysAgo);
    
    // Count high risk regions
    const highRisk = predictionsData?.regions.filter(
      r => r.typhoid >= 70 || r.cholera >= 70
    ).length || 0;

    setStats({
      totalReports: recentReports.length,
      pharmacies: pharmacies.filter(p => p.status === 'active').length,
      blogPosts: blogPosts.filter(p => p.status === 'published').length,
      highRiskRegions: highRisk
    });
  };

  if (!predictions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading outbreak predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl mb-4">
            Ghana Disease Outbreak Prediction System
          </h1>
          <p className="text-xl text-gray-300">
            Real-time monitoring and prediction of typhoid and cholera outbreaks across all regions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<TrendingUp className="h-8 w-8" />}
            label="Symptom Reports"
            value={stats.totalReports}
            subtitle="Last 30 days"
          />
          <StatCard
            icon={<Building2 className="h-8 w-8" />}
            label="Partner Pharmacies"
            value={stats.pharmacies}
            subtitle="Active locations"
          />
          <StatCard
            icon={<FileText className="h-8 w-8" />}
            label="Health Articles"
            value={stats.blogPosts}
            subtitle="Published"
          />
          <StatCard
            icon={<AlertTriangle className="h-8 w-8" />}
            label="High Risk Regions"
            value={stats.highRiskRegions}
            subtitle="Requiring attention"
            alert={stats.highRiskRegions > 0}
          />
        </div>

        {/* High Risk Alert */}
        {stats.highRiskRegions > 0 && (
          <div className="mb-8 p-4 border-2 border-red-500 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-1">⚠️ High Risk Alert</h3>
                <p className="text-gray-700">
                  {stats.highRiskRegions} region{stats.highRiskRegions > 1 ? 's' : ''} currently showing high outbreak probability (≥70%). 
                  Please review the regional data below and take preventive measures.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Regional Outbreak Tables */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Regional Outbreak Risk Assessment</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Typhoid Table */}
            <div className="border-2 border-black">
              <div className="bg-black text-white p-4">
                <h3 className="text-xl font-bold">Typhoid Risk by Region</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left border-b-2 border-black">Region</th>
                      <th className="p-3 text-center border-b-2 border-black">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.regions
                      .sort((a, b) => b.typhoid - a.typhoid)
                      .map((region, idx) => (
                        <tr key={region.region} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-3 border-b border-gray-200">{region.region}</td>
                          <td className="p-3 border-b border-gray-200 text-center">
                            <RiskPercentage probability={region.typhoid} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cholera Table */}
            <div className="border-2 border-black">
              <div className="bg-black text-white p-4">
                <h3 className="text-xl font-bold">Cholera Risk by Region</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left border-b-2 border-black">Region</th>
                      <th className="p-3 text-center border-b-2 border-black">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.regions
                      .sort((a, b) => b.cholera - a.cholera)
                      .map((region, idx) => (
                        <tr key={region.region} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-3 border-b border-gray-200">{region.region}</td>
                          <td className="p-3 border-b border-gray-200 text-center">
                            <RiskPercentage probability={region.cholera} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="mb-8 p-6 border-2 border-black">
          <h3 className="font-bold text-lg mb-4">Risk Level Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#10B981] flex-shrink-0"></div>
              <div>
                <div className="font-bold">Low Risk (&lt;30%)</div>
                <div className="text-sm text-gray-600">Continue preventive measures</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FBBF24] flex-shrink-0"></div>
              <div>
                <div className="font-bold">Medium Risk (30-69%)</div>
                <div className="text-sm text-gray-600">Exercise caution</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#EF4444] flex-shrink-0"></div>
              <div>
                <div className="font-bold">High Risk (≥70%)</div>
                <div className="text-sm text-gray-600">Immediate action needed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-black text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Help Us Track and Prevent Outbreaks</h2>
          <p className="mb-6 text-gray-300">
            Your anonymous symptom reports help predict and prevent disease outbreaks in your community
          </p>
          <Link
            to="/symptoms"
            className="inline-block px-8 py-3 bg-white text-black hover:bg-gray-200 transition-colors font-bold"
          >
            Report Symptoms Now
          </Link>
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Last Updated: {format(new Date(predictions.lastUpdated), 'PPpp')}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle: string;
  alert?: boolean;
}

function StatCard({ icon, label, value, subtitle, alert }: StatCardProps) {
  return (
    <div className={`p-6 border-2 ${alert ? 'border-red-500 bg-red-50' : 'border-black'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={alert ? 'text-red-500' : 'text-black'}>{icon}</div>
      </div>
      <div className={`text-3xl font-bold mb-1 ${alert ? 'text-red-500' : ''}`}>{value.toLocaleString()}</div>
      <div className="font-bold mb-1">{label}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  );
}
