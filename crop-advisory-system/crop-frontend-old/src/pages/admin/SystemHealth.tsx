import React from 'react';
import { Card } from '../../components/ui/Card';
import {
  ActivityIcon,
  ServerIcon,
  DatabaseIcon,
  CpuIcon,
  CheckCircleIcon } from
'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export const SystemHealth: React.FC = () => {
  const apiData = [
  {
    time: '00:00',
    calls: 1200
  },
  {
    time: '04:00',
    calls: 800
  },
  {
    time: '08:00',
    calls: 4500
  },
  {
    time: '12:00',
    calls: 6200
  },
  {
    time: '16:00',
    calls: 5800
  },
  {
    time: '20:00',
    calls: 3100
  }];

  const services = [
  {
    name: 'Authentication API',
    status: 'operational',
    latency: '45ms'
  },
  {
    name: 'AI Disease Model',
    status: 'operational',
    latency: '850ms'
  },
  {
    name: 'Market Price Sync',
    status: 'operational',
    latency: '120ms'
  },
  {
    name: 'Weather Service',
    status: 'operational',
    latency: '65ms'
  },
  {
    name: 'Database Cluster',
    status: 'operational',
    latency: '12ms'
  }];

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-1">
          System Health
        </h1>
        <p className="text-[var(--text-muted)]">
          Monitor platform performance and API usage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ActivityIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">99.99%</p>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Uptime (30d)
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ServerIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">21.6K</p>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              API Calls (24h)
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <CpuIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">42%</p>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Avg CPU Load
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-[var(--text)] mb-6">
            API Traffic (24h)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={apiData}
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
                  dataKey="time"
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
                  }}
                  cursor={{
                    fill: 'var(--border)',
                    opacity: 0.4
                  }} />
                
                <Bar dataKey="calls" fill="#4A235A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2">
            <DatabaseIcon size={18} /> Service Status
          </h3>
          <div className="space-y-4">
            {services.map((service, index) =>
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-gray-50 dark:bg-gray-800/30">
              
                <div>
                  <p className="font-medium text-sm text-[var(--text)]">
                    {service.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {service.latency} latency
                  </p>
                </div>
                <div className="flex items-center gap-1 text-success text-sm font-medium">
                  <CheckCircleIcon size={14} />
                  OK
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>);

};