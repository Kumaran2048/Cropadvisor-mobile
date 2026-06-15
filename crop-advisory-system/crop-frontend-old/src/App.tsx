import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppDataProvider } from './contexts/AppDataContext';
// Layouts
import { AppShell } from './components/layout/AppShell';
// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import { FarmerDashboard } from './pages/farmer/Dashboard';
import { CropAdvice } from './pages/farmer/CropAdvice';
import { DiseaseScanner } from './pages/farmer/DiseaseScanner';
import { Weather } from './pages/farmer/Weather';
import { MarketPrices } from './pages/farmer/MarketPrices';
import { Expenses } from './pages/farmer/Expenses';
import { ProfitPredict } from './pages/farmer/ProfitPredict';
import { WhatIf } from './pages/farmer/WhatIf';
import { Alerts } from './pages/farmer/Alerts';
import { Profile } from './pages/farmer/Profile';
import { Settings } from './pages/farmer/Settings';
import { SoilAdvisor } from './pages/farmer/SoilAdvisor';
import { OfficerDashboard } from './pages/officer/Dashboard';
import { FarmersList } from './pages/officer/Farmers';
import { DiseaseReports } from './pages/officer/DiseaseReports';
import { OutbreakHeatmap } from './pages/officer/OutbreakHeatmap';
import { Broadcast } from './pages/officer/Broadcast';
import { RiskPrediction } from './pages/officer/RiskPrediction';
import { FieldVisits } from './pages/officer/FieldVisits';
import { OfficerSettings } from './pages/officer/Settings';
import { AdminDashboard } from './pages/admin/Dashboard';
import { ManageOfficers } from './pages/admin/Officers';
import { ManageUsers } from './pages/admin/Users';
import { CropDatabase } from './pages/admin/CropDatabase';
import { SystemHealth } from './pages/admin/SystemHealth';
import { PolicyInsights } from './pages/admin/PolicyInsights';
import { AdminSettings } from './pages/admin/Settings';
// Placeholder Pages (will be implemented next)
const Placeholder = ({ title }: {title: string;}) =>
<div className="p-8">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p>Coming soon...</p>
  </div>;


export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppDataProvider>
            <BrowserRouter>
              <Toaster position="top-right" richColors />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<AppShell />}>
                  <Route index element={<Navigate to="/login" replace />} />

                  {/* Farmer Routes */}
                  <Route path="farmer">
                    <Route index element={<FarmerDashboard />} />
                    <Route path="crops" element={<CropAdvice />} />
                    <Route path="scan" element={<DiseaseScanner />} />
                    <Route path="weather" element={<Weather />} />
                    <Route path="market" element={<MarketPrices />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="profit" element={<ProfitPredict />} />
                    <Route path="whatif" element={<WhatIf />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="soil" element={<SoilAdvisor />} />
                  </Route>

                  {/* Officer Routes */}
                  <Route path="officer">
                    <Route index element={<OfficerDashboard />} />
                    <Route path="farmers" element={<FarmersList />} />
                    <Route path="reports" element={<DiseaseReports />} />
                    <Route path="heatmap" element={<OutbreakHeatmap />} />
                    <Route path="broadcast" element={<Broadcast />} />
                    <Route path="risk" element={<RiskPrediction />} />
                    <Route path="visits" element={<FieldVisits />} />
                    <Route path="settings" element={<OfficerSettings />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="admin">
                    <Route index element={<AdminDashboard />} />
                    <Route path="officers" element={<ManageOfficers />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="database" element={<CropDatabase />} />
                    <Route path="health" element={<SystemHealth />} />
                    <Route path="insights" element={<PolicyInsights />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>
                {/* Catch-all: any unknown path redirects to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </AppDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>);

}