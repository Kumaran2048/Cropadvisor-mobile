import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Farmer } from '../../types';
import { Card } from '../../components/ui/Card';
import { DistrictOfficerCard } from '../../components/shared/DistrictOfficerCard';
import {
  MapPinIcon,
  BellIcon,
  ScanIcon,
  SproutIcon,
  TrendingUpIcon,
  WalletIcon,
  ChevronRight } from
'lucide-react';
import { predictProfit } from '../../utils/predictProfit';
import { SUPPORTED_REGIONS } from '../../utils/constants';
import { toast } from 'sonner';

export const FarmerDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { crops, expenses } = useAppData();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const farmer = user as Farmer;

  // If farmer doesn't have a district or state set (e.g. newly signed up with Google), force them to select it!
  const hasNoRegion = !farmer.district || !farmer.state;

  const [stateVal, setStateVal] = useState('');
  const [districtVal, setDistrictVal] = useState('');
  const [landVal, setLandVal] = useState('1.0');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const availableStates = Object.keys(SUPPORTED_REGIONS || {});
  const availableDistricts = stateVal ? SUPPORTED_REGIONS[stateVal] : [];

  const handleProfileComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateVal || !districtVal) {
      setProfileError('Please select both state and district');
      return;
    }
    setProfileLoading(true);
    setProfileError('');
    try {
      if (updateProfile) {
        await updateProfile({
          name: farmer.name,
          phone: farmer.phone || '',
          state: stateVal,
          district: districtVal,
          landSize: Number(landVal)
        });
        toast.success('Profile setup completed successfully!');
      }
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  if (hasNoRegion) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🌱
            </div>
            <h2 className="text-2xl font-black text-gray-800 font-serif">Welcome, {farmer.name}!</h2>
            <p className="text-sm text-gray-500 mt-2">
              To provide accurate local crop advice, weather alerts, and market prices, please set up your farming location.
            </p>
          </div>

          {profileError && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-600 text-xs font-bold">{profileError}</p>
            </div>
          )}

          <form onSubmit={handleProfileComplete} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select State</label>
              <select
                value={stateVal}
                onChange={(e) => { setStateVal(e.target.value); setDistrictVal(''); }}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-farmer"
                required
              >
                <option value="">Choose State...</option>
                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select District</label>
              <select
                value={districtVal}
                onChange={(e) => setDistrictVal(e.target.value)}
                disabled={!stateVal}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-farmer disabled:opacity-50"
                required
              >
                <option value="">Choose District...</option>
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Land Size (Acres)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={landVal}
                onChange={(e) => setLandVal(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-farmer"
                required
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-farmer text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {profileLoading ? 'Setting Up...' : 'Start Farming! →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeCropData = crops.find((c) => c.name === farmer.activeCrop);
  
  const farmerExpenses = expenses.filter((e) => e.farmerId === farmer.id);
  const totalExpenses = farmerExpenses.reduce((sum, e) => sum + e.amount, 0);

  let estProfit = 0;
  if (activeCropData) {
    const prediction = predictProfit(
      activeCropData,
      farmer.landSize,
      activeCropData.currentPrice
    );
    estProfit = prediction.netProfit;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 px-4">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-farmer text-white p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-farmer/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm opacity-80 uppercase tracking-[2px] font-bold">{t('dashboard.greeting')}</p>
                <h2 className="text-3xl font-bold font-serif mt-1">
                  {farmer.name} 👨‍🌾
                </h2>
                <div className="flex items-center text-sm opacity-80 mt-2">
                  <MapPinIcon size={14} className="mr-1" />
                  {farmer.district}, Maharashtra
                </div>
              </div>
              <button className="relative p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                <BellIcon size={20} />
                <span className="absolute top-2 right-2 w-3 h-3 bg-danger rounded-full border-2 border-farmer"></span>
              </button>
            </div>

            {/* Active Crop Status */}
            {activeCropData ? (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-3xl">
                      {activeCropData.emoji}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-70 mb-1">{t('dashboard.activeCrop')}</p>
                      <h3 className="text-xl font-bold">{activeCropData.name}</h3>
                      <p className="text-sm opacity-80">{farmer.landSize} Acres</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-1">{t('dashboard.estProfit')}</p>
                    <p className="text-3xl font-bold text-gold">₹{estProfit.toLocaleString()}</p>
                    <p className="text-[10px] opacity-60">BASED ON MARKET TRENDS</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-2 font-medium">
                    <span className="opacity-80">Season Progress</span>
                    <span className="text-gold">56% Completed</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-gold to-yellow-300 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(232,184,75,0.4)]" style={{ width: '56%' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/20 border-dashed rounded-2xl p-8 text-center backdrop-blur-md cursor-pointer hover:bg-white/20 transition-all" onClick={() => navigate('/farmer/crops')}>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                   <SproutIcon size={24} />
                </div>
                <h3 className="font-bold">No Active Crop Selected</h3>
                <p className="text-sm opacity-70 mt-1">Select a crop to get personalized advice and profit tracking.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Officer & Market Snapshot */}
        <div className="space-y-6">
          <DistrictOfficerCard district={farmer.district} />
          
          <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-lg">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Financial Summary</h3>
                <WalletIcon className="text-farmer opacity-20" size={20} />
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 uppercase">{t('dashboard.expenses')}</span>
                  <span className="font-bold text-danger">₹{totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-farmer/5 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 uppercase">{t('dashboard.netProfit')}</span>
                  <span className="font-bold text-farmer">₹{(estProfit - totalExpenses).toLocaleString()}</span>
                </div>
             </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {t('dashboard.quickActions')}
          <div className="h-px flex-1 bg-gray-200"></div>
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('nav.scan'), icon: ScanIcon, color: 'bg-red-50 text-red-500', path: '/farmer/scan' },
            { label: t('nav.crops'), icon: SproutIcon, color: 'bg-green-50 text-green-600', path: '/farmer/crops' },
            { label: t('nav.market'), icon: TrendingUpIcon, color: 'bg-blue-50 text-blue-500', path: '/farmer/market' },
            { label: t('nav.expenses'), icon: WalletIcon, color: 'bg-yellow-50 text-yellow-600', path: '/farmer/expenses' }
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all text-center group"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <action.icon size={28} />
              </div>
              <div className="flex items-center gap-1 font-bold text-gray-800">
                {action.label}
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};