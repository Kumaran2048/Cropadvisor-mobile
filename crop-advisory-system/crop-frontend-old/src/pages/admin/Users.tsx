import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Toggle } from '../../components/ui/Toggle';
import { useAppData } from '../../contexts/AppDataContext';
import { SearchIcon, MapPinIcon, MailIcon, PhoneIcon, Trash2 } from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const { farmers, officers, updateUserStatus, deleteUser } = useAppData();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const allUsers = [...farmers, ...officers];

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.district && u.district.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-1">
            Manage Users
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Total: {allUsers.length} users ({farmers.length} Farmers, {officers.length} Officers)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search users..."
              icon={<SearchIcon size={18} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'farmer', label: 'Farmers' },
                { value: 'officer', label: 'Officers' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-[24px] border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">District</th>
                <th className="px-6 py-5">Activity</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${!user.isActive ? 'opacity-60' : ''}`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm ${user.role === 'farmer' ? 'bg-farmer/10 text-farmer' : 'bg-officer/10 text-officer'}`}>
                        {user.role === 'farmer' ? '👨‍🌾' : '👨‍💼'}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text)] tracking-tight">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                          <MailIcon size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={user.role === 'farmer' ? 'success' : 'info'} className="capitalize font-bold text-[10px] rounded-lg">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-[var(--text)] font-medium">
                      <MapPinIcon size={14} className="text-gray-400" />
                      {user.district || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <Toggle
                        checked={user.isActive}
                        onChange={(c) => updateUserStatus(user._id, c)}
                      />
                      <button 
                        onClick={() => deleteUser(user._id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};