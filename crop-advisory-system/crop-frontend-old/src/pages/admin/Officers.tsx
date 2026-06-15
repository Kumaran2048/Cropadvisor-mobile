import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Toggle } from '../../components/ui/Toggle';
import { useAppData } from '../../contexts/AppDataContext';
import { 
  SearchIcon, 
  PlusIcon, 
  MapPinIcon, 
  MailIcon, 
  PhoneIcon,
  Trash2,
  ShieldCheck,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

const DISTRICTS = [
  'Nashik', 'Pune', 'Ahmednagar', 'Chennai', 'Coimbatore', 'Nagpur', 'Solapur', 'Madurai'
];

export const ManageOfficers: React.FC = () => {
  const { officers, addOfficer, updateUserStatus, deleteUser, farmers } = useAppData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    district: DISTRICTS[0],
    state: 'Maharashtra', // Default for demo
    role: 'officer'
  });

  const filteredOfficers = officers.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.district.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.name || !newOfficer.email || !newOfficer.district) {
      toast.error('Please fill all required fields');
      return;
    }
    await addOfficer(newOfficer);
    setIsModalOpen(false);
    setNewOfficer({
      name: '', email: '', phone: '', password: 'password123', district: DISTRICTS[0], state: 'Maharashtra', role: 'officer'
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Officer ${name}?`)) {
      await deleteUser(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-1 flex items-center gap-3">
            <ShieldCheck className="text-admin" /> Manage Officers
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Monitor and assign district agriculture officers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search officers..."
              icon={<SearchIcon size={18} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-admin hover:bg-admin-dark text-white border-none shadow-lg shadow-admin/20"
          >
            <PlusIcon size={18} /> Add Officer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOfficers.map((officer) => {
          const assignedFarmers = farmers.filter(f => f.district === officer.district).length;
          
          return (
            <Card 
              key={officer._id} 
              className={`group transition-all duration-300 hover:shadow-xl border-l-4 ${officer.isActive ? 'border-l-admin' : 'border-l-gray-300 grayscale opacity-80'}`}
            >
              <div className="flex flex-col sm:flex-row gap-6 p-2">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-black text-xl text-[var(--text)] tracking-tight">
                        {officer.name}
                      </h3>
                      <p className="text-[10px] font-black text-admin uppercase tracking-widest mt-0.5">District Officer</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Toggle 
                        checked={officer.isActive} 
                        onChange={(c) => updateUserStatus(officer._id, c)} 
                      />
                      <button 
                        onClick={() => handleDelete(officer._id, officer.name)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] font-medium">
                      <MailIcon size={14} className="text-gray-400" /> {officer.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] font-medium">
                      <PhoneIcon size={14} className="text-gray-400" /> {officer.phone || 'Contact not provided'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-100 rounded-lg px-3 py-1 flex items-center gap-2">
                      <MapPinIcon size={12} /> {officer.district}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Users size={14} className="text-gray-400" />
                      {assignedFarmers} farmers
                    </div>
                  </div>
                </div>

                <div className="sm:w-48 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Service Region</p>
                  <p className="text-sm font-bold text-gray-700 mb-4">Maharashtra State</p>
                  <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest h-8">
                    View Reports
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 border-none shadow-2xl rounded-[32px] animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-6 text-[var(--text)] tracking-tight">Assign New Officer</h2>
            <form onSubmit={handleAddOfficer} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <Input 
                  value={newOfficer.name} 
                  onChange={(e) => setNewOfficer({...newOfficer, name: e.target.value})}
                  className="bg-gray-50 border-none rounded-xl"
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <Input 
                  type="email" 
                  value={newOfficer.email} 
                  onChange={(e) => setNewOfficer({...newOfficer, email: e.target.value})}
                  className="bg-gray-50 border-none rounded-xl"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
                  <Select 
                    value={newOfficer.district} 
                    onChange={(e) => setNewOfficer({...newOfficer, district: e.target.value})}
                    className="bg-gray-50 border-none rounded-xl"
                    options={DISTRICTS.map(d => ({ value: d, label: d }))} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temp Password</label>
                  <Input 
                    disabled 
                    value="password123" 
                    className="bg-gray-100 border-none rounded-xl opacity-60"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 rounded-xl h-12 font-bold" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-admin hover:bg-admin-dark text-white rounded-xl h-12 font-black uppercase tracking-widest border-none shadow-lg shadow-admin/20"
                >
                  Confirm Assignment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};