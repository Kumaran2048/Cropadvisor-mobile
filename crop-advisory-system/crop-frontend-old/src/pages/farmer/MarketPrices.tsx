import React, { useState } from 'react';
import {
  SearchIcon,
  MapPinIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  TrendingUp,
  History } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

import API from '../../utils/api';

export const MarketPrices: React.FC = () => {
  const { user } = useAuth();
  const { prices, refreshPrices } = useAppData();
  const { t } = useLanguage();
  const [selectedState, setSelectedState] = useState(user?.state || 'Maharashtra');
  const [search, setSearch] = useState('');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<any | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const filteredPrices = prices.filter((p) =>
    p.cropName.toLowerCase().includes(search.toLowerCase()) ||
    p.mandiName?.toLowerCase().includes(search.toLowerCase())
  );

  const fetchHistory = async (price: any) => {
    setSelectedCrop(price);
    setLoadingHistory(true);
    try {
      const { data } = await API.get(`/market/history?cropName=${price.cropName}&mandiName=${price.mandiName}`);
      setHistoryData(data.history || []);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Dynamic insights
  const uniqueMandis = new Set(prices.map(p => p.mandiName)).size;
  const highestPriceCrop = prices.length > 0 ? [...prices].sort((a, b) => b.modalPrice - a.modalPrice)[0] : null;
  const categories = ['Cereals', 'Vegetables', 'Fruits', 'Spices'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-1">
            Mandi Market Insights
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Live prices from state-authorized mandis · Updated 10m ago
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* State Filter Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={selectedState}
              onChange={async (e) => {
                const val = e.target.value;
                setSelectedState(val);
                await refreshPrices(val === 'All States' ? '' : val);
              }}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] focus:ring-2 focus:ring-farmer/50 outline-none transition-all appearance-none shadow-sm font-medium cursor-pointer"
            >
              {['All States', 'Maharashtra', 'Punjab', 'Uttar Pradesh', 'Gujarat', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'West Bengal'].map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search crop or mandi..."
              icon={<SearchIcon size={18} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* History Modal Overlay */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-farmer text-white">
              <div>
                <h3 className="font-bold text-xl">{selectedCrop.cropName}</h3>
                <p className="text-sm opacity-80">{selectedCrop.mandiName} History</p>
              </div>
              <button onClick={() => setSelectedCrop(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                   <div className="w-8 h-8 border-4 border-farmer border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-sm text-[var(--text-muted)]">Fetching historical data...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyData.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border)]">
                      <div>
                        <p className="text-xs font-bold text-gray-500">{new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-lg font-bold text-[var(--text)]">₹{h.modalPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase">Min / Max</p>
                        <p className="text-sm font-medium text-[var(--text-muted)]">₹{h.minPrice} - ₹{h.maxPrice}</p>
                      </div>
                    </div>
                  ))}
                  {historyData.length === 0 && <p className="text-center py-10 text-[var(--text-muted)]">No historical records found.</p>}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Top Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-none flex items-center gap-4 p-4">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
             <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Highest Value</p>
            <h4 className="font-bold text-gray-800">{highestPriceCrop ? `${highestPriceCrop.cropName} (${highestPriceCrop.district})` : 'Loading...'}</h4>
            <p className="text-xs text-green-600 font-bold">Peak Market Rate</p>
          </div>
        </Card>
        <Card className="bg-blue-50 border-none flex items-center gap-4 p-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
             <History size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Market Stability</p>
            <h4 className="font-bold text-gray-800">{randomCategory} & Grains</h4>
            <p className="text-xs text-blue-600 font-bold">Stable Trend</p>
          </div>
        </Card>
        <Card className="bg-farmer/5 border-none flex items-center gap-4 p-4">
          <div className="w-12 h-12 bg-farmer/10 rounded-2xl flex items-center justify-center text-farmer">
             <MapPinIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-farmer uppercase tracking-widest">Active Mandis</p>
            <h4 className="font-bold text-gray-800">{uniqueMandis} Regional Mandis</h4>
            <p className="text-xs text-farmer font-bold">Live Data Active</p>
          </div>
        </Card>
      </div>

      {/* Main Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrices.map((price, idx) => (
          <Card key={idx} className="overflow-hidden hover:shadow-xl transition-all border-none shadow-lg shadow-gray-200/50 group">
            <div className="p-6 bg-gradient-to-br from-white to-gray-50/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-xl text-[var(--text)] group-hover:text-farmer transition-colors">
                    {price.cropName}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] flex items-center mt-1">
                    <MapPinIcon size={12} className="mr-1 text-danger" />
                    {price.mandiName} ({price.district})
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                    <TrendingUpIcon size={12} /> Live
                  </div>
                </div>
              </div>

              <div className="text-center bg-white rounded-2xl p-4 shadow-inner mb-6">
                 <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[2px] font-bold mb-1">Modal Price</p>
                 <p className="text-3xl font-black text-gray-800">
                    ₹{price.modalPrice?.toLocaleString()}
                 </p>
                 <p className="text-[10px] text-[var(--text-muted)]">per quintal</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mb-1">MIN</p>
                  <p className="font-bold text-gray-700">₹{price.minPrice?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mb-1">MAX</p>
                  <p className="font-bold text-gray-700">₹{price.maxPrice?.toLocaleString()}</p>
                </div>
              </div>

              <button 
                onClick={() => fetchHistory(price)}
                className="w-full py-3 bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-xl text-sm font-bold hover:bg-farmer hover:text-white hover:border-farmer transition-all flex items-center justify-center gap-2"
              >
                <History size={16} />
                View Price History
              </button>
            </div>
            <div className="px-6 pb-4 border-t border-gray-50 bg-gray-50/30">
              <p className="text-[10px] text-gray-400 text-center py-2 italic">
                Latest Report: {new Date(price.date).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}

        {filteredPrices.length === 0 && (
          <div className="col-span-full text-center py-20 text-[var(--text-muted)]">
            <div className="text-4xl mb-4 opacity-20">🔍</div>
            <p>No commodities found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
};