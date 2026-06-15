import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { Officer } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  UsersIcon,
  AlertTriangleIcon,
  MapPinIcon,
  RadioIcon,
  ChevronRightIcon } from
'lucide-react';
export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { farmers, diseaseReports, fieldVisits, broadcasts } = useAppData();
  const navigate = useNavigate();
  const officer = user as Officer;
  const districtFarmers = farmers.filter((f) => f.district === officer.district);
  const districtReports = diseaseReports.filter(
    (r) => r.district === officer.district
  );
  const activeCases = districtReports.filter(
    (r) => r.status === 'pending'
  ).length;
  const officerVisits = fieldVisits.filter((v) => v.officerId === officer.id);
  const officerBroadcasts = broadcasts.filter((b) => b.officerId === officer.id);
  // Check for outbreak
  const hasOutbreak = activeCases >= 5;
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header Section */}
      <div className="bg-officer text-white p-6 rounded-b-[24px] -mx-6 -mt-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <p className="text-sm opacity-90">Good Morning,</p>
            <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
              Officer {officer.name.split(' ')[0]} 👨‍💼
            </h2>
          </div>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">
            {officer.district} District
          </Badge>
        </div>

        {hasOutbreak &&
        <div className="mt-4 bg-danger/90 backdrop-blur-sm p-4 rounded-xl border border-red-400/50 flex items-start gap-3">
            <AlertTriangleIcon
            className="text-white flex-shrink-0 mt-0.5"
            size={20} />
          
            <div>
              <h3 className="font-bold text-white text-sm">
                OUTBREAK DETECTED
              </h3>
              <p className="text-xs text-red-100 mt-1">
                {activeCases} active cases reported in {officer.district}.
                Immediate action required.
              </p>
            </div>
            <button
            onClick={() => navigate('/officer/heatmap')}
            className="ml-auto bg-white text-danger px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
            
              View Map
            </button>
          </div>
        }
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center py-4 border-t-4 border-t-blue-500">
          <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
            <UsersIcon size={20} />
          </div>
          <p className="text-2xl font-bold text-[var(--text)]">
            {districtFarmers.length}
          </p>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
            Farmers
          </p>
        </Card>
        <Card className="text-center py-4 border-t-4 border-t-danger">
          <div className="w-10 h-10 mx-auto bg-red-50 text-danger rounded-full flex items-center justify-center mb-2">
            <AlertTriangleIcon size={20} />
          </div>
          <p className="text-2xl font-bold text-[var(--text)]">{activeCases}</p>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
            Active Cases
          </p>
        </Card>
        <Card className="text-center py-4 border-t-4 border-t-green-500">
          <div className="w-10 h-10 mx-auto bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2">
            <MapPinIcon size={20} />
          </div>
          <p className="text-2xl font-bold text-[var(--text)]">
            {officerVisits.length}
          </p>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
            Visits
          </p>
        </Card>
        <Card className="text-center py-4 border-t-4 border-t-purple-500">
          <div className="w-10 h-10 mx-auto bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-2">
            <RadioIcon size={20} />
          </div>
          <p className="text-2xl font-bold text-[var(--text)]">
            {officerBroadcasts.length}
          </p>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
            Broadcasts
          </p>
        </Card>
      </div>

      {/* Recent Reports */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">
            Recent Disease Reports
          </h3>
          <button
            onClick={() => navigate('/officer/reports')}
            className="text-sm text-officer font-medium flex items-center hover:underline">
            
            View All <ChevronRightIcon size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {districtReports.slice(0, 5).map((report) => {
            const farmer = farmers.find((f) => f.id === report.farmerId);
            return (
              <Card
                key={report.id}
                className="flex items-center justify-between p-4">
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[var(--text)]">
                      {report.diseaseName}
                    </h4>
                    <Badge
                      variant={
                      report.status === 'pending' ? 'warning' : 'success'
                      }>
                      
                      {report.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {farmer?.name} · {report.cropName} ·{' '}
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--text)]">
                    {report.confidence}%
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">
                    Confidence
                  </p>
                </div>
              </Card>);

          })}

          {districtReports.length === 0 &&
          <Card className="text-center py-8 text-[var(--text-muted)]">
              No recent reports in your district.
            </Card>
          }
        </div>
      </div>
    </div>);

};