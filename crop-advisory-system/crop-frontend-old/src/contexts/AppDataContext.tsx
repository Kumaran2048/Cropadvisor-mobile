import React, { useEffect, useState, createContext, useContext } from 'react';
import API from '../utils/api';
import {
  Farmer,
  Officer,
  Admin,
  Crop,
  DiseaseReport,
  Broadcast,
  Expense,
  FieldVisit,
  MarketPriceData
} from
  '../types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface AppDataContextType {
  farmers: any[];
  officers: any[];
  crops: Crop[];
  prices: MarketPriceData[];
  diseaseReports: DiseaseReport[];
  broadcasts: Broadcast[];
  expenses: Expense[];
  fieldVisits: FieldVisit[];
  refreshCrops: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshPrices: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  refreshDiseaseReports: () => Promise<void>;
  resolveDisease: (id: string) => Promise<void>;
  addExpense: (expense: any) => Promise<void>;
  addDiseaseReport: (report: any) => void;
  addBroadcast: (broadcast: any) => void;
  addFieldVisit: (visit: any) => void;
  sendBroadcast: (message: string, type: string, allowReplies?: boolean) => Promise<void>;
  replyToBroadcast: (alertId: string, message: string) => Promise<void>;

  addOfficer: (officer: any) => Promise<void>;
  addCrop: (crop: any) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  updateUserStatus: (id: string, status: boolean) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setActiveCrop: (cropId: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [prices, setPrices] = useState<MarketPriceData[]>([]);
  const [diseaseReports, setDiseaseReports] = useState<DiseaseReport[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fieldVisits, setFieldVisits] = useState<FieldVisit[]>([]);

  const refreshCrops = async () => {
    try {
      const { data } = await API.get('/crop/all');
      const cropsData = data.crops || data;
      setCrops(cropsData.map((c: any) => ({
        id: c._id,
        name: c.name,
        emoji: '🌿',
        idealSoil: c.soilTypes || [],
        season: c.season || [],
        avgYieldPerAcre: 2.5,
        currentPrice: 0,
        priceTrend: 0,
        minPrice: 0,
        maxPrice: 0
      })));
    } catch (err) {
      console.error('Failed to fetch crops');
    }
  };

  const refreshUsers = async () => {
    if (user?.role === 'admin' || user?.role === 'officer') {
      try {
        const { data } = await API.get('/admin/users');
        const mappedUsers = (data || []).map((u: any) => ({
          ...u,
          id: u._id
        }));
        if (user.role === 'admin') {
          setFarmers(mappedUsers.filter((u: any) => u.role === 'farmer'));
          setOfficers(mappedUsers.filter((u: any) => u.role === 'officer'));
        } else {
          setFarmers(mappedUsers.filter((u: any) => u.role === 'farmer' && u.district === user.district));
        }
      } catch (err) {
        console.error('Failed to fetch users');
      }
    }
  };

  const refreshPrices = async (stateFilter?: string) => {
    try {
      const activeState = stateFilter !== undefined ? stateFilter : (user?.state || '');
      const stateParam = activeState ? `?state=${encodeURIComponent(activeState)}` : '';
      const { data } = await API.get(`/market/all-crops${stateParam}`);
      setPrices(data.prices || []);

      setCrops(prev => prev.map(crop => {
        const priceInfo = (data.prices || []).find((p: any) => p.cropName.toLowerCase().includes(crop.name.toLowerCase()));
        if (priceInfo) {
          return {
            ...crop,
            currentPrice: priceInfo.modalPrice,
            minPrice: priceInfo.minPrice,
            maxPrice: priceInfo.maxPrice,
            priceTrend: 2
          };
        }
        return crop;
      }));
    } catch (err) {
      console.error('Failed to fetch market prices');
    }
  };

  const refreshExpenses = async () => {
    if (user?.role === 'farmer') {
      try {
        const { data } = await API.get('/expense');
        const expensesData = data.expenses || data;
        const mappedExpenses = expensesData.map((e: any) => ({
          ...e,
          id: e._id,
          category: e.type,
          cropName: e.cropId?.name || 'Unknown Crop'
        }));
        setExpenses(mappedExpenses);
      } catch (err) {
        console.error('Failed to fetch expenses');
      }
    }
  };

  const refreshAlerts = async () => {
    try {
      const endpoint = user?.role === 'officer' ? '/alert/my-alerts' : '/alert/my-alerts';
      const { data } = await API.get(endpoint);
      const mappedAlerts = (data.alerts || []).map((a: any) => ({
        id: a._id,
        officerId: a.officerId,
        district: a.district,
        message: a.message,
        type: a.type,
        date: a.createdAt || new Date().toISOString(),
        allowReplies: a.allowReplies,
        replies: a.replies
      }));
      setBroadcasts(mappedAlerts);
    } catch (err) {
      console.error('Failed to fetch alerts');
    }
  };

  const refreshDiseaseReports = async () => {
    if (user?.role === 'officer') {
      try {
        const { data } = await API.get(`/disease/district/${user.district}`);
        const mappedReports = (data.reports || []).map((r: any) => ({
          id: r._id,
          farmerId: r.farmerId,
          district: r.district,
          diseaseName: r.disease || 'Unknown Disease',
          cropName: r.cropName || 'General Crop',
          confidence: r.confidence || 0,
          date: r.createdAt || new Date().toISOString(),
          status: r.status || 'pending',
          severity: r.severity,
          treatment: r.treatment
        }));
        setDiseaseReports(mappedReports);
      } catch (err) {
        console.error('Failed to fetch disease reports');
      }
    }
  };

  const resolveDisease = async (id: string) => {
    try {
      await API.patch(`/disease/report/${id}/resolve`);
      await refreshDiseaseReports();
      toast.success('Report resolved');
    } catch (err) {
      toast.error('Failed to resolve report');
    }
  };

  const fetchInitialData = async () => {
    if (!user) return;
    await refreshCrops();
    await refreshPrices();
    await refreshExpenses();
    await refreshUsers();
    await refreshAlerts();
    await refreshDiseaseReports();
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const addExpense = async (expenseData: any) => {
    try {
      await API.post('/expense', expenseData);
      await refreshExpenses();
    } catch (err) {
      toast.error('Failed to add expense');
    }
  };

  const sendBroadcast = async (message: string, type: string, allowReplies = false) => {
    try {
      await API.post('/alert/broadcast', { message, type, allowReplies });
      await refreshAlerts();
      toast.success('Broadcast sent successfully');
    } catch (err) {
      toast.error('Failed to send broadcast');
    }
  };

  const replyToBroadcast = async (alertId: string, message: string) => {
    try {
      await API.post(`/alert/${alertId}/reply`, { message });
      await refreshAlerts();
      toast.success('Reply sent successfully');
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  const addOfficer = async (officerData: any) => {
    try {
      await API.post('/admin/users', { ...officerData, role: 'officer' });
      await refreshUsers();
      toast.success('Officer added successfully');
    } catch (err) {
      toast.error('Failed to add officer');
    }
  };

  const addCrop = async (cropData: any) => {
    try {
      await API.post('/crop', cropData);
      await refreshCrops();
      toast.success('Crop added to database');
    } catch (err) {
      toast.error('Failed to add crop');
    }
  };

  const deleteCrop = async (id: string) => {
    try {
      await API.delete(`/crop/${id}`);
      await refreshCrops();
      toast.success('Crop removed');
    } catch (err) {
      toast.error('Failed to delete crop');
    }
  };

  const updateUserStatus = async (id: string, status: boolean) => {
    try {
      await API.patch(`/admin/users/${id}/status`, { isActive: status });
      await refreshUsers();
      toast.success('User status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await API.delete(`/admin/users/${id}`);
      await refreshUsers();
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const setActiveCrop = async (cropId: string) => {
    try {
      await API.put('/farm/select-crop', { cropId });
      await refreshUser();
      await refreshCrops();
      toast.success('Active crop updated successfully');
    } catch (err) {
      console.error('setActiveCrop error:', err);
      toast.error('Failed to update active crop');
    }
  };

  const addDiseaseReport = (report: any) => setDiseaseReports((prev) => [report, ...prev]);
  const addBroadcast = (broadcast: any) => setBroadcasts((prev) => [broadcast, ...prev]);
  const addFieldVisit = (visit: any) => setFieldVisits((prev) => [visit, ...prev]);

  return (
    <AppDataContext.Provider
      value={{
        farmers,
        officers,
        crops,
        prices,
        diseaseReports,
        broadcasts,
        expenses,
        fieldVisits,
        refreshCrops,
        refreshExpenses,
        refreshPrices,
        refreshUsers,
        refreshAlerts,
        refreshDiseaseReports,
        resolveDisease,
        addExpense,
        addDiseaseReport,
        addBroadcast,
        addFieldVisit,
        sendBroadcast,
        replyToBroadcast,
        addOfficer,
        addCrop,
        deleteCrop,
        updateUserStatus,
        deleteUser,
        setActiveCrop
      }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};