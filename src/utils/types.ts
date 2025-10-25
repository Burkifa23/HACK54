// TypeScript type definitions for the entire application

import { GhanaRegion } from '../data/regions';
import { Symptom, AgeGroup } from '../data/symptoms';

// User roles
export type UserRole = 'user' | 'pharmacy' | 'admin';

// User interface
export interface User {
  id: string;
  username: string;
  password: string; // hashed
  email: string;
  role: UserRole;
  createdAt: string;
}

// Symptom report interface
export interface SymptomReport {
  id: string;
  anonymousId: string;
  encrypted: string; // encrypted user data
  region: GhanaRegion;
  district?: string;
  symptoms: Symptom[];
  date: string; // onset date
  ageGroup: AgeGroup;
  severity: number; // 1-5
  submittedAt: string;
}

// Medication categories
export type MedicationCategory =
  | 'Antibiotic'
  | 'Pain Relief'
  | 'Rehydration'
  | 'Antimalarial'
  | 'Antidiarrheal'
  | 'Other';

// Medication interface
export interface Medication {
  id: string;
  name: string;
  generic?: string;
  category: MedicationCategory;
  price: number; // in GHS
  stock: number;
  expiry: string;
  manufacturer?: string;
}

// Pharmacy interface
export interface Pharmacy {
  id: string;
  name: string;
  username: string;
  password: string; // hashed
  region: GhanaRegion;
  address: string;
  phone: string;
  email: string;
  license: string;
  operatingHours?: string;
  inventory: Medication[];
  createdAt: string;
  status: 'active' | 'inactive';
}

// Blog post status
export type BlogStatus = 'draft' | 'published';

// Blog post interface
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  regions: GhanaRegion[]; // affected regions
  status: BlogStatus;
  createdAt: string;
  publishedAt?: string;
  author: string;
}

// Historical outbreak data
export interface HistoricalData {
  id: string;
  date: string;
  region: GhanaRegion;
  district?: string;
  disease: 'Typhoid' | 'Cholera';
  confirmedCases: number;
  population: number;
  deaths: number;
  hospitalized: number;
  importedAt: string;
}

// Disease type
export type Disease = 'typhoid' | 'cholera';

// Regional prediction
export interface RegionalPrediction {
  region: GhanaRegion;
  typhoid: number; // 0-100
  cholera: number; // 0-100
}

// Predictions cache
export interface PredictionsCache {
  lastUpdated: string;
  regions: RegionalPrediction[];
}

// Risk level
export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskInfo {
  level: RiskLevel;
  color: string;
  text: string;
  recommendation: string;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  adminId: string;
  action: string;
  targetId?: string;
  timestamp: string;
  ipAddress?: string;
}

// Price filter for pharmacy search
export type PriceFilter = 'all' | 'budget' | 'medium' | 'premium';

// Distance filter
export type DistanceFilter = '5km' | '10km' | '20km' | '50km' | 'any';
