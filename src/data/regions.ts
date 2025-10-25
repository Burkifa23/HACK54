// Ghana regions and related data

export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Central',
  'Eastern',
  'Western',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Savannah',
  'North East',
  'Oti',
  'Western North'
] as const;

export type GhanaRegion = typeof GHANA_REGIONS[number];

export const POPULATION_DATA: Record<GhanaRegion, number> = {
  'Greater Accra': 5455692,
  'Ashanti': 5440463,
  'Central': 2859821,
  'Eastern': 2916778,
  'Western': 2060585,
  'Volta': 2323431,
  'Northern': 2479461,
  'Upper East': 1301440,
  'Upper West': 897484,
  'Bono': 1208649,
  'Bono East': 1175046,
  'Ahafo': 563677,
  'Savannah': 519478,
  'North East': 599274,
  'Oti': 598303,
  'Western North': 890080
};

export const MAJOR_CITIES: Record<GhanaRegion, string[]> = {
  'Greater Accra': ['Accra', 'Tema', 'Madina', 'Teshie'],
  'Ashanti': ['Kumasi', 'Obuasi', 'Ejisu', 'Mampong'],
  'Central': ['Cape Coast', 'Winneba', 'Kasoa', 'Swedru'],
  'Eastern': ['Koforidua', 'Akropong', 'Begoro', 'Mpraeso'],
  'Western': ['Sekondi-Takoradi', 'Tarkwa', 'Prestea'],
  'Volta': ['Ho', 'Hohoe', 'Keta', 'Aflao'],
  'Northern': ['Tamale', 'Yendi', 'Savelugu'],
  'Upper East': ['Bolgatanga', 'Bawku', 'Navrongo'],
  'Upper West': ['Wa', 'Lawra', 'Jirapa'],
  'Bono': ['Sunyani', 'Berekum', 'Dormaa Ahenkro'],
  'Bono East': ['Techiman', 'Atebubu', 'Kintampo'],
  'Ahafo': ['Goaso', 'Bechem', 'Kukuom'],
  'Savannah': ['Damongo', 'Salaga', 'Bole'],
  'North East': ['Nalerigu', 'Walewale', 'Gambaga'],
  'Oti': ['Dambai', 'Kete Krachi', 'Nkwanta'],
  'Western North': ['Sefwi Wiawso', 'Bibiani', 'Juaboso']
};
