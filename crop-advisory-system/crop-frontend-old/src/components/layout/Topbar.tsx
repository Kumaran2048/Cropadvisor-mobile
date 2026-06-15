import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppData } from '../../contexts/AppDataContext';
import {
  SearchIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  GlobeIcon,
  MenuIcon,
  UserIcon } from
'lucide-react';

interface TopbarProps {
  onMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { broadcasts, diseaseReports } = useAppData();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  const districtAlerts = broadcasts.filter(b => b.district === user.district);
  // High confidence disease reports in the same district count as alerts too
  const outbreakAlerts = diseaseReports.filter(r => r.district === user.district && r.confidence > 90 && r.status === 'pending');
  const alertCount = districtAlerts.length + outbreakAlerts.length;

  const alertsPath = user.role === 'farmer' ? '/farmer/alerts' : (user.role === 'officer' ? '/officer/reports' : '#');

  return (
    <header className="h-[64px] bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10 flex items-center justify-between px-6 shadow-sm gap-4">
      <button 
        onClick={onMenuToggle}
        className="md:hidden p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <MenuIcon size={22} />
      </button>
      
      <div className="flex-1 max-w-md">
        <div className="relative">
          <SearchIcon
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
          
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-farmer text-[var(--text)]" />
          
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="relative group">
          <button className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text)]">
            <GlobeIcon size={20} />
            <span className="text-sm font-medium uppercase">{language}</span>
          </button>
          <div className="absolute right-0 mt-2 w-32 bg-[var(--surface)] border border-[var(--border)] rounded-card shadow-cardHover hidden group-hover:block">
            {(['en', 'hi', 'mr', 'ta', 'te'] as const).map((lang) =>
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${language === lang ? 'font-bold text-farmer' : 'text-[var(--text)]'}`}>
              
                {lang === 'en' ?
              'English' :
              lang === 'hi' ?
              'हिंदी' :
              lang === 'mr' ?
              'मराठी' :
              lang === 'ta' ?
              'தமிழ்' :
              'తెలుగు'}
              </button>
            )}
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="text-[var(--text-muted)] hover:text-[var(--text)]">
          
          {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>

        {/* Notifications */}
        <Link to={alertsPath} className="relative text-[var(--text-muted)] hover:text-[var(--text)]">
          <BellIcon size={20} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {alertCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-[var(--border)]">
          <UserIcon size={16} className="text-gray-500" />
        </div>
      </div>
    </header>);

};