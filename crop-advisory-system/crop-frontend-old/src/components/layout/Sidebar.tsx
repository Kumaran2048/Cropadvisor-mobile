import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  HomeIcon,
  SproutIcon,
  ScanIcon,
  CloudSunIcon,
  TrendingUpIcon,
  WalletIcon,
  CalculatorIcon,
  BeakerIcon,
  BellIcon,
  UserIcon,
  SettingsIcon,
  UsersIcon,
  FileTextIcon,
  MapIcon,
  RadioIcon,
  ShieldAlertIcon,
  MapPinIcon,
  DatabaseIcon,
  ActivityIcon,
  PieChartIcon } from
'lucide-react';
interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;
  const themeColor =
  user.role === 'farmer' ?
  'bg-farmer' :
  user.role === 'officer' ?
  'bg-officer' :
  'bg-admin';
  const farmerLinks = [
  {
    to: '/farmer/profile',
    icon: <UserIcon size={20} />,
    label: t('nav.profile')
  },
  {
    to: '/farmer/soil',
    icon: <BeakerIcon size={20} />,
    label: t('soilAdvisor')
  },
  {
    to: '/farmer/weather',
    icon: <CloudSunIcon size={20} />,
    label: t('nav.weather')
  },
  {
    to: '/farmer/market',
    icon: <TrendingUpIcon size={20} />,
    label: t('nav.market')
  },
  {
    to: '/farmer/crops',
    icon: <SproutIcon size={20} />,
    label: t('nav.crops')
  },
  {
    to: '/farmer/whatif',
    icon: <CalculatorIcon size={20} />,
    label: t('nav.whatif')
  },
  {
    to: '/farmer',
    icon: <HomeIcon size={20} />,
    label: t('nav.dashboard')
  },
  {
    to: '/farmer/scan',
    icon: <ScanIcon size={20} />,
    label: t('nav.scan')
  },
  {
    to: '/farmer/alerts',
    icon: <BellIcon size={20} />,
    label: t('nav.alerts')
  },
  {
    to: '/farmer/expenses',
    icon: <WalletIcon size={20} />,
    label: t('nav.expenses')
  },
  {
    to: '/farmer/profit',
    icon: <PieChartIcon size={20} />,
    label: t('nav.profit')
  },
  {
    to: '/farmer/settings',
    icon: <SettingsIcon size={20} />,
    label: t('nav.settings')
  }];

  const officerLinks = [
  {
    to: '/officer',
    icon: <HomeIcon size={20} />,
    label: t('nav.dashboard')
  },
  {
    to: '/officer/farmers',
    icon: <UsersIcon size={20} />,
    label: t('nav.farmers')
  },
  {
    to: '/officer/reports',
    icon: <FileTextIcon size={20} />,
    label: t('nav.reports')
  },
  {
    to: '/officer/heatmap',
    icon: <MapIcon size={20} />,
    label: t('nav.heatmap')
  },
  {
    to: '/officer/broadcast',
    icon: <RadioIcon size={20} />,
    label: t('nav.broadcast')
  },
  {
    to: '/officer/risk',
    icon: <ShieldAlertIcon size={20} />,
    label: t('nav.risk')
  },
  {
    to: '/officer/visits',
    icon: <MapPinIcon size={20} />,
    label: t('nav.visits')
  },
  {
    to: '/officer/settings',
    icon: <SettingsIcon size={20} />,
    label: t('nav.settings')
  }];

  const adminLinks = [
  {
    to: '/admin',
    icon: <HomeIcon size={20} />,
    label: t('nav.dashboard')
  },
  {
    to: '/admin/officers',
    icon: <UserIcon size={20} />,
    label: t('nav.officers')
  },
  {
    to: '/admin/users',
    icon: <UsersIcon size={20} />,
    label: t('nav.users')
  },
  {
    to: '/admin/database',
    icon: <DatabaseIcon size={20} />,
    label: t('nav.database')
  },
  {
    to: '/admin/health',
    icon: <ActivityIcon size={20} />,
    label: t('nav.health')
  },
  {
    to: '/admin/insights',
    icon: <PieChartIcon size={20} />,
    label: t('nav.insights')
  },
  {
    to: '/admin/settings',
    icon: <SettingsIcon size={20} />,
    label: t('nav.settings')
  }];

  const links =
  user.role === 'farmer' ?
  farmerLinks :
  user.role === 'officer' ?
  officerLinks :
  adminLinks;
  return (
    <aside
      className={`w-[260px] h-screen fixed left-0 top-0 ${themeColor} text-white flex flex-col z-20`}>
      
      <div className="p-6 flex items-center gap-3">
        <SproutIcon size={32} className="text-gold" />
        <h1 className="font-serif text-2xl font-bold tracking-wide">
          {t('app.title')}
        </h1>
      </div>

      <div className="px-6 pb-4">
        <div className="text-xs uppercase tracking-wider opacity-70 mb-1">
          {t(`role.${user.role}`)}
        </div>
        <div className="font-medium truncate">{user.name}</div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
        {links.map((link) =>
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === `/${user.role}`}
          onClick={onClose}
          className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10 opacity-80 hover:opacity-100'}`
          }>
          
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        )}
      </nav>
    </aside>);

};