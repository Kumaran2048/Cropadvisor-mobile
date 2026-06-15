import React, { useState, useEffect } from 'react';
import {
  CloudRainIcon,
  WindIcon,
  DropletsIcon,
  SunIcon,
  CloudIcon,
  Thermometer,
  CloudLightningIcon,
  AlertTriangle,
  Waves
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../utils/api';
import { motion } from 'framer-motion';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
  district: string;
}

interface ForecastItem {
  date: string;
  temp: number;
  humidity: number;
  rainfall: number;
  description: string;
}

export const Weather: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [advice, setAdvice] = useState<string>('');
  const [impacts, setImpacts] = useState<string[]>([]);
  const [soilMoisture, setSoilMoisture] = useState(65);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, forecastRes] = await Promise.all([
          API.get('/weather/current'),
          API.get('/weather/forecast')
        ]);
        
        setWeather(weatherRes.data.weather);
        setAdvice(weatherRes.data.irrigationAdvice);
        setImpacts(weatherRes.data.impactAnalysis);
        setForecast(forecastRes.data.forecast);
      } catch (err) {
        console.error('Failed to fetch real-time weather data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farmer"></div>
      </div>
    );
  }

  const getWeatherIcon = (desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes('rain')) return <CloudRainIcon className="text-blue-400" />;
    if (d.includes('cloud')) return <CloudIcon className="text-gray-400" />;
    if (d.includes('clear') || d.includes('sun')) return <SunIcon className="text-gold" />;
    return <CloudIcon className="text-gray-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8 px-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-1">
            Real-Time Weather
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Station: {weather?.district || 'Detecting...'}</p>
        </div>
        <div className="text-right">
          <Badge variant="success" className="animate-pulse">● LIVE UPDATES</Badge>
        </div>
      </div>

      {/* Main Weather Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-farmer to-farmer-dark rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                {weather && getWeatherIcon(weather.description)}
                <span className="text-lg font-medium opacity-80 capitalize">{weather?.description}</span>
             </div>
             <h2 className="text-7xl font-black mb-1">{Math.round(weather?.temperature || 0)}°C</h2>
             <p className="text-xl opacity-90 font-medium">Feels like {Math.round((weather?.temperature || 0) + 2)}°C</p>
          </div>

          <div className="grid grid-cols-3 gap-6 bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 w-full md:w-auto">
            <div className="text-center">
              <DropletsIcon size={24} className="mx-auto mb-2 text-blue-200" />
              <p className="text-xs opacity-70 mb-1 uppercase font-bold tracking-tighter">Humidity</p>
              <p className="text-xl font-bold">{weather?.humidity}%</p>
            </div>
            <div className="text-center">
              <Waves size={24} className="mx-auto mb-2 text-blue-300" />
              <p className="text-xs opacity-70 mb-1 uppercase font-bold tracking-tighter">Rain</p>
              <p className="text-xl font-bold">{weather?.rainfall}mm</p>
            </div>
            <div className="text-center">
              <WindIcon size={24} className="mx-auto mb-2 text-farmer-light" />
              <p className="text-xs opacity-70 mb-1 uppercase font-bold tracking-tighter">Wind</p>
              <p className="text-xl font-bold">{weather?.windSpeed}km/h</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Smart Irrigation Advisor */}
        <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
               <DropletsIcon size={20} />
            </div>
            <h3 className="font-bold text-lg text-[var(--text)]">Smart Irrigation Advisor</h3>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
            <div className="flex justify-between text-sm mb-4">
              <span className="text-[var(--text-muted)] font-bold">SOIL MOISTURE SENSOR:</span>
              <span className="font-black text-farmer">{soilMoisture}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-farmer mb-4" 
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">
              <span>Very Dry</span>
              <span>Optimal Range</span>
              <span>Waterlogged</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 flex-shrink-0">
                <Waves size={20} />
             </div>
             <div>
                <h4 className="font-bold text-blue-900 mb-1">Irrigation Suggestion</h4>
                <p className="text-sm text-blue-800/80 leading-relaxed font-medium">{advice}</p>
             </div>
          </div>
        </Card>

        {/* Forecast & Risk */}
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                   <AlertTriangle size={20} />
                </div>
                <h3 className="font-bold text-lg text-[var(--text)]">Weather Impact Analysis</h3>
             </div>
             <div className="space-y-3">
                {impacts.map((impact, idx) => (
                   <div key={idx} className="flex gap-3 items-start p-3 bg-orange-50/50 rounded-xl text-sm font-medium text-orange-900 border border-orange-100/50">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      {impact}
                   </div>
                ))}
             </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white">
             <h3 className="font-bold mb-4 text-[var(--text)]">5-Day Forecast</h3>
             <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {forecast.map((day, i) => (
                  <div key={i} className="min-w-[100px] flex-shrink-0 text-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-farmer transition-colors">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <div className="flex justify-center mb-3 scale-110 group-hover:scale-125 transition-transform">
                      {getWeatherIcon(day.description)}
                    </div>
                    <p className="font-black text-lg text-gray-800">{Math.round(day.temp)}°</p>
                    <p className="text-[10px] font-bold text-blue-400">{day.rainfall}mm</p>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper Badge component since it might not be exported
const Badge: React.FC<{ children: React.ReactNode; variant?: string; className?: string }> = ({ children, className }) => (
  <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-green-100 text-green-700 ${className}`}>
    {children}
  </span>
);