import { Crop } from '../types';

export const recommendCrops = (
crops: Crop[],
soilType: string,
season
// Mocking weather/market factors for demo
: string): Array<Crop & {score: number;}> => {
  return crops.
  map((crop) => {
    let score = 50; // Base score

    if (crop.idealSoil.includes(soilType)) score += 20;
    if (crop.season.includes(season)) score += 20;
    if (crop.priceTrend > 0) score += 10; // Positive market trend

    // Cap at 100
    score = Math.min(100, score);

    return { ...crop, score };
  }).
  sort((a, b) => b.score - a.score);
};