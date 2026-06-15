import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { Officer } from '../../types';
import {
  ShieldAlertIcon,
  TrendingUpIcon,
  BrainCircuitIcon,
  ArrowRightIcon } from
'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export const RiskPrediction: React.FC = () => {
  const { user } = useAuth();
  const officer = user as Officer;
  // Mock data for the risk trend chart
  const riskData = [
  {
    day: 'Mon',
    risk: 20
  },
  {
    day: 'Tue',
    risk: 25
  },
  {
    day: 'Wed',
    risk: 35
  },
  {
    day: 'Thu',
    risk: 30
  },
  {
    day: 'Fri',
    risk: 45
  },
  {
    day: 'Sat',
    risk: 60
  },
  {
    day: 'Sun',
    risk: 85
  }];

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
          AI Risk Prediction
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Predictive analytics for {officer.district}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800/50">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 text-danger rounded-xl flex items-center justify-center">
                  <BrainCircuitIcon size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-[var(--text)]">
                    High Risk Alert
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    AI Model Confidence: 89%
                  </p>
                </div>
              </div>
              <Badge variant="danger" className="animate-pulse">
                Critical
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  PREDICTED OUTBREAK
                </p>
                <p className="text-lg font-medium text-[var(--text)]">
                  Tomato Late Blight surge expected in next 48 hours
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                  <p className="text-xs text-[var(--text-muted)] uppercase mb-1">
                    PRIMARY CAUSE
                  </p>
                  <p className="text-sm font-medium text-[var(--text)]">
                    High humidity (85%) + dropping temperatures
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                  <p className="text-xs text-[var(--text-muted)] uppercase mb-1">
                    VULNERABLE AREA
                  </p>
                  <p className="text-sm font-medium text-[var(--text)]">
                    Northern talukas of {officer.district}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-red-200/50 dark:border-red-800/30">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  RECOMMENDED ACTION
                </p>
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-[var(--border)]">
                  <p className="text-sm text-[var(--text)]">
                    Broadcast preventive spraying advisory to all tomato
                    farmers.
                  </p>
                  <button className="text-officer hover:text-officer-light p-2">
                    <ArrowRightIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[var(--text)]">7-Day Risk Trend</h3>
              <div className="flex items-center gap-2 text-sm text-danger font-medium">
                <TrendingUpIcon size={16} />
                +65% vs last week
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={riskData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0
                  }}>
                  
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)" />
                  
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'var(--text-muted)',
                      fontSize: 12
                    }} />
                  
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'var(--text-muted)',
                      fontSize: 12
                    }} />
                  
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)'
                    }}
                    itemStyle={{
                      color: '#ef4444',
                      fontWeight: 'bold'
                    }} />
                  
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRisk)" />
                  
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <ShieldAlertIcon size={18} className="text-warning" />
              Other Monitored Risks
            </h3>

            <div className="space-y-4">
              <div className="p-3 border border-[var(--border)] rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm text-[var(--text)]">
                    Fall Armyworm
                  </h4>
                  <Badge variant="warning">Medium</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  Affecting maize crops in neighboring districts.
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-yellow-500 h-1.5 rounded-full"
                    style={{
                      width: '45%'
                    }}>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-[var(--border)] rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm text-[var(--text)]">
                    Water Scarcity
                  </h4>
                  <Badge variant="neutral">Low</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  Reservoir levels adequate for current season.
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-gray-400 h-1.5 rounded-full"
                    style={{
                      width: '15%'
                    }}>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

};