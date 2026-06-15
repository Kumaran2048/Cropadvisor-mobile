import React from 'react';
import { Card } from '../../components/ui/Card';
import { useAppData } from '../../contexts/AppDataContext';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area } from
'recharts';
export const PolicyInsights: React.FC = () => {
  const { farmers, diseaseReports } = useAppData();
  // Calculate Crop Distribution
  const cropCounts: Record<string, number> = {};
  farmers.forEach((f) => {
    if (f.activeCrop) {
      cropCounts[f.activeCrop] = (cropCounts[f.activeCrop] || 0) + 1;
    }
  });
  const cropData = Object.entries(cropCounts).
  map(([name, value]) => ({
    name,
    value
  })).
  sort((a, b) => b.value - a.value).
  slice(0, 5); // Top 5
  const COLORS = ['#1B4332', '#2D5A43', '#E8B84B', '#1A5276', '#4A235A'];
  // Calculate Disease Frequency
  const diseaseCounts: Record<string, number> = {};
  diseaseReports.forEach((r) => {
    diseaseCounts[r.diseaseName] = (diseaseCounts[r.diseaseName] || 0) + 1;
  });
  const diseaseData = Object.entries(diseaseCounts).
  map(([name, count]) => ({
    name,
    count
  })).
  sort((a, b) => b.count - a.count).
  slice(0, 4); // Top 4
  // Mock Market Trend
  const marketTrendData = [
  {
    month: 'Jan',
    index: 100
  },
  {
    month: 'Feb',
    index: 105
  },
  {
    month: 'Mar',
    index: 98
  },
  {
    month: 'Apr',
    index: 110
  },
  {
    month: 'May',
    index: 115
  },
  {
    month: 'Jun',
    index: 125
  }];

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-1">
          Policy Insights
        </h1>
        <p className="text-[var(--text-muted)]">
          Data-driven insights for agricultural planning
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Distribution Pie Chart */}
        <Card>
          <h3 className="font-bold text-[var(--text)] mb-6">
            Active Crop Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {cropData.map((entry, index) =>
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]} />

                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px'
                  }} />
                
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Disease Frequency Bar Chart */}
        <Card>
          <h3 className="font-bold text-[var(--text)] mb-6">
            Top Disease Threats
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={diseaseData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 40
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="var(--border)" />
                
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--text-muted)'
                  }} />
                
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--text-muted)',
                    fontSize: 12
                  }}
                  width={100} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px'
                  }}
                  cursor={{
                    fill: 'var(--border)',
                    opacity: 0.4
                  }} />
                
                <Bar
                  dataKey="count"
                  fill="#C0392B"
                  radius={[0, 4, 4, 0]}
                  barSize={20} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Market Trend Area Chart */}
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-[var(--text)] mb-6">
            Aggregate Market Price Index
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={marketTrendData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}>
                
                <defs>
                  <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8B84B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8B84B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)" />
                
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--text-muted)'
                  }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--text-muted)'
                  }} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px'
                  }} />
                
                <Area
                  type="monotone"
                  dataKey="index"
                  stroke="#E8B84B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIndex)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>);

};