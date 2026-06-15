import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Farmer, Crop } from '../../types';
import { predictProfit, ProfitPrediction } from '../../utils/predictProfit';
import { toast } from 'sonner';
interface SimulationResult extends ProfitPrediction {
  crop: Crop;
  rank: number;
}
export const WhatIf: React.FC = () => {
  const { user } = useAuth();
  const { crops } = useAppData();
  const farmer = user as Farmer;
  const [landSize, setLandSize] = useState(farmer?.landSize?.toString() || '0');
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const toggleCrop = (cropId: string) => {
    if (selectedCropIds.includes(cropId)) {
      setSelectedCropIds((prev) => prev.filter((id) => id !== cropId));
    } else {
      if (selectedCropIds.length >= 8) {
        toast.error('You can select up to 8 crops for simulation.');
        return;
      }
      setSelectedCropIds((prev) => [...prev, cropId]);
    }
  };
  const handleSimulate = () => {
    if (selectedCropIds.length === 0) {
      toast.error('Please select at least one crop.');
      return;
    }
    const acres = Number(landSize);
    if (acres <= 0) {
      toast.error('Please enter a valid land size.');
      return;
    }
    const simResults = selectedCropIds.map((id) => {
      const crop = crops.find((c) => c.id === id)!;
      const prediction = predictProfit(crop, acres, crop.currentPrice);
      return {
        ...prediction,
        crop,
        rank: 0
      };
    });
    // Sort by net profit descending
    simResults.sort((a, b) => b.netProfit - a.netProfit);
    // Assign ranks
    simResults.forEach((res, index) => {
      res.rank = index + 1;
    });
    setResults(simResults);
  };
  return (
    <div className="max-w-md mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
          What-If Simulation
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Compare crop profits on same land
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <Input
            label="LAND SIZE (ACRES)"
            type="number"
            step="0.1"
            min="0.1"
            value={landSize}
            onChange={(e) => setLandSize(e.target.value)} />
          

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              SELECT CROPS (Up to 8)
            </label>
            <div className="flex flex-wrap gap-2">
              {crops.map((crop) => {
                const isSelected = selectedCropIds.includes(crop.id);
                return (
                  <button
                    key={crop.id}
                    onClick={() => toggleCrop(crop.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${isSelected ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-300' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    
                    {crop.name}
                  </button>);

              })}
            </div>
          </div>

          <Button onClick={handleSimulate} fullWidth className="mt-4">
            Run Simulation ({selectedCropIds.length} crops)
          </Button>
        </div>
      </Card>

      {results.length > 0 &&
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-bold text-[var(--text)] flex items-center gap-2">
            Results — Ranked by Profit
          </h3>

          {results.map((res, index) => {
          const isBest = index === 0;
          const isLoss = res.netProfit < 0;
          // Calculate progress bar width relative to the best profit
          const maxProfit = Math.max(...results.map((r) => r.netProfit), 1); // Avoid div by 0
          const widthPercent = isLoss ?
          100 :
          Math.max(10, res.netProfit / maxProfit * 100);
          return (
            <Card
              key={res.crop.id}
              className={`relative overflow-hidden ${isBest ? 'border-2 border-farmer shadow-md' : ''}`}>
              
                <div className="flex items-start gap-4 mb-3">
                  <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${isBest ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                  
                    {res.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-[var(--text)]">
                          {res.crop.name}
                        </h4>
                        {isBest &&
                      <Badge variant="success" className="mt-1">
                            Best Choice
                          </Badge>
                      }
                      </div>
                      <div className="text-right">
                        <p
                        className={`font-bold text-lg ${isLoss ? 'text-danger' : 'text-success'}`}>
                        
                          {isLoss ? '' : '+'}₹{res.netProfit.toLocaleString()}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          ROI: {res.roi.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mt-2">
                  <div
                  className={`h-2.5 rounded-full ${isLoss ? 'bg-danger' : isBest ? 'bg-farmer' : 'bg-blue-500'}`}
                  style={{
                    width: `${widthPercent}%`
                  }}>
                </div>
                </div>
              </Card>);

        })}
        </div>
      }
    </div>);

};