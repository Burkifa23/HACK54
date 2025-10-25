// Sample data for testing and demonstration

import { User, Pharmacy, SymptomReport, BlogPost, HistoricalData } from '../utils/types';
import { hashPassword } from '../utils/encryption';
import { generateAnonymousId, encryptData } from '../utils/encryption';

export function getSampleUsers(): User[] {
  return [
    {
      id: 'admin1',
      username: 'admin',
      password: hashPassword('admin123'),
      email: 'admin@health.gov.gh',
      role: 'admin',
      createdAt: '2025-09-01T00:00:00Z'
    },
    {
      id: 'user1',
      username: 'kofi_mensah',
      password: hashPassword('password123'),
      email: 'kofi@example.com',
      role: 'user',
      createdAt: '2025-09-15T00:00:00Z'
    },
    {
      id: 'user2',
      username: 'ama_asante',
      password: hashPassword('password123'),
      email: 'ama@example.com',
      role: 'user',
      createdAt: '2025-10-01T00:00:00Z'
    }
  ];
}

export function getSamplePharmacies(): Pharmacy[] {
  return [
    {
      id: 'ph1',
      name: 'MedPlus Pharmacy',
      username: 'medplus',
      password: hashPassword('medplus123'),
      region: 'Greater Accra',
      address: 'Oxford Street, Osu, Accra',
      phone: '+233 24 123 4567',
      email: 'contact@medplus.com.gh',
      license: 'PH-GA-2024-001',
      operatingHours: 'Mon-Sat: 8AM-8PM, Sun: 10AM-6PM',
      status: 'active',
      inventory: [
        {
          id: 'med1',
          name: 'Ciprofloxacin 500mg Tablets',
          generic: 'Ciprofloxacin',
          category: 'Antibiotic',
          price: 25.50,
          stock: 150,
          expiry: '2026-08-30',
          manufacturer: 'GSK'
        },
        {
          id: 'med2',
          name: 'ORS Oral Rehydration Sachets',
          generic: 'Oral Rehydration Salt',
          category: 'Rehydration',
          price: 2.00,
          stock: 300,
          expiry: '2026-12-31',
          manufacturer: 'WHO'
        },
        {
          id: 'med3',
          name: 'Paracetamol 500mg',
          generic: 'Paracetamol',
          category: 'Pain Relief',
          price: 5.00,
          stock: 450,
          expiry: '2027-03-15',
          manufacturer: 'Ernest Chemists'
        },
        {
          id: 'med4',
          name: 'Azithromycin 250mg',
          generic: 'Azithromycin',
          category: 'Antibiotic',
          price: 30.00,
          stock: 80,
          expiry: '2026-11-20',
          manufacturer: 'Pfizer'
        },
        {
          id: 'med5',
          name: 'Metronidazole 400mg',
          generic: 'Metronidazole',
          category: 'Antibiotic',
          price: 12.00,
          stock: 200,
          expiry: '2026-10-25',
          manufacturer: 'Actavis'
        }
      ],
      createdAt: '2025-09-01T00:00:00Z'
    },
    {
      id: 'ph2',
      name: 'HealthCare Pharmacy',
      username: 'healthcare',
      password: hashPassword('health123'),
      region: 'Ashanti',
      address: 'Adum, Kumasi',
      phone: '+233 32 234 5678',
      email: 'info@healthcare.com.gh',
      license: 'PH-AS-2024-002',
      operatingHours: 'Mon-Fri: 8AM-7PM, Sat: 9AM-5PM',
      status: 'active',
      inventory: [
        {
          id: 'med6',
          name: 'Doxycycline 100mg Capsules',
          generic: 'Doxycycline',
          category: 'Antibiotic',
          price: 18.00,
          stock: 120,
          expiry: '2026-09-10',
          manufacturer: 'Teva'
        },
        {
          id: 'med7',
          name: 'Metronidazole 400mg',
          generic: 'Metronidazole',
          category: 'Antibiotic',
          price: 12.00,
          stock: 200,
          expiry: '2026-10-25',
          manufacturer: 'Actavis'
        },
        {
          id: 'med8',
          name: 'ORS Sachets (10 pack)',
          generic: 'Oral Rehydration Salt',
          category: 'Rehydration',
          price: 15.00,
          stock: 180,
          expiry: '2027-01-30',
          manufacturer: 'WHO'
        },
        {
          id: 'med9',
          name: 'Ibuprofen 400mg',
          generic: 'Ibuprofen',
          category: 'Pain Relief',
          price: 8.00,
          stock: 350,
          expiry: '2026-12-15',
          manufacturer: 'GSK'
        },
        {
          id: 'med10',
          name: 'Ciprofloxacin 500mg',
          generic: 'Ciprofloxacin',
          category: 'Antibiotic',
          price: 24.00,
          stock: 95,
          expiry: '2026-08-20',
          manufacturer: 'Ranbaxy'
        }
      ],
      createdAt: '2025-09-05T00:00:00Z'
    },
    {
      id: 'ph3',
      name: 'Wellness Pharmacy',
      username: 'wellness',
      password: hashPassword('well123'),
      region: 'Central',
      address: 'Cape Coast, Central Region',
      phone: '+233 33 345 6789',
      email: 'wellness@pharmacy.gh',
      license: 'PH-CR-2024-003',
      operatingHours: '24/7',
      status: 'active',
      inventory: [
        {
          id: 'med11',
          name: 'Ciprofloxacin 500mg',
          generic: 'Ciprofloxacin',
          category: 'Antibiotic',
          price: 22.00,
          stock: 95,
          expiry: '2026-07-20',
          manufacturer: 'Ranbaxy'
        },
        {
          id: 'med12',
          name: 'Tetracycline 250mg',
          generic: 'Tetracycline',
          category: 'Antibiotic',
          price: 15.00,
          stock: 110,
          expiry: '2026-08-15',
          manufacturer: 'Mylan'
        },
        {
          id: 'med13',
          name: 'Paracetamol Syrup (Children)',
          generic: 'Paracetamol',
          category: 'Pain Relief',
          price: 8.50,
          stock: 200,
          expiry: '2027-02-28',
          manufacturer: 'Ernest Chemists'
        },
        {
          id: 'med14',
          name: 'ORS Sachets',
          generic: 'Oral Rehydration Salt',
          category: 'Rehydration',
          price: 1.50,
          stock: 400,
          expiry: '2027-06-30',
          manufacturer: 'WHO'
        }
      ],
      createdAt: '2025-09-10T00:00:00Z'
    }
  ];
}

export function getSampleSymptoms(): SymptomReport[] {
  const now = new Date();
  const daysAgo = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  return [
    {
      id: 'sym1',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: 'user1', actualLocation: 'Osu, Accra' }),
      region: 'Greater Accra',
      district: 'Accra Metro',
      symptoms: ['Fever', 'Abdominal Pain', 'Headache'],
      date: daysAgo(5),
      ageGroup: '18-35',
      severity: 4,
      submittedAt: daysAgo(3)
    },
    {
      id: 'sym2',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: null }),
      region: 'Greater Accra',
      district: 'Tema',
      symptoms: ['Severe Diarrhea', 'Watery Stool', 'Dehydration'],
      date: daysAgo(4),
      ageGroup: '36-50',
      severity: 5,
      submittedAt: daysAgo(2)
    },
    {
      id: 'sym3',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: 'user2' }),
      region: 'Ashanti',
      district: 'Kumasi',
      symptoms: ['Fever', 'Vomiting', 'Weakness'],
      date: daysAgo(8),
      ageGroup: '13-17',
      severity: 3,
      submittedAt: daysAgo(6)
    },
    {
      id: 'sym4',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: null }),
      region: 'Central',
      district: 'Cape Coast',
      symptoms: ['Severe Diarrhea', 'Vomiting', 'Dehydration', 'Rapid Heartbeat'],
      date: daysAgo(3),
      ageGroup: '6-12',
      severity: 4,
      submittedAt: daysAgo(1)
    },
    {
      id: 'sym5',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: null }),
      region: 'Greater Accra',
      district: 'Madina',
      symptoms: ['Fever', 'Headache', 'Muscle Aches', 'Weakness'],
      date: daysAgo(2),
      ageGroup: '18-35',
      severity: 3,
      submittedAt: daysAgo(1)
    },
    {
      id: 'sym6',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: null }),
      region: 'Volta',
      district: 'Ho',
      symptoms: ['Watery Stool', 'Severe Diarrhea', 'Dehydration'],
      date: daysAgo(6),
      ageGroup: '36-50',
      severity: 5,
      submittedAt: daysAgo(4)
    },
    {
      id: 'sym7',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: null }),
      region: 'Greater Accra',
      district: 'Accra Metro',
      symptoms: ['Fever', 'Abdominal Pain', 'Rose Spots (rash)', 'Weakness'],
      date: daysAgo(7),
      ageGroup: '18-35',
      severity: 4,
      submittedAt: daysAgo(5)
    },
    {
      id: 'sym8',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: null }),
      region: 'Ashanti',
      district: 'Obuasi',
      symptoms: ['Vomiting', 'Watery Stool', 'Nausea'],
      date: daysAgo(10),
      ageGroup: '51+',
      severity: 3,
      submittedAt: daysAgo(9)
    },
    {
      id: 'sym9',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: null }),
      region: 'Central',
      district: 'Winneba',
      symptoms: ['Severe Diarrhea', 'Dehydration', 'Rapid Heartbeat'],
      date: daysAgo(4),
      ageGroup: '18-35',
      severity: 5,
      submittedAt: daysAgo(3)
    },
    {
      id: 'sym10',
      anonymousId: generateAnonymousId(),
      encrypted: encryptData({ userId: null }),
      region: 'Greater Accra',
      district: 'Tema',
      symptoms: ['Fever', 'Headache', 'Constipation', 'Loss of Appetite'],
      date: daysAgo(9),
      ageGroup: '36-50',
      severity: 3,
      submittedAt: daysAgo(8)
    }
  ];
}

export function getSampleHistoricalData(): HistoricalData[] {
  return [
    {
      id: 'hist1',
      date: '2024-01-15',
      region: 'Greater Accra',
      district: 'Accra Metro',
      disease: 'Typhoid',
      confirmedCases: 45,
      population: 2000000,
      deaths: 2,
      hospitalized: 30,
      importedAt: '2025-10-01T00:00:00Z'
    },
    {
      id: 'hist2',
      date: '2024-02-10',
      region: 'Greater Accra',
      district: 'Tema',
      disease: 'Cholera',
      confirmedCases: 28,
      population: 500000,
      deaths: 1,
      hospitalized: 20,
      importedAt: '2025-10-01T00:00:00Z'
    },
    {
      id: 'hist3',
      date: '2024-03-05',
      region: 'Ashanti',
      district: 'Kumasi Metro',
      disease: 'Typhoid',
      confirmedCases: 32,
      population: 2000000,
      deaths: 1,
      hospitalized: 25,
      importedAt: '2025-10-01T00:00:00Z'
    },
    {
      id: 'hist4',
      date: '2024-04-20',
      region: 'Central',
      district: 'Cape Coast',
      disease: 'Cholera',
      confirmedCases: 18,
      population: 200000,
      deaths: 0,
      hospitalized: 15,
      importedAt: '2025-10-01T00:00:00Z'
    },
    {
      id: 'hist5',
      date: '2024-06-15',
      region: 'Volta',
      district: 'Ho',
      disease: 'Cholera',
      confirmedCases: 35,
      population: 300000,
      deaths: 2,
      hospitalized: 28,
      importedAt: '2025-10-01T00:00:00Z'
    }
  ];
}

export function getSampleBlogPosts(): BlogPost[] {
  return [
    {
      id: 'post1',
      title: 'Cholera Outbreak Alert: Greater Accra Region',
      content: `Health authorities have detected an increase in cholera cases in the Greater Accra Region, particularly in Tema and its surrounding areas. Residents are advised to take the following precautions:

1. Boil all drinking water for at least 1 minute before consumption
2. Avoid eating raw or undercooked seafood
3. Wash hands frequently with soap and clean water
4. Seek immediate medical attention if you experience severe diarrhea or vomiting
5. Use proper sanitation facilities

Cholera is a bacterial infection that spreads through contaminated water and food. While it can be fatal if left untreated, it is easily preventable and treatable with proper medical care and oral rehydration therapy.

Free cholera vaccines are available at the following health centers: Ridge Hospital, Korle Bu Teaching Hospital, and Tema General Hospital. If you live in an affected area, please get vaccinated.`,
      regions: ['Greater Accra'],
      status: 'published',
      createdAt: '2025-10-15T10:00:00Z',
      publishedAt: '2025-10-15T10:00:00Z',
      author: 'Admin'
    },
    {
      id: 'post2',
      title: 'Typhoid Fever Prevention: What You Need to Know',
      content: `Typhoid fever is a serious bacterial infection that affects thousands of Ghanaians each year. It is caused by Salmonella typhi bacteria and spreads through contaminated food and water.

Symptoms to watch for:
- Sustained high fever (39-40°C)
- Severe headache
- Abdominal pain
- Weakness and fatigue
- Loss of appetite
- Rose-colored spots on the chest (in some cases)

Prevention tips:
1. Get vaccinated - typhoid vaccines are safe and effective
2. Drink only boiled or bottled water
3. Avoid street food from unverified vendors
4. Wash fruits and vegetables thoroughly
5. Practice good hand hygiene

If you suspect you have typhoid fever, visit a healthcare facility immediately. Early treatment with antibiotics is highly effective and can prevent serious complications.`,
      regions: ['Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Western', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti', 'Western North'],
      status: 'published',
      createdAt: '2025-10-10T14:30:00Z',
      publishedAt: '2025-10-10T14:30:00Z',
      author: 'Admin'
    },
    {
      id: 'post3',
      title: 'Clean Water Initiative Launched in Northern Regions',
      content: `The Ministry of Health, in collaboration with international partners, has launched a clean water initiative targeting the Northern, Upper East, and Upper West regions.

This program aims to:
- Install 500 new boreholes in rural communities
- Distribute water purification tablets to 100,000 households
- Train community health workers on water safety
- Establish water testing stations in all districts

Access to clean water is crucial in preventing waterborne diseases like cholera and typhoid. These diseases disproportionately affect communities without reliable clean water sources.

Community members are encouraged to participate in water committee meetings and report any issues with water quality to local health authorities.`,
      regions: ['Northern', 'Upper East', 'Upper West'],
      status: 'published',
      createdAt: '2025-10-05T09:15:00Z',
      publishedAt: '2025-10-05T09:15:00Z',
      author: 'Admin'
    }
  ];
}
