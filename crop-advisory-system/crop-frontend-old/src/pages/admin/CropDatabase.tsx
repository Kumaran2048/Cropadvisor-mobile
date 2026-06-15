import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { Crop } from '../../types';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';
export const CropDatabase: React.FC = () => {
  const { crops, addCrop, deleteCrop } = useAppData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCrop, setNewCrop] = useState({
    name: '',
    emoji: '🌿',
    avgYieldPerAcre: 5,
    soilTypes: ['Loamy'],
    season: ['Kharif'],
    climate: 'Tropical'
  });

  const filteredCrops = crops.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrop.name) return toast.error('Crop name is required');
    await addCrop(newCrop);
    setIsModalOpen(false);
    setNewCrop({ name: '', emoji: '🌿', avgYieldPerAcre: 5, soilTypes: ['Loamy'], season: ['Kharif'], climate: 'Tropical' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this crop from the database?')) {
      await deleteCrop(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-1">
            Crop Database
          </h1>
          <p className="text-[var(--text-muted)]">
            Manage crop parameters for AI recommendations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search crops..."
              icon={<SearchIcon size={18} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-admin hover:bg-admin-light"
          >
            <PlusIcon size={18} /> Add Crop
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrops.map((crop) => (
          <Card key={crop.id} className="flex flex-col group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-2xl">
                  {crop.emoji}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text)]">
                    {crop.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Yield: {crop.avgYieldPerAcre} Q/acre
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleDelete(crop.id)}
                  className="p-1.5 text-gray-400 hover:text-danger transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  IDEAL SOIL
                </p>
                <div className="flex flex-wrap gap-1">
                  {crop.idealSoil.map((soil) => (
                    <Badge key={soil} variant="neutral" className="text-[10px]">
                      {soil}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  SEASONS
                </p>
                <div className="flex flex-wrap gap-1">
                  {crop.season.map((s) => (
                    <Badge key={s} variant="info" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  LIVE PRICE
                </p>
                <p className="font-bold text-[var(--text)]">
                  ₹{crop.currentPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  STATUS
                </p>
                <p className="font-bold text-success text-xs">
                  Connected to API
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Crop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Add New Crop</h2>
            <form onSubmit={handleAddCrop} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <Input 
                    label="Crop Name" 
                    value={newCrop.name} 
                    onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                    placeholder="e.g. Cotton"
                    required
                  />
                </div>
                <div>
                  <Input 
                    label="Emoji" 
                    value={newCrop.emoji} 
                    onChange={(e) => setNewCrop({...newCrop, emoji: e.target.value})}
                    placeholder="🌿"
                  />
                </div>
              </div>
              
              <Input 
                label="Average Yield (Quintals per Acre)" 
                type="number"
                value={newCrop.avgYieldPerAcre} 
                onChange={(e) => setNewCrop({...newCrop, avgYieldPerAcre: Number(e.target.value)})}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Soil Types (comma separated)</label>
                <input 
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold"
                  value={newCrop.soilTypes.join(', ')}
                  onChange={(e) => setNewCrop({...newCrop, soilTypes: e.target.value.split(',').map(s => s.trim())})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seasons (comma separated)</label>
                <input 
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold"
                  value={newCrop.season.join(', ')}
                  onChange={(e) => setNewCrop({...newCrop, season: e.target.value.split(',').map(s => s.trim())})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-admin">Create Crop</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};