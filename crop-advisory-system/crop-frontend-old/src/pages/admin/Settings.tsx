import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Toggle';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Admin } from '../../types';
import { toast } from 'sonner';
import { LogOutIcon, MoonIcon, SunIcon, ShieldCheckIcon } from 'lucide-react';
export const AdminSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const admin = user as Admin;
  const [formData, setFormData] = useState({
    name: admin.name,
    email: admin.email
  });
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    debugLogging: false
  });
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd update the admin context here
    toast.success('Admin profile updated successfully');
  };
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-1">
          System Settings
        </h1>
        <p className="text-[var(--text-muted)]">
          Manage admin profile and global system configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <ShieldCheckIcon size={18} className="text-admin" /> Admin Profile
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Admin Name"
                value={formData.name}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
                } />
              
              <Input
                label="Admin Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
                } />
              
              <Button
                type="submit"
                className="bg-admin hover:bg-admin-light w-full mt-4">
                
                Update Profile
              </Button>
            </form>
          </Card>

          <Card>
            <div className="flex justify-between items-center">
              <span className="font-medium text-[var(--text)]">
                Interface Theme
              </span>
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
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-[var(--text)] mb-4">
              Global System Toggles
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border border-[var(--border)] rounded-lg">
                <div>
                  <p className="font-medium text-[var(--text)] text-sm">
                    Maintenance Mode
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Disable access for non-admins
                  </p>
                </div>
                <Toggle
                  checked={systemSettings.maintenanceMode}
                  onChange={(c) =>
                  setSystemSettings({
                    ...systemSettings,
                    maintenanceMode: c
                  })
                  } />
                
              </div>
              <div className="flex justify-between items-center p-3 border border-[var(--border)] rounded-lg">
                <div>
                  <p className="font-medium text-[var(--text)] text-sm">
                    Automated Backups
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Daily database snapshots
                  </p>
                </div>
                <Toggle
                  checked={systemSettings.autoBackup}
                  onChange={(c) =>
                  setSystemSettings({
                    ...systemSettings,
                    autoBackup: c
                  })
                  } />
                
              </div>
              <div className="flex justify-between items-center p-3 border border-[var(--border)] rounded-lg">
                <div>
                  <p className="font-medium text-[var(--text)] text-sm">
                    Verbose Debug Logging
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Detailed API logs (impacts performance)
                  </p>
                </div>
                <Toggle
                  checked={systemSettings.debugLogging}
                  onChange={(c) =>
                  setSystemSettings({
                    ...systemSettings,
                    debugLogging: c
                  })
                  } />
                
              </div>
            </div>
          </Card>

          <Button
            variant="danger"
            fullWidth
            onClick={handleSignOut}
            className="gap-2 py-3">
            
            <LogOutIcon size={18} />
            Sign Out of Admin Console
          </Button>
        </div>
      </div>
    </div>);

};