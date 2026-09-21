export interface NagpurArea {
  name: string;
  zone: string;
  lat: number;
  lng: number;
  landmark: string;
}

export const NAGPUR_AREAS: NagpurArea[] = [
  {
    name: 'Sitabuldi (Zero Mile)',
    zone: 'Central Nagpur',
    lat: 21.1458,
    lng: 79.0882,
    landmark: 'Sitabuldi Metro Interchange & Zero Mile Monument'
  },
  {
    name: 'Dharampeth',
    zone: 'West Nagpur',
    lat: 21.1436,
    lng: 79.0632,
    landmark: 'Coffee House Chowk & West High Court Road'
  },
  {
    name: 'Medical Square (GMCH)',
    zone: 'South-Central Nagpur',
    lat: 21.1340,
    lng: 79.0980,
    landmark: 'Government Medical College & Hospital (GMCH)'
  },
  {
    name: 'Chhatrapati Square (Wardha Road)',
    zone: 'South Nagpur',
    lat: 21.1090,
    lng: 79.0680,
    landmark: 'Metro Pillar 142 & Wardha Road Highway'
  },
  {
    name: 'Sadar & Civil Lines',
    zone: 'North-Central Nagpur',
    lat: 21.1610,
    lng: 79.0730,
    landmark: 'District Collectorate & Police Commissioner HQ'
  },
  {
    name: 'Gandhibagh & Itwari',
    zone: 'East Nagpur',
    lat: 21.1520,
    lng: 79.1150,
    landmark: 'Wholesale Market & Itwari Railway Station'
  },
  {
    name: 'VNIT & Hingna Road',
    zone: 'South-West Nagpur',
    lat: 21.1255,
    lng: 79.0510,
    landmark: 'VNIT Main Gate & Subhash Nagar Metro'
  },
  {
    name: 'Dhantoli & Lokmat Square',
    zone: 'Central Healthcare Zone',
    lat: 21.1370,
    lng: 79.0830,
    landmark: 'Lokmat Square & Private Hospital Corridor'
  },
  {
    name: 'Mankapur & Koradi Road',
    zone: 'North Nagpur',
    lat: 21.1890,
    lng: 79.0810,
    landmark: 'Mankapur Indoor Stadium & Koradi Ring Road'
  },
  {
    name: 'Nandanvan & Hasanbagh',
    zone: 'South-East Nagpur',
    lat: 21.1290,
    lng: 79.1280,
    landmark: 'KDK College Road & Hasanbagh Chowk'
  }
];

export const NAGPUR_HELPLINES = [
  {
    service: 'Nagpur Police Control Room',
    number: '112',
    alt: '0712-2561222',
    badge: 'Police / Law & Order'
  },
  {
    service: 'GMCH Ambulance / Trauma Care',
    number: '108',
    alt: '0712-2744671',
    badge: 'Emergency Medical'
  },
  {
    service: 'NMC Fire Brigade Control',
    number: '101',
    alt: '0712-2567777',
    badge: 'Fire & Rescue'
  },
  {
    service: 'NMC Disaster Management Cell',
    number: '0712-2567011',
    alt: '1800-233-3764',
    badge: 'Civic Emergencies'
  }
];
