import { Farmer, Officer, Admin, Crop } from '../types';

export const seedOfficers: Officer[] = [
{
  id: 'o1',
  name: 'Priya Sharma',
  email: 'priya@agr.gov.in',
  role: 'officer',
  district: 'Nashik',
  phone: '9876543210',
  isActive: true
},
{
  id: 'o2',
  name: 'Rahul Desai',
  email: 'rahul@agr.gov.in',
  role: 'officer',
  district: 'Pune',
  phone: '9876543211',
  isActive: true
},
{
  id: 'o3',
  name: 'Amit Patel',
  email: 'amit@agr.gov.in',
  role: 'officer',
  district: 'Ahmednagar',
  phone: '9876543212',
  isActive: true
},
{
  id: 'o4',
  name: 'Karthik R',
  email: 'karthik@agr.gov.in',
  role: 'officer',
  district: 'Chennai',
  phone: '9876543213',
  isActive: true
},
{
  id: 'o5',
  name: 'Meena K',
  email: 'meena@agr.gov.in',
  role: 'officer',
  district: 'Coimbatore',
  phone: '9876543214',
  isActive: true
}];


export const seedFarmers: Farmer[] = [
{
  id: 'f1',
  name: 'Rajesh Kumar',
  email: 'farmer@demo.com',
  role: 'farmer',
  district: 'Nashik',
  phone: '9988776655',
  isActive: true,
  landSize: 4.5,
  soilType: 'Loamy',
  activeCrop: 'Tomato'
},
{
  id: 'f2',
  name: 'Suresh Patil',
  email: 'suresh@demo.com',
  role: 'farmer',
  district: 'Nashik',
  phone: '9988776656',
  isActive: true,
  landSize: 2.0,
  soilType: 'Black',
  activeCrop: 'Onion'
},
{
  id: 'f3',
  name: 'Vijay Singh',
  email: 'vijay@demo.com',
  role: 'farmer',
  district: 'Pune',
  phone: '9988776657',
  isActive: true,
  landSize: 5.5,
  soilType: 'Red',
  activeCrop: 'Soybean'
},
{
  id: 'f4',
  name: 'Anil Jadhav',
  email: 'anil@demo.com',
  role: 'farmer',
  district: 'Pune',
  phone: '9988776658',
  isActive: true,
  landSize: 3.0,
  soilType: 'Loamy',
  activeCrop: 'Wheat'
},
{
  id: 'f5',
  name: 'Sunil Pawar',
  email: 'sunil@demo.com',
  role: 'farmer',
  district: 'Ahmednagar',
  phone: '9988776659',
  isActive: true,
  landSize: 6.0,
  soilType: 'Black',
  activeCrop: 'Cotton'
},
{
  id: 'f6',
  name: 'Ramesh K',
  email: 'ramesh@demo.com',
  role: 'farmer',
  district: 'Chennai',
  phone: '9988776660',
  isActive: true,
  landSize: 2.5,
  soilType: 'Alluvial',
  activeCrop: 'Rice'
},
{
  id: 'f7',
  name: 'Muthu V',
  email: 'muthu@demo.com',
  role: 'farmer',
  district: 'Coimbatore',
  phone: '9988776661',
  isActive: true,
  landSize: 4.0,
  soilType: 'Red',
  activeCrop: 'Maize'
},
{
  id: 'f8',
  name: 'Selvam P',
  email: 'selvam@demo.com',
  role: 'farmer',
  district: 'Coimbatore',
  phone: '9988776662',
  isActive: true,
  landSize: 3.5,
  soilType: 'Loamy',
  activeCrop: 'Potato'
}];


export const seedAdmin: Admin = {
  id: 'a1',
  name: 'System Admin',
  email: 'admin@demo.com',
  role: 'admin',
  isActive: true
};

export const seedCrops: Crop[] = [
{
  id: 'c1',
  name: 'Tomato',
  emoji: '🍅',
  idealSoil: ['Loamy', 'Sandy'],
  season: ['Kharif', 'Rabi', 'Zaid'],
  avgYieldPerAcre: 120,
  currentPrice: 1650,
  priceTrend: 18,
  minPrice: 1200,
  maxPrice: 2100
},
{
  id: 'c2',
  name: 'Soybean',
  emoji: '🫘',
  idealSoil: ['Black', 'Loamy'],
  season: ['Kharif'],
  avgYieldPerAcre: 10,
  currentPrice: 4200,
  priceTrend: 8,
  minPrice: 3800,
  maxPrice: 4600
},
{
  id: 'c3',
  name: 'Onion',
  emoji: '🧅',
  idealSoil: ['Loamy', 'Red'],
  season: ['Rabi', 'Kharif'],
  avgYieldPerAcre: 80,
  currentPrice: 1100,
  priceTrend: -5,
  minPrice: 800,
  maxPrice: 1400
},
{
  id: 'c4',
  name: 'Wheat',
  emoji: '🌾',
  idealSoil: ['Loamy', 'Clay'],
  season: ['Rabi'],
  avgYieldPerAcre: 15,
  currentPrice: 2200,
  priceTrend: 2,
  minPrice: 2000,
  maxPrice: 2400
},
{
  id: 'c5',
  name: 'Rice',
  emoji: '🍚',
  idealSoil: ['Clay', 'Alluvial'],
  season: ['Kharif'],
  avgYieldPerAcre: 20,
  currentPrice: 2000,
  priceTrend: 1,
  minPrice: 1800,
  maxPrice: 2200
},
{
  id: 'c6',
  name: 'Cotton',
  emoji: '☁️',
  idealSoil: ['Black'],
  season: ['Kharif'],
  avgYieldPerAcre: 8,
  currentPrice: 6000,
  priceTrend: 5,
  minPrice: 5500,
  maxPrice: 6500
},
{
  id: 'c7',
  name: 'Maize',
  emoji: '🌽',
  idealSoil: ['Loamy', 'Red'],
  season: ['Kharif', 'Rabi'],
  avgYieldPerAcre: 25,
  currentPrice: 1800,
  priceTrend: 3,
  minPrice: 1600,
  maxPrice: 2000
},
{
  id: 'c8',
  name: 'Potato',
  emoji: '🥔',
  idealSoil: ['Sandy', 'Loamy'],
  season: ['Rabi'],
  avgYieldPerAcre: 100,
  currentPrice: 1200,
  priceTrend: -2,
  minPrice: 1000,
  maxPrice: 1500
}];