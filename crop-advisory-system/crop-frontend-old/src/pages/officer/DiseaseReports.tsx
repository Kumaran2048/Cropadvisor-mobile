import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Officer } from '../../types';
import {
  SearchIcon,
  CalendarIcon,
  UserIcon,
  SproutIcon,
  AlertTriangleIcon } from
'lucide-react';
export const DiseaseReports: React.FC = () => {
  const { user } = useAuth();
  const { diseaseReports, farmers, resolveDisease } = useAppData();
  const officer = user as Officer;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const districtReports = diseaseReports.filter(
    (r) => r.district === officer.district
  );
  const filteredReports = districtReports.filter((r) => {
    const farmer = farmers.find((f) => f.id === r.farmerId);
    const matchesSearch =
    (r.diseaseName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (r.cropName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (farmer?.name?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
            Disease Reports
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            {districtReports.length} total reports in {officer.district}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search disease, crop, farmer..."
              icon={<SearchIcon size={18} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)} />
            
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
              {
                value: 'all',
                label: 'All Status'
              },
              {
                value: 'pending',
                label: 'Pending'
              },
              {
                value: 'resolved',
                label: 'Resolved'
              }]
              } />
            
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.map((report) => {
          const farmer = farmers.find((f) => f.id === report.farmerId);
          const isHighRisk = report.confidence > 90;
          return (
            <Card
              key={report.id}
              className={`border-l-4 transition-all ${report.status === 'resolved' ? 'opacity-50 grayscale-[0.5]' : ''} ${report.status === 'pending' ? isHighRisk ? 'border-l-danger' : 'border-l-warning' : 'border-l-success'}`}>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-bold text-lg ${report.status === 'resolved' ? 'text-gray-500' : 'text-[var(--text)]'}`}>
                      {report.diseaseName}
                    </h3>
                    {isHighRisk && report.status === 'pending' &&
                    <Badge variant="danger" className="gap-1">
                        <AlertTriangleIcon size={12} /> High Risk
                      </Badge>
                    }
                    <Badge
                      variant={
                      report.status === 'pending' ? 'warning' : 'success'
                      }>
                      
                      {report.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                    <div className="flex items-center gap-1">
                      <UserIcon size={14} />
                      <span className={`font-medium ${report.status === 'resolved' ? 'text-gray-400' : 'text-[var(--text)]'}`}>
                        {farmer?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SproutIcon size={14} />
                      <span>{report.cropName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon size={14} />
                      <span>
                        {new Date(report.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center border-t md:border-t-0 md:border-l border-[var(--border)] pt-3 md:pt-0 md:pl-6">
                  <div className="text-center md:text-right">
                    <p className={`text-2xl font-bold ${report.status === 'resolved' ? 'text-gray-400' : 'text-[var(--text)]'}`}>
                      {report.confidence}%
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      AI Confidence
                    </p>
                  </div>
                  {report.status === 'pending' &&
                  <button 
                    onClick={() => resolveDisease(report.id)}
                    className="text-sm font-medium text-officer hover:underline mt-2"
                  >
                      Mark Resolved
                    </button>
                  }
                  {report.status === 'resolved' && (
                    <div className="text-[10px] font-black text-success uppercase tracking-widest mt-2">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            </Card>);

        })}

        {filteredReports.length === 0 &&
        <div className="text-center py-12 text-[var(--text-muted)]">
            <p>No reports found matching your filters.</p>
          </div>
        }
      </div>
    </div>);

};