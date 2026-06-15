import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ArrowDownIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Farmer } from '../../types';
import { predictProfit, ProfitPrediction } from '../../utils/predictProfit';
export const ProfitPredict: React.FC = () => {
  const { user } = useAuth();
  const { crops } = useAppData();
  const farmer = user as Farmer;
  const [selectedCropId, setSelectedCropId] = useState(crops[0]?.id || '');
  const [landSize, setLandSize] = useState(farmer?.landSize?.toString() || '0');
  const [sellingPrice, setSellingPrice] = useState('');
  const [prediction, setPrediction] = useState<ProfitPrediction | null>(null);
  
  // Auto-select first crop when crops list loads
  useEffect(() => {
    if (crops.length > 0 && !selectedCropId) {
      setSelectedCropId(crops[0].id);
    }
  }, [crops, selectedCropId]);

  const selectedCrop = crops.find((c) => c.id === selectedCropId);
  // Auto-update selling price when crop changes
  useEffect(() => {
    if (selectedCrop) {
      setSellingPrice(selectedCrop.currentPrice?.toString() || '0');
    }
  }, [selectedCropId, crops, selectedCrop]);
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop) return;
    const result = predictProfit(
      selectedCrop,
      Number(landSize),
      Number(sellingPrice)
    );
    setPrediction(result);
  };
  return (
    <div className="max-w-md mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
          Profit Prediction
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Estimate revenue before planting
        </p>
      </div>

      <Card>
        <form onSubmit={handleCalculate} className="space-y-4">
          <Select
            label="SELECT CROP"
            value={selectedCropId}
            onChange={(e) => setSelectedCropId(e.target.value)}
            options={crops.map((c) => ({
              value: c.id,
              label: `${c.emoji} ${c.name}`
            }))} />
          
          <Input
            label="LAND SIZE (ACRES)"
            type="number"
            step="0.1"
            min="0.1"
            value={landSize}
            onChange={(e) => setLandSize(e.target.value)}
            required />
          
          <Input
            label="SELLING PRICE (₹/Q)"
            type="number"
            min="1"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required />
          
          <Button type="submit" fullWidth className="mt-2">
            Calculate →
          </Button>
        </form>
      </Card>

      {prediction &&
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Result Card */}
          <div
          className={`rounded-[24px] p-6 text-white shadow-lg ${prediction.netProfit >= 0 ? 'bg-farmer' : 'bg-danger'}`}>
          
            <div className="flex items-center gap-2 mb-2 text-sm opacity-90">
              <CheckCircleIcon size={16} />
              <span className="uppercase tracking-wider">
                {prediction.netProfit >= 0 ?
              'PROFITABLE CROP' :
              'POTENTIAL LOSS'}
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-2">
              {prediction.netProfit >= 0 ? '+' : ''}₹
              {prediction.netProfit.toLocaleString()}
            </h2>
            <p className="text-sm opacity-90">
              ROI: {prediction.roi.toFixed(0)}% · Yield:{' '}
              {prediction.yield.toLocaleString()} quintals
            </p>
          </div>

          {/* Revenue / Cost Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center py-4">
              <p className="text-success font-bold text-xl mb-1">
                ₹{prediction.revenue.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                REVENUE
              </p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-danger font-bold text-xl mb-1">
                ₹{prediction.totalCost.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                TOTAL COST
              </p>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <Card>
            <h3 className="font-bold text-[var(--text)] mb-4">
              Cost Breakdown
            </h3>
            <div className="space-y-4 relative">
              {Object.entries(prediction.costBreakdown).map(
              ([key, value], index) => {
                const percentage = value / prediction.totalCost * 100;
                return (
                  <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-[var(--text)]">
                          {key}
                        </span>
                        <span className="font-medium text-[var(--text)]">
                          ₹{value.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div
                        className="bg-farmer h-2 rounded-full"
                        style={{
                          width: `${percentage}%`
                        }}>
                      </div>
                      </div>
                    </div>);

              }
            )}

              {/* Decorative arrow down */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full border border-[var(--border)] flex items-center justify-center shadow-sm">
                <ArrowDownIcon size={16} className="text-[var(--text-muted)]" />
              </div>
            </div>
          </Card>
        </div>
      }
    </div>);

};