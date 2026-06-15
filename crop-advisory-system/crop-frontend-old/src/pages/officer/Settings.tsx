import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Toggle';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Officer } from '../../types';
import { toast } from 'sonner';
import { LogOutIcon, MoonIcon, SunIcon } from 'lucide-react';
export const OfficerSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { updateOfficer } = useAppData();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const officer = user as Officer;
  const [formData, setFormData] = useState({
    name: officer.name,
    phone: officer.phone || ''
  });
  const [notifications, setNotifications] = useState({
    newReports: true,
    outbreaks: true,
    systemAlerts: true
  });
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficer({
      ...officer,
      name: formData.name,
      phone: formData.phone
    });
    toast.success('Profile updated successfully');
  };
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="max-w-md mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
          Settings
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <h3 className="font-bold text-[var(--text)] mb-4">Edit Profile</h3>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value
            })
            } />
          
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) =>
            setFormData({
              ...formData,
              phone: e.target.value
            })
            } />
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Assigned District
            </label>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-[var(--text-muted)] text-sm cursor-not-allowed">
              {officer.district} (Contact Admin to change)
            </div>
          </div>
          <Button
            type="submit"
            fullWidth
            className="bg-officer hover:bg-officer-light mt-4">
            
            Save Changes
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--text)] mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">
                New Disease Reports
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                When a farmer scans a disease
              </p>
            </div>
            <Toggle
              checked={notifications.newReports}
              onChange={(c) =>
              setNotifications({
                ...notifications,
                newReports: c
              })
              } />
            
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">Outbreak Alerts</p>
              <p className="text-xs text-[var(--text-muted)]">
                When AI detects a cluster
              </p>
            </div>
            <Toggle
              checked={notifications.outbreaks}
              onChange={(c) =>
              setNotifications({
                ...notifications,
                outbreaks: c
              })
              } />
            
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center">
          <span className="font-medium text-[var(--text)]">Theme</span>
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