export type Role = 'farmer' | 'officer' | 'admin';

export interface User {
  _id?: string; // MongoDB ID
  id: string;   // Frontend ID
  name: string;
  email: string;
  role: Role;
  phone?: string;
  isActive: boolean;
  district?: string;
  state?: string;
}

export interface Farmer extends User {
  role: 'farmer';
  district: string;
  landSize: number; // in acres
  soilType: string;
  activeCrop?: string;
  activeCropId?: string;
  village?: string;
}

export interface Officer extends User {
  role: 'officer';
  district: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Crop {
  id: string;
  name: string;
  emoji: string;
  idealSoil: string[];
  season: string[];
  avgYieldPerAcre: number; // in quintals
  currentPrice: number; // per quintal (mapped from modalPrice)
  priceTrend: number; // percentage
  minPrice: number;
  maxPrice: number;
}

export interface MarketPriceData {
  cropName: string;
  mandiName: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
  district: string;
}

export interface DiseaseReport {
  id: string;
  farmerId: string;
  district: string;
  cropName: string;
  diseaseName: string;
  confidence: number;
  date: string;
  status: 'pending' | 'resolved';
  imageUrl?: string;
}

export interface Broadcast {
  id: string;
  officerId: string;
  district: string;
  message: string;
  type: string;
  date: string;
  allowReplies?: boolean;
  replies?: {
    farmerId: string;
    farmerName: string;
    message: string;
    createdAt: string;
  }[];
}

export interface Expense {
  id: string;
  farmerId: string;
  cropName: string;
  category:
  'Labor' |
  'Fertilizer' |
  'Irrigation' |
  'Seed' |
  'Pesticide' |
  'Other';
  amount: number;
  date: string;
}

export interface FieldVisit {
  id: string;
  officerId: string;
  farmerId: string;
  date: string;
  notes: string;
  photoUrl?: string;
}

export interface Settings {
  notifications: {
    weather: boolean;
    market: boolean;
    disease: boolean;
    officer: boolean;
  };
}