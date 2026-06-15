import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Officer } from '../../types';
import {
  SearchIcon,
  PhoneIcon,
  MapPinIcon,
  SproutIcon,
  UsersIcon } from
'lucide-react';
export const FarmersList: React.FC = () => {
  const { user } = useAuth();
  const { farmers } = useAppData();
  const officer = user as Officer;
  const [search, setSearch] = useState('');
  const districtFarmers = farmers.filter((f) => f.district === officer.district);
  const filteredFarmers = districtFarmers.filter(
    (f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.activeCrop?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
            Farmers Directory
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            {districtFarmers.length} farmers in {officer.district}
          </p>
        </div>
        <div className="w-full md:w-72">
          <Input
            placeholder="Search by name or crop..."
            icon={<SearchIcon size={18} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)} />
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFarmers.map((farmer) =>
        <Card key={farmer.id} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-farmer/10 text-farmer flex items-center justify-center text-xl">
                  👨‍🌾
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text)]">
                    {farmer.name}
                  </h3>
                  <div className="flex items-center text-sm text-[var(--text-muted)] mt-0.5">
                    <PhoneIcon size={12} className="mr-1" />
                    {farmer.phone || 'N/A'}
                  </div>
                </div>
              </div>
              <Badge variant={farmer.isActive ? 'success' : 'neutral'}>
                {farmer.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-[var(--border)]">
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  LAND & SOIL
                </p>
                <p className="text-sm font-medium text-[var(--text)] flex items-center gap-1">
                  <MapPinIcon size={14} className="text-gray-400" />
                  {farmer.landSize} ac · {farmer.soilType}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  ACTIVE CROP
                </p>
                <p className="text-sm font-medium text-[var(--text)] flex items-center gap-1">
                  <SproutIcon size={14} className="text-green-500" />
                  {farmer.activeCrop || 'None'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {filteredFarmers.length === 0 &&
        <div className="col-span-full text-center py-12 text-[var(--text-muted)]">
            <UsersIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>No farmers found matching "{search}"</p>
          </div>
        }
      </div>
    </div>);

};