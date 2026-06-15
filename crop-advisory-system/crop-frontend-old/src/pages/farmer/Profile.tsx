import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Farmer } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DistrictOfficerCard } from '../../components/shared/DistrictOfficerCard';
import { LogOutIcon, MoonIcon, SunIcon } from 'lucide-react';
export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const farmer = user as Farmer;
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="max-w-md mx-auto pb-20 space-y-6">
      {/* Hero Section */}
      <div className="bg-farmer text-white p-8 rounded-b-[24px] -mx-6 -mt-6 mb-6 text-center">
        <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl border-4 border-white/10">
          👨‍🌾
        </div>
        <h1 className="font-serif text-2xl font-bold mb-1">{farmer.name}</h1>
        <p className="text-sm opacity-90 mb-3">{farmer.email}</p>
        <Badge className="bg-white text-farmer hover:bg-white">Farmer</Badge>
      </div>

      <DistrictOfficerCard district={farmer.district} />

      {/* Info Rows */}
      <Card className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
          <span className="text-[var(--text-muted)]">Land Size</span>
          <span className="font-medium text-[var(--text)]">
            {farmer.landSize} acres
          </span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
          <span className="text-[var(--text-muted)]">Soil Type</span>
          <span className="font-medium text-[var(--text)]">
            {farmer.soilType}
          </span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
          <span className="text-[var(--text-muted)]">District</span>
          <span className="font-medium text-[var(--text)]">
            {farmer.district}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)]">Active Crop</span>
          <span className="font-medium text-[var(--text)] flex items-center gap-2">
            🍅 {farmer.activeCrop}
          </span>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            LANGUAGE / भाषा / மொழி
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['en', 'hi', 'mr', 'ta', 'te'] as const).map((lang) =>
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${language === lang ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-300' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              
                {lang === 'en' ?
              'GB English' :
              lang === 'hi' ?
              'IN हिंदी' :
              lang === 'mr' ?
              'मराठी' :
              lang === 'ta' ?
              'தமிழ்' :
              'తెలుగు'}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
          <span className="text-[var(--text-muted)]">Theme</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-[var(--text)]">
            
            {theme === 'dark' ?
            <MoonIcon size={16} className="text-blue-400" /> :

            <SunIcon size={16} className="text-gold" />
            }
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </Card>

      <Button
        variant="danger"
        fullWidth
        onClick={handleSignOut}
        className="gap-2">
        
        <LogOutIcon size={18} />
        Sign Out
      </Button>
    </div>);

};