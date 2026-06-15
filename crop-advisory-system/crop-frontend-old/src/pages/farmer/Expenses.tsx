import React, { useState } from 'react';
import {
  PlusIcon,
  SproutIcon,
  BeakerIcon,
  UsersIcon,
  DropletsIcon,
  MoreHorizontalIcon } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Farmer, Expense } from '../../types';
import { toast } from 'sonner';
export const Expenses: React.FC = () => {
  const { user } = useAuth();
  const { expenses, addExpense, crops } = useAppData();
  const farmer = user as Farmer;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'Labor',
    amount: 0,
    cropName: farmer?.activeCrop || crops[0]?.name || 'None',
    date: new Date().toISOString().split('T')[0]
  });
  const farmerExpenses = expenses.filter((e) => e.farmerId === farmer.id);
  const totalExpenses = farmerExpenses.reduce((sum, e) => sum + e.amount, 0);
  const getCategoryTotal = (cat: string) =>
  farmerExpenses.
  filter((e) => e.category === cat).
  reduce((sum, e) => sum + e.amount, 0);
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || newExpense.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const selectedCropId = crops.find(c => c.name === newExpense.cropName)?.id;
    
    addExpense({
      type: newExpense.category,
      amount: Number(newExpense.amount),
      cropId: selectedCropId || user.activeCropId, // Use the active crop id if not found
      date: newExpense.date as string
    });
    toast.success('Expense added successfully');
    setIsModalOpen(false);
    setNewExpense({
      ...newExpense,
      amount: 0
    });
  };
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Seed':
        return <SproutIcon className="text-green-600" size={20} />;
      case 'Fertilizer':
        return <BeakerIcon className="text-purple-500" size={20} />;
      case 'Labor':
        return <UsersIcon className="text-orange-500" size={20} />;
      case 'Irrigation':
        return <DropletsIcon className="text-blue-500" size={20} />;
      default:
        return <MoreHorizontalIcon className="text-gray-500" size={20} />;
    }
  };
  return (
    <div className="max-w-md mx-auto pb-20 space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-2xl font-bold text-[var(--text)]">
          Expenses
        </h1>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1">
          
          <PlusIcon size={16} /> Add
        </Button>
      </div>

      {/* Total Card */}
      <div className="bg-danger text-white rounded-[24px] p-6 shadow-lg">
        <p className="text-xs uppercase tracking-wider opacity-90 mb-2">
          TOTAL - {farmer?.activeCrop?.toUpperCase() || 'CURRENT'} SEASON
        </p>
        <h2 className="text-4xl font-bold mb-2">
          ₹{totalExpenses.toLocaleString()}
        </h2>
        <p className="text-sm opacity-90">
          {farmerExpenses.length} transactions recorded
        </p>
      </div>

      {/* Category Mini-stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-3 px-2">
          <p className="text-xs text-[var(--text-muted)] mb-1">Labor</p>
          <p className="font-bold text-[var(--text)]">
            ₹{getCategoryTotal('Labor').toLocaleString()}
          </p>
        </Card>
        <Card className="text-center py-3 px-2">
          <p className="text-xs text-[var(--text-muted)] mb-1">Fert.</p>
          <p className="font-bold text-[var(--text)]">
            ₹{getCategoryTotal('Fertilizer').toLocaleString()}
          </p>
        </Card>
        <Card className="text-center py-3 px-2">
          <p className="text-xs text-[var(--text-muted)] mb-1">Irrig.</p>
          <p className="font-bold text-[var(--text)]">
            ₹{getCategoryTotal('Irrigation').toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Transactions List */}
      <div>
        <h3 className="font-bold text-[var(--text)] mb-3">All Transactions</h3>
        <div className="space-y-3">
          {farmerExpenses.length === 0 ?
          <p className="text-center text-[var(--text-muted)] py-4">
              No expenses recorded yet.
            </p> :

          farmerExpenses.map((exp) =>
          <Card
            key={exp.id}
            className="flex items-center justify-between p-4">
            
                <div className="flex items-center gap-3">
                  <div
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
                
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text)]">
                      {exp.category}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {exp.cropName} ·{' '}
                      {new Date(exp.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                    </p>
                  </div>
                </div>
                <div className="text-danger font-bold">
                  -₹{exp.amount.toLocaleString()}
                </div>
              </Card>
          )
          }
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen &&
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <Select
              label="Category"
              value={newExpense.category}
              onChange={(e) =>
              setNewExpense({
                ...newExpense,
                category: e.target.value as any
              })
              }
              options={[
              {
                value: 'Labor',
                label: 'Labor'
              },
              {
                value: 'Fertilizer',
                label: 'Fertilizer'
              },
              {
                value: 'Irrigation',
                label: 'Irrigation'
              },
              {
                value: 'Seed',
                label: 'Seed'
              },
              {
                value: 'Pesticide',
                label: 'Pesticide'
              },
              {
                value: 'Other',
                label: 'Other'
              }]
              } />
            
              <Input
              label="Amount (₹)"
              type="number"
              min="0"
              value={newExpense.amount || ''}
              onChange={(e) =>
              setNewExpense({
                ...newExpense,
                amount: Number(e.target.value)
              })
              }
              required />
            
              <Select
              label="Crop"
              value={newExpense.cropName}
              onChange={(e) =>
              setNewExpense({
                ...newExpense,
                cropName: e.target.value
              })
              }
              options={crops.map((c) => ({
                value: c.name,
                label: c.name
              }))} />
            
              <Input
              label="Date"
              type="date"
              value={newExpense.date}
              onChange={(e) =>
              setNewExpense({
                ...newExpense,
                date: e.target.value
              })
              }
              required />
            
              <div className="flex gap-3 pt-2">
                <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}>
                
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </Card>
        </div>
      }
    </div>);

};