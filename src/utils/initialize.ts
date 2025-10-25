// Initialize app with sample data if empty

import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage';
import {
  getSampleUsers,
  getSamplePharmacies,
  getSampleSymptoms,
  getSampleHistoricalData,
  getSampleBlogPosts
} from '../data/sampleData';
import { updatePredictions } from './predictions';

/**
 * Initialize the application with sample data
 * Only runs if localStorage is empty
 */
export function initializeApp(): void {
  // Check if already initialized
  const users = getFromStorage(STORAGE_KEYS.USERS, []);
  
  if (users.length > 0) {
    // Already initialized
    return;
  }

  console.log('Initializing app with sample data...');

  // Initialize users
  saveToStorage(STORAGE_KEYS.USERS, getSampleUsers());

  // Initialize pharmacies
  saveToStorage(STORAGE_KEYS.PHARMACIES, getSamplePharmacies());

  // Initialize symptoms
  saveToStorage(STORAGE_KEYS.SYMPTOMS, getSampleSymptoms());

  // Initialize historical data
  saveToStorage(STORAGE_KEYS.HISTORICAL_DATA, getSampleHistoricalData());

  // Initialize blog posts
  saveToStorage(STORAGE_KEYS.BLOG_POSTS, getSampleBlogPosts());

  // Initialize empty audit log
  saveToStorage(STORAGE_KEYS.AUDIT_LOG, []);

  // Calculate initial predictions
  updatePredictions();

  console.log('App initialized successfully!');
}
