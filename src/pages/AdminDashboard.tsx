// Admin dashboard

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Building2, FileText, Users, Database, AlertTriangle } from 'lucide-react';
import { getFromStorage, STORAGE_KEYS } from '../utils/storage';
import { SymptomReport, Pharmacy, BlogPost, User, PredictionsCache } from '../utils/types';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSymptoms: 0,
    recentSymptoms: 0,
    pharmacies: 0,
    blogPosts: 0,
    users: 0,
    highRiskRegions: 0
  });

  useEffect(() => {
    const symptoms = getFromStorage<SymptomReport[]>(STORAGE_KEYS.SYMPTOMS, []);
    const pharmacies = getFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);
    const blogPosts = getFromStorage<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, []);
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const predictions = getFromStorage<PredictionsCache | null>(STORAGE_KEYS.PREDICTIONS, null);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSymptoms = symptoms.filter(s => new Date(s.submittedAt) >= thirtyDaysAgo);

    const highRisk = predictions?.regions.filter(
      r => r.typhoid >= 70 || r.cholera >= 70
    ).length || 0;

    setStats({
      totalSymptoms: symptoms.length,
      recentSymptoms: recentSymptoms.length,
      pharmacies: pharmacies.length,
      blogPosts: blogPosts.length,
      users: users.filter(u => u.role === 'user').length,
      highRiskRegions: highRisk
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Monitor system health and manage all aspects of the platform
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 border-2 border-black">
            <TrendingUp className="h-8 w-8 mb-3" />
            <div className="text-3xl font-bold mb-1">{stats.totalSymptoms}</div>
            <div className="font-bold">Total Symptom Reports</div>
            <div className="text-sm text-gray-600">{stats.recentSymptoms} in last 30 days</div>
          </div>

          <div className={`p-6 border-2 ${stats.highRiskRegions > 0 ? 'border-red-500 bg-red-50' : 'border-black'}`}>
            <AlertTriangle className={`h-8 w-8 mb-3 ${stats.highRiskRegions > 0 ? 'text-red-500' : ''}`} />
            <div className={`text-3xl font-bold mb-1 ${stats.highRiskRegions > 0 ? 'text-red-500' : ''}`}>
              {stats.highRiskRegions}
            </div>
            <div className="font-bold">High Risk Regions</div>
            <div className="text-sm text-gray-600">Requiring attention</div>
          </div>

          <div className="p-6 border-2 border-black">
            <Building2 className="h-8 w-8 mb-3" />
            <div className="text-3xl font-bold mb-1">{stats.pharmacies}</div>
            <div className="font-bold">Registered Pharmacies</div>
            <div className="text-sm text-gray-600">Active partners</div>
          </div>

          <div className="p-6 border-2 border-black">
            <FileText className="h-8 w-8 mb-3" />
            <div className="text-3xl font-bold mb-1">{stats.blogPosts}</div>
            <div className="font-bold">Blog Posts</div>
            <div className="text-sm text-gray-600">Published articles</div>
          </div>

          <div className="p-6 border-2 border-black">
            <Users className="h-8 w-8 mb-3" />
            <div className="text-3xl font-bold mb-1">{stats.users}</div>
            <div className="font-bold">Registered Users</div>
            <div className="text-sm text-gray-600">Public accounts</div>
          </div>

          <div className="p-6 border-2 border-black">
            <Database className="h-8 w-8 mb-3" />
            <div className="text-3xl font-bold mb-1">{stats.totalSymptoms}</div>
            <div className="font-bold">Data Records</div>
            <div className="text-sm text-gray-600">Total collected</div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/data"
            className="p-6 border-2 border-black hover:bg-gray-50 transition-colors"
          >
            <Database className="h-8 w-8 mb-3" />
            <div className="font-bold text-lg mb-1">View Symptom Data</div>
            <div className="text-sm text-gray-600">Browse and analyze all reports</div>
          </Link>

          <Link
            to="/admin/import"
            className="p-6 border-2 border-black hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 mb-3" />
            <div className="font-bold text-lg mb-1">Import Historical Data</div>
            <div className="text-sm text-gray-600">Upload outbreak data via CSV</div>
          </Link>

          <Link
            to="/admin/blog"
            className="p-6 border-2 border-black hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 mb-3" />
            <div className="font-bold text-lg mb-1">Manage Blog Posts</div>
            <div className="text-sm text-gray-600">Create and publish articles</div>
          </Link>

          <Link
            to="/admin/pharmacies"
            className="p-6 border-2 border-black hover:bg-gray-50 transition-colors"
          >
            <Building2 className="h-8 w-8 mb-3" />
            <div className="font-bold text-lg mb-1">Manage Pharmacies</div>
            <div className="text-sm text-gray-600">Create and manage accounts</div>
          </Link>

          <Link
            to="/admin/data"
            className="p-6 border-2 border-black hover:bg-gray-50 transition-colors"
          >
            <Database className="h-8 w-8 mb-3" />
            <div className="font-bold text-lg mb-1">Export Reports</div>
            <div className="text-sm text-gray-600">Download data as CSV</div>
          </Link>

          <Link
            to="/"
            className="p-6 border-2 border-black hover:bg-gray-50 transition-colors"
          >
            <AlertTriangle className="h-8 w-8 mb-3" />
            <div className="font-bold text-lg mb-1">View Predictions</div>
            <div className="text-sm text-gray-600">See outbreak risk levels</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
