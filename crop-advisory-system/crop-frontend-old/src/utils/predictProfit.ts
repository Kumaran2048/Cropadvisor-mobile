import { Crop } from '../types';

export interface ProfitPrediction {
  revenue: number;
  totalCost: number;
  netProfit: number;
  roi: number;
  yield: number;
  costBreakdown: {
    labor: number;
    fertilizer: number;
    irrigation: number;
    seed: number;
    pesticide: number;
  };
}

export const predictProfit = (
crop: Crop,
landSizeAcres: number,
sellingPricePerQuintal: number)
: ProfitPrediction => {
  const totalYield = crop.avgYieldPerAcre * landSizeAcres;
  const revenue = totalYield * sellingPricePerQuintal;

  // Mock cost calculations based on land size and crop type
  // In a real app, this would be more complex
  const baseCostPerAcre = 15000;
  const totalBaseCost = baseCostPerAcre * landSizeAcres;

  const costBreakdown = {
    labor: totalBaseCost * 0.3,
    fertilizer: totalBaseCost * 0.25,
    irrigation: totalBaseCost * 0.15,
    seed: totalBaseCost * 0.1,
    pesticide: totalBaseCost * 0.2
  };

  const totalCost = Object.values(costBreakdown).reduce(
    (sum, cost) => sum + cost,
    0
  );
  const netProfit = revenue - totalCost;
  const roi = netProfit / totalCost * 100;

  return {
    revenue,
    totalCost,
    netProfit,
    roi,
    yield: totalYield,
    costBreakdown
  };
};