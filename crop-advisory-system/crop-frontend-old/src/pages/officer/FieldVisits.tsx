import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Officer } from '../../types';
import {
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  PlusIcon } from
'lucide-react';
import { toast } from 'sonner';
export const FieldVisits: React.FC = () => {
  const { user } = useAuth();
  const { farmers, fieldVisits, addFieldVisit } = useAppData();
  const officer = user as Officer;
  const districtFarmers = farmers.filter((f) => f.district === officer.district);
  const officerVisits = fieldVisits.filter((v) => v.officerId === officer.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({
    farmerId: districtFarmers[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const handleLogVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisit.farmerId || !newVisit.notes.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    addFieldVisit({
      id: `vis_${Date.now()}`,
      officerId: officer.id,
      farmerId: newVisit.farmerId,
      date: newVisit.date,
      notes: newVisit.notes.trim()
    });
    toast.success('Field visit logged successfully');
    setIsModalOpen(false);
    setNewVisit({
      ...newVisit,
      notes: ''
    });
  };
  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
            Field Visits
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Log and track your farm inspections
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-officer hover:bg-officer-light">
          
          <PlusIcon size={18} /> Log Visit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {officerVisits.length === 0 ?
        <div className="col-span-full text-center py-16 text-[var(--text-muted)] bg-[var(--surface)] rounded-card border border-[var(--border)]">
            <MapPinIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>No field visits logged yet.</p>
            <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsModalOpen(true)}>
            
              Log your first visit
            </Button>
          </div> :

        officerVisits.map((visit) => {
          const farmer = farmers.find((f) => f.id === visit.farmerId);
          return (
            <Card key={visit.id} className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-officer/10 text-officer flex items-center justify-center">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text)]">
                        {farmer?.name || 'Unknown Farmer'}
                      </h3>
                      <div className="flex items-center text-xs text-[var(--text-muted)] mt-0.5">
                        <MapPinIcon size={12} className="mr-1" />
                        {farmer?.district || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-medium text-[var(--text-muted)] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    <CalendarIcon size={12} className="mr-1" />
                    {new Date(visit.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                  <div className="flex gap-2 items-start">
                    <FileTextIcon
                    size={16}
                    className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                  
                    <p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                      {visit.notes}
                    </p>
                  </div>
                </div>
              </Card>);

        })
        }
      </div>

      {/* Log Visit Modal */}
      {isModalOpen &&
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[var(--text)]">
              Log Field Visit
            </h2>
            <form onSubmit={handleLogVisit} className="space-y-4">
              <Select
              label="Select Farmer"
              value={newVisit.farmerId}
              onChange={(e) =>
              setNewVisit({
                ...newVisit,
                farmerId: e.target.value
              })
              }
              options={districtFarmers.map((f) => ({
                value: f.id,
                label: `${f.name} (${f.activeCrop || 'No active crop'})`
              }))} />
            
              <Input
              label="Date of Visit"
              type="date"
              value={newVisit.date}
              onChange={(e) =>
              setNewVisit({
                ...newVisit,
                date: e.target.value
              })
              }
              required />
            
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Inspection Notes
                </label>
                <textarea
                className="w-full h-32 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-officer resize-none"
                placeholder="Observations, recommendations given, crop health status..."
                value={newVisit.notes}
                onChange={(e) =>
                setNewVisit({
                  ...newVisit,
                  notes: e.target.value
                })
                }
                required>
              </textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}>
                
                  Cancel
                </Button>
                <Button
                type="submit"
                className="flex-1 bg-officer hover:bg-officer-light">
                
                  Save Log
                </Button>
              </div>
            </form>
          </Card>
        </div>
      }
    </div>);

};