// Outbreak prediction algorithm

import { GhanaRegion, POPULATION_DATA } from '../data/regions';
import { TYPHOID_SYMPTOMS, CHOLERA_SYMPTOMS, Symptom } from '../data/symptoms';
import { CLIMATE_DATA, WaterBodyProximity } from '../data/climateData';
import {
  Disease,
  SymptomReport,
  HistoricalData,
  RegionalPrediction,
  RiskLevel,
  RiskInfo
} from './types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage';

/**
 * Calculate symptom score for a specific disease
 */
function calculateSymptomScore(
  symptoms: Symptom[],
  severity: number,
  disease: Disease
): number {
  const weights = disease === 'typhoid' ? TYPHOID_SYMPTOMS : CHOLERA_SYMPTOMS;
  
  let score = 0;
  symptoms.forEach(symptom => {
    score += weights[symptom] || 0;
  });
  
  // Multiply by severity factor (1-5 scale, normalized)
  return score * (severity / 3);
}

/**
 * Get recent symptom reports for a region
 */
function getRecentSymptoms(region: GhanaRegion, days: number): SymptomReport[] {
  const allSymptoms = getFromStorage<SymptomReport[]>(STORAGE_KEYS.SYMPTOMS, []);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return allSymptoms.filter(s => {
    return s.region === region && new Date(s.submittedAt) >= cutoffDate;
  });
}

/**
 * Calculate climate factor for a disease
 */
function calculateClimateFactor(region: GhanaRegion, disease: Disease): number {
  const climate = CLIMATE_DATA[region];
  let factor = 0;
  
  if (disease === 'cholera') {
    // Cholera thrives in wet conditions with contaminated water
    factor = (climate.annualRainfall / 2000) * 20;
    
    const waterBodyFactors: Record<WaterBodyProximity, number> = {
      'very high': 15,
      'high': 10,
      'medium': 5,
      'low': 0
    };
    factor += waterBodyFactors[climate.waterBodies];
  } else if (disease === 'typhoid') {
    // Typhoid spreads through contaminated food/water, worse in heat
    factor = (climate.avgTemperature / 30) * 15;
    
    const waterBodyFactors: Record<WaterBodyProximity, number> = {
      'very high': 8,
      'high': 8,
      'medium': 4,
      'low': 0
    };
    factor += waterBodyFactors[climate.waterBodies];
  }
  
  return factor;
}

/**
 * Calculate historical risk factor
 */
function calculateHistoricalRisk(region: GhanaRegion, disease: Disease): number {
  const historicalData = getFromStorage<HistoricalData[]>(STORAGE_KEYS.HISTORICAL_DATA, []);
  
  const relevantOutbreaks = historicalData.filter(
    h => h.region === region && h.disease.toLowerCase() === disease
  );
  
  if (relevantOutbreaks.length === 0) {
    return 0;
  }
  
  // Calculate average incidence rate
  const totalCases = relevantOutbreaks.reduce((sum, h) => sum + h.confirmedCases, 0);
  const avgCases = totalCases / relevantOutbreaks.length;
  
  // Normalize to 0-100 scale (100 cases = 10 points)
  return Math.min(20, (avgCases / 10));
}

/**
 * Calculate outbreak probability for a disease in a region
 */
export function calculateOutbreakProbability(
  region: GhanaRegion,
  disease: Disease
): number {
  // 1. Get recent symptoms (last 30 days)
  const recentSymptoms = getRecentSymptoms(region, 30);
  
  if (recentSymptoms.length === 0) {
    // No recent data, base on climate and history only
    const climateFactor = calculateClimateFactor(region, disease);
    const historicalRisk = calculateHistoricalRisk(region, disease);
    return Math.min(100, Math.max(0, Math.round(climateFactor + historicalRisk)));
  }
  
  // 2. Calculate symptom density (reports per 100,000 population)
  const population = POPULATION_DATA[region];
  const symptomDensity = (recentSymptoms.length / population) * 100000;
  
  // 3. Calculate disease-specific symptom scores
  const diseaseScores = recentSymptoms.map(s =>
    calculateSymptomScore(s.symptoms, s.severity, disease)
  );
  const avgDiseaseScore = diseaseScores.reduce((a, b) => a + b, 0) / diseaseScores.length;
  
  // 4. Calculate trend (increasing or decreasing reports)
  const last7Days = getRecentSymptoms(region, 7);
  const previous7Days = getRecentSymptoms(region, 14).filter(s => {
    const date = new Date(s.submittedAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return date < sevenDaysAgo;
  });
  
  const trend = last7Days.length > previous7Days.length ? 1.2 : 0.8;
  
  // 5. Factor in climate data
  const climateFactor = calculateClimateFactor(region, disease);
  
  // 6. Factor in historical outbreak patterns
  const historicalRisk = calculateHistoricalRisk(region, disease);
  
  // 7. Combine all factors with weights
  const probability =
    symptomDensity * 0.35 +      // 35% weight on current symptoms
    avgDiseaseScore * 0.25 +      // 25% weight on disease-specific symptoms
    climateFactor * 0.20 +        // 20% weight on climate
    historicalRisk * 0.10 +       // 10% weight on history
    (trend * 5);                  // 10% weight on trend
  
  // 8. Normalize to 0-100 scale
  return Math.min(100, Math.max(0, Math.round(probability)));
}

/**
 * Calculate predictions for all regions
 */
export function calculateAllPredictions(): RegionalPrediction[] {
  const regions = Object.keys(POPULATION_DATA) as GhanaRegion[];
  
  return regions.map(region => ({
    region,
    typhoid: calculateOutbreakProbability(region, 'typhoid'),
    cholera: calculateOutbreakProbability(region, 'cholera')
  }));
}

/**
 * Get risk level from probability
 */
export function getRiskLevel(probability: number): RiskInfo {
  if (probability >= 70) {
    return {
      level: 'high',
      color: '#EF4444',
      text: 'High Risk - Immediate Action Needed',
      recommendation: 'Avoid untreated water, practice strict hygiene, seek medical attention for any symptoms'
    };
  } else if (probability >= 30) {
    return {
      level: 'medium',
      color: '#FBBF24',
      text: 'Medium Risk - Exercise Caution',
      recommendation: 'Boil drinking water, wash hands frequently, monitor for symptoms'
    };
  } else {
    return {
      level: 'low',
      color: '#10B981',
      text: 'Low Risk - Continue Preventive Measures',
      recommendation: 'Maintain good hygiene practices, stay informed'
    };
  }
}

/**
 * Update and cache predictions
 */
export function updatePredictions(): RegionalPrediction[] {
  const predictions = calculateAllPredictions();
  
  const cache = {
    lastUpdated: new Date().toISOString(),
    regions: predictions
  };
  
  saveToStorage(STORAGE_KEYS.PREDICTIONS, cache);
  
  return predictions;
}
