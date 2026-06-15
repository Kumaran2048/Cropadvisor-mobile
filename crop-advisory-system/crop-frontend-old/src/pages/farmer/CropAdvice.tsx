import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Cpu, 
  CheckCircle2, 
  Info, 
  ChevronRight,
  Droplets
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Farmer } from '../../types';
import { recommendCrops } from '../../utils/recommendCrops';
import { toast } from 'sonner';
import API from '../../utils/api';

export const CropAdvice: React.FC = () => {
  const { user } = useAuth();
  const { crops, setActiveCrop } = useAppData();
  const farmer = user as Farmer;

  const [expandedCropId, setExpandedCropId] = useState<string | null>(null);

  const [topRecommendedCrop, setTopRecommendedCrop] = useState<any>(null);
  const [step, setStep] = useState<'input' | 'results'>('input');
  const [soilType, setSoilType] = useState(farmer?.soilType || 'Loamy');
  const [district, setDistrict] = useState(farmer?.district || '');
  const [season, setSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Kharif');
  const [waterLevel, setWaterLevel] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);

  const recommendations = useMemo(() => {
    return recommendCrops(crops, soilType, season);
  }, [crops, soilType, season]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // 1. Fetch real-time weather for the district
      let weatherData = { temperature: 25, humidity: 70, rainfall: 100 };
      try {
        const weatherRes = await API.get('/weather/current');
        if (weatherRes.data && weatherRes.data.weather) {
          weatherData = {
            temperature: weatherRes.data.weather.temperature || 25,
            humidity: weatherRes.data.weather.humidity || 70,
            rainfall: weatherRes.data.weather.rainfall || 100
          };
        }
      } catch (wErr) {
        console.warn("Weather fetch failed, using defaults");
      }

      // 2. Soil NPK presets based on type
      const soilPresets: any = {
        'Black Soil': { n: '80', p: '50', k: '40', ph: '7.5' },
        'Red Soil': { n: '60', p: '30', k: '30', ph: '6.0' },
        'Sandy Soil': { n: '40', p: '20', k: '20', ph: '6.5' },
        'Loamy Soil': { n: '90', p: '45', k: '45', ph: '7.0' },
        'Alluvial Soil': { n: '100', p: '50', k: '50', ph: '7.2' },
        'Laterite Soil': { n: '50', p: '25', k: '25', ph: '5.5' }
      };

      const payload = {
        ...soilPresets[soilType],
        temperature: weatherData.temperature.toString(),
        humidity: weatherData.humidity.toString(),
        rainfall: weatherData.rainfall.toString(),
        ph: soilPresets[soilType].ph
      };

      // 3. Call ML Service
      const res = await API.post('/ml/recommend-crop', payload);
      const mlCropName = res.data.recommendedCrop || 'Rice';

      // 4. Fetch dynamic ML-based Fertilizer Prediction for this crop
      let fertilizerName = 'NPK 12:32:16'; // Fallback
      try {
        const fertPayload = {
          temperature: payload.temperature,
          humidity: payload.humidity,
          moisture: '35',
          soilType: soilType.replace(' Soil', ''),
          cropType: mlCropName,
          n: payload.n,
          p: payload.p,
          k: payload.k
        };
        const fertRes = await API.post('/ml/predict-fertilizer', fertPayload);
        if (fertRes.data && fertRes.data.recommendedFertilizer) {
          fertilizerName = fertRes.data.recommendedFertilizer;
        }
      } catch (fErr) {
        console.warn("Fertilizer prediction call failed in CropAdvice, using default", fErr);
      }

      // 5. Find the matching crop object in our database to get prices/etc
      const matchedCrop = crops.find(c => c.name.toLowerCase().includes(mlCropName.toLowerCase()));
      
      setTopRecommendedCrop({
        ...res.data,
        crop: matchedCrop || { name: mlCropName, emoji: '🌿', avgYieldPerAcre: 2.5, currentPrice: 18000 },
        fertilizer: fertilizerName
      });

      setStep('results');
    } catch (err) {
      toast.error('AI Recommendation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getWaterLabel = (val: number) => {
    if (val < 30) return 'LOW';
    if (val < 70) return 'MEDIUM';
    return 'HIGH';
  };

  const handleConfirmCrop = async (cropId: string) => {
    await setActiveCrop(cropId);
  };


  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] -mx-6 -mt-6 pb-20 px-6 pt-6">
      <AnimatePresence mode="wait">
        {step === 'input' ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            {/* Header */}
            <div className="flex items-center gap-4">
              <button onClick={() => window.history.back()} className="p-2 hover:bg-[var(--surface)] rounded-full transition-colors">
                <ArrowLeft size={24} className="text-[var(--text)]" />
              </button>
              <h1 className="text-2xl font-bold font-serif text-[var(--text)]">AI Crop Advisor</h1>
            </div>

            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Enter your field details to get AI-powered crop recommendations for maximum yield.
            </p>

            {/* Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[2px]">Soil Type</label>
                <select 
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-[var(--text)] focus:ring-2 focus:ring-farmer/50 outline-none transition-all appearance-none"
                >
                  <option>Loamy Soil</option>
                  <option>Black Soil</option>
                  <option>Red Soil</option>
                  <option>Alluvial Soil</option>
                  <option>Sandy Soil</option>
                  <option>Laterite Soil</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[2px]">District</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                  <input 
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Enter district, state"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 pl-12 text-[var(--text)] focus:ring-2 focus:ring-farmer/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[2px]">Season</label>
                <div className="flex gap-2 p-1 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                  {(['Kharif', 'Rabi', 'Zaid'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeason(s)}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${season === s ? 'bg-farmer/10 text-farmer border border-farmer/30 shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[2px]">Water Availability</label>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[1px]">{getWaterLabel(waterLevel)}</span>
                </div>
                <div className="relative pt-2">
                   <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={waterLevel}
                    onChange={(e) => setWaterLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div 
                    className="absolute h-1.5 bg-blue-500 rounded-lg top-2 pointer-events-none transition-all"
                    style={{ width: `${waterLevel}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-farmer to-[#84CC16] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-farmer/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                   <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Cpu size={20} />
                    Generate Recommendations
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
             <div className="flex items-center gap-4 mb-2">
              <button onClick={() => setStep('input')} className="p-2 hover:bg-[var(--surface)] rounded-full transition-colors">
                <ArrowLeft size={20} className="text-[var(--text)]" />
              </button>
              <h1 className="text-xl font-bold text-[var(--text)]">AI Crop Advisor</h1>
            </div>

            {/* Status Card */}
            <div className="bg-farmer/5 border border-farmer/20 p-6 rounded-2xl flex items-start gap-4">
              <div className="bg-farmer p-1 rounded-full text-white">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text)]">Analysis Complete</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Found {recommendations.length} optimal crops for {soilType} in {season} season.</p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-6">
              {/* Primary AI Recommendation */}
              {topRecommendedCrop && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-[var(--surface)] to-[var(--background)] border-2 border-farmer/30 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -right-10 -top-10 text-farmer/10 rotate-12">
                    <Cpu size={200} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-farmer text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                          <CheckCircle2 size={12} /> Best AI Match
                        </div>
                        <h2 className="text-4xl font-black text-[var(--text)] mb-2">{topRecommendedCrop.crop.name}</h2>
                        <p className="text-farmer text-sm font-bold tracking-wide">CONFIDENCE: {topRecommendedCrop.confidence}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[var(--text)]">
                          ₹{((topRecommendedCrop.crop.currentPrice || 18000) * (topRecommendedCrop.crop.avgYieldPerAcre || 2.5)).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Est. Revenue / Acre</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Water Need</p>
                        <div className="flex items-center gap-2 text-blue-500">
                          <Droplets size={16} />
                          <span className="font-bold">Moderate</span>
                        </div>
                      </div>
                      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Fertilizer</p>
                        <p className="text-sm font-bold text-[var(--text)]">{topRecommendedCrop.fertilizer}</p>
                      </div>
                      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Harvest Time</p>
                        <p className="text-sm font-bold text-[var(--text)]">110-120 Days</p>
                      </div>
                    </div>

                    <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] mb-6">
                      <h4 className="text-sm font-black text-farmer uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Info size={16} /> Maintenance Strategy
                      </h4>
                      <ul className="text-xs text-[var(--text-muted)] space-y-2 leading-relaxed">
                        <li className="flex gap-2">
                          <span className="text-farmer">•</span>
                          <strong>Fertilization:</strong> Apply first dose during sowing. Use Urea after 25 days for leaf growth.
                        </li>
                        <li className="flex gap-2">
                          <span className="text-farmer">•</span>
                          <strong>Irrigation:</strong> Maintain soil moisture at 60-70%. Avoid flooding during flowering stage.
                        </li>
                        <li className="flex gap-2">
                          <span className="text-farmer">•</span>
                          <strong>Protection:</strong> Monitor for early signs of Leaf Spot. Spray Neem oil as a preventive measure.
                        </li>
                      </ul>
                    </div>

                    <button 
                      onClick={() => handleConfirmCrop(topRecommendedCrop.crop.id || topRecommendedCrop.crop._id || topRecommendedCrop.crop.name)}
                      className="w-full bg-farmer text-white font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-farmer/20"
                    >
                      Confirm & Set as Active Crop
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Secondary Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations
                  .filter(r => r.name !== topRecommendedCrop?.crop.name)
                  .slice(0, 4)
                  .map((crop, idx) => (
                  <motion.div
                    key={crop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 hover:border-farmer/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold mb-1 text-[var(--text)] group-hover:text-farmer transition-colors">{crop.name}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{crop.score}% Match</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--text)] font-bold text-sm">₹{((crop.currentPrice || 18000) * (crop.avgYieldPerAcre || 2.5)).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleConfirmCrop(crop.id)}
                      className="w-full bg-[var(--background)] hover:bg-farmer hover:text-white text-[var(--text)] py-3 rounded-xl text-xs font-bold transition-all border border-[var(--border)]"
                    >
                      Select Alternative
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};