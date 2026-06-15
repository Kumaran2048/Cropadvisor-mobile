import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Toggle';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { Farmer } from '../../types';
import { toast } from 'sonner';
export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();

  if (!user) return null;
  const farmer = user as Farmer;
  const [formData, setFormData] = useState({
    name: farmer.name,
    phone: farmer.phone || '',
    landSize: farmer.landSize?.toString() || '0'
  });
  const [notifications, setNotifications] = useState({
    weather: true,
    market: true,
    disease: true,
    officer: true
  });
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        landSize: Number(formData.landSize)
      });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };
  return (
    <div className="max-w-md mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
          Settings
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Manage your preferences
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
          
          <Input
            label="Land Size (Acres)"
            type="number"
            step="0.1"
            value={formData.landSize}
            onChange={(e) =>
            setFormData({
              ...formData,
              landSize: e.target.value
            })
            } />
          
          <Button type="submit" fullWidth>
            Save Changes
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--text)] mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">Weather Alerts</p>
              <p className="text-xs text-[var(--text-muted)]">
                Rain, storms, extreme heat
              </p>
            </div>
            <Toggle
              checked={notifications.weather}
              onChange={(c) =>
              setNotifications({
                ...notifications,
                weather: c
              })
              } />
            
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">Market Updates</p>
              <p className="text-xs text-[var(--text-muted)]">
                Price drops and surges
              </p>
            </div>
            <Toggle
              checked={notifications.market}
              onChange={(c) =>
              setNotifications({
                ...notifications,
                market: c
              })
              } />
            
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">
                Disease Outbreaks
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Alerts in your district
              </p>
            </div>
            <Toggle
              checked={notifications.disease}
              onChange={(c) =>
              setNotifications({
                ...notifications,
                disease: c
              })
              } />
            
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">
                Officer Broadcasts
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Advisories from your officer
              </p>
            </div>
            <Toggle
              checked={notifications.officer}
              onChange={(c) =>
              setNotifications({
                ...notifications,
                officer: c
              })
              } />
            
          </div>
        </div>
      </Card>
    </div>);

};