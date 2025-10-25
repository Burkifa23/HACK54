// Symptom definitions and disease associations

export const SYMPTOMS = [
  'Fever',
  'Severe Diarrhea',
  'Watery Stool',
  'Vomiting',
  'Abdominal Pain',
  'Headache',
  'Nausea',
  'Dehydration',
  'Weakness',
  'Rapid Heartbeat',
  'Constipation',
  'Loss of Appetite',
  'Muscle Aches',
  'Rose Spots (rash)'
] as const;

export type Symptom = typeof SYMPTOMS[number];

export const AGE_GROUPS = ['0-5', '6-12', '13-17', '18-35', '36-50', '51+'] as const;
export type AgeGroup = typeof AGE_GROUPS[number];

// Symptom weights for typhoid
export const TYPHOID_SYMPTOMS: Record<Symptom, number> = {
  'Fever': 3,
  'Severe Diarrhea': 0,
  'Watery Stool': 0,
  'Vomiting': 1,
  'Abdominal Pain': 2,
  'Headache': 2,
  'Nausea': 1,
  'Dehydration': 1,
  'Weakness': 2,
  'Rapid Heartbeat': 0,
  'Constipation': 2,
  'Loss of Appetite': 1,
  'Muscle Aches': 1,
  'Rose Spots (rash)': 3
};

// Symptom weights for cholera
export const CHOLERA_SYMPTOMS: Record<Symptom, number> = {
  'Fever': 0,
  'Severe Diarrhea': 3,
  'Watery Stool': 3,
  'Vomiting': 2,
  'Abdominal Pain': 1,
  'Headache': 0,
  'Nausea': 1,
  'Dehydration': 3,
  'Weakness': 1,
  'Rapid Heartbeat': 2,
  'Constipation': 0,
  'Loss of Appetite': 1,
  'Muscle Aches': 0,
  'Rose Spots (rash)': 0
};
