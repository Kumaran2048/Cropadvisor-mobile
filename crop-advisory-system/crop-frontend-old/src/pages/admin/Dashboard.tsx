import React from 'react';
import { Card } from '../../components/ui/Card';
import { useAppData } from '../../contexts/AppDataContext';
import {
  UsersIcon,
  ShieldIcon,
  SproutIcon,
  ActivityIcon,
  AlertTriangleIcon } from
'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export const AdminDashboard: React.FC = () => {
  const { farmers, officers, diseaseReports, crops } = useAppData();
  const activeCases = diseaseReports.filter(
    (r) => r.status === 'pending'
  ).length;
  // Mock activity data for chart
  const activityData = [
  {
    name: 'Mon',
    scans: 120,
    visits: 45
  },
  {
    name: 'Tue',
    scans: 150,
    visits: 52
  },
  {
    name: 'Wed',
    scans: 180,
    visits: 60
  },
  {
    name: 'Thu',
    scans: 140,
    visits: 48
  },
  {
    name: 'Fri',
    scans: 210,
    visits: 65
  },
  {
    name: 'Sat',
    scans: 250,
    visits: 30
  },
  {
    name: 'Sun',
    scans: 280,
    visits: 20
  }];

  const recentActivity = [
  {
    id: 1,
    type: 'alert',
    text: 'Outbreak detected in Nashik district',
    time: '10 mins ago'
  },
  {
    id: 2,
    type: 'user',
    text: 'New officer assigned to Pune',
    time: '1 hour ago'
  },
  {
    id: 3,
    type: 'system',
    text: 'Crop price database synced',
    time: '3 hours ago'
  },
  {
    id: 4,
    type: 'user',
    text: '50 new farmers registered',
    time: '5 hours ago'
  }];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-1">
            System Overview
          </h1>
          <p className="text-[var(--text-muted)]">CropAdvisor Admin Console</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-sm font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          System Healthy
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 border-l-4 border-l-admin">
          <div className="w-12 h-12 bg-admin/10 text-admin rounded-xl flex items-center justify-center flex-shrink-0">
            <UsersIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">
              {farmers.length}
            </p>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Total Farmers
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-l-4 border-l-officer">
          <div className="w-12 h-12 bg-officer/10 text-officer rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">
              {officers.length}
            </p>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Active Officers
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-l-4 border-l-danger">
          <div className="w-12 h-12 bg-red-100 text-danger rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangleIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">
              {activeCases}
            </p>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Active Cases
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-l-4 border-l-farmer">
          <div className="w-12 h-12 bg-farmer/10 text-farmer rounded-xl flex items-center justify-center flex-shrink-0">
            <SproutIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">
              {crops.length}
            </p>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Crop Database
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-[var(--text)] mb-6">
            Platform Activity (7 Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)" />
                
                <XAxis
                  dataKey="name"
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
                
                <Line
                  type="monotone"
                  dataKey="scans"
                  name="Disease Scans"
                  stroke="#4A235A"
                  strokeWidth={3}
                  dot={{
                    r: 4
                  }}
                  activeDot={{
                    r: 6
                  }} />
                
                <Line
                  type="monotone"
                  dataKey="visits"
                  name="Field Visits"
                  stroke="#1A5276"
                  strokeWidth={3}
                  dot={{
                    r: 4
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card>
          <h3 className="font-bold text-[var(--text)] mb-6 flex items-center gap-2">
            <ActivityIcon size={18} /> Recent Activity
          </h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border)] before:to-transparent">
            {recentActivity.map((item, index) =>
            <div
              key={item.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
                <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--surface)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${item.type === 'alert' ? 'bg-danger text-white' : item.type === 'user' ? 'bg-officer text-white' : 'bg-admin text-white'}`}>
                
                  {item.type === 'alert' ?
                <AlertTriangleIcon size={16} /> :
                item.type === 'user' ?
                <UsersIcon size={16} /> :

                <ActivityIcon size={16} />
                }
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-sm text-[var(--text)] capitalize">
                      {item.type}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {item.time}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {item.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>);

};