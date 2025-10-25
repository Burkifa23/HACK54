// Climate data for all Ghana regions

import { GhanaRegion } from './regions';

export type WaterBodyProximity = 'very high' | 'high' | 'medium' | 'low';

export interface ClimateData {
  annualRainfall: number; // mm per year
  avgTemperature: number; // Celsius
  waterBodies: WaterBodyProximity;
}

export const CLIMATE_DATA: Record<GhanaRegion, ClimateData> = {
  'Greater Accra': {
    annualRainfall: 730,
    avgTemperature: 27,
    waterBodies: 'high'
  },
  'Ashanti': {
    annualRainfall: 1400,
    avgTemperature: 26,
    waterBodies: 'medium'
  },
  'Central': {
    annualRainfall: 1200,
    avgTemperature: 27,
    waterBodies: 'high'
  },
  'Eastern': {
    annualRainfall: 1500,
    avgTemperature: 26,
    waterBodies: 'medium'
  },
  'Western': {
    annualRainfall: 1800,
    avgTemperature: 27,
    waterBodies: 'high'
  },
  'Volta': {
    annualRainfall: 1100,
    avgTemperature: 27,
    waterBodies: 'very high' // Lake Volta
  },
  'Northern': {
    annualRainfall: 1000,
    avgTemperature: 28,
    waterBodies: 'low'
  },
  'Upper East': {
    annualRainfall: 900,
    avgTemperature: 28,
    waterBodies: 'low'
  },
  'Upper West': {
    annualRainfall: 950,
    avgTemperature: 28,
    waterBodies: 'low'
  },
  'Bono': {
    annualRainfall: 1300,
    avgTemperature: 26,
    waterBodies: 'medium'
  },
  'Bono East': {
    annualRainfall: 1200,
    avgTemperature: 27,
    waterBodies: 'medium'
  },
  'Ahafo': {
    annualRainfall: 1350,
    avgTemperature: 26,
    waterBodies: 'medium'
  },
  'Savannah': {
    annualRainfall: 1050,
    avgTemperature: 28,
    waterBodies: 'low'
  },
  'North East': {
    annualRainfall: 950,
    avgTemperature: 28,
    waterBodies: 'low'
  },
  'Oti': {
    annualRainfall: 1100,
    avgTemperature: 27,
    waterBodies: 'high' // Volta River
  },
  'Western North': {
    annualRainfall: 1600,
    avgTemperature: 27,
    waterBodies: 'medium'
  }
};
