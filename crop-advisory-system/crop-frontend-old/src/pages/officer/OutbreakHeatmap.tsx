import React, { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Officer } from '../../types';
import { checkOutbreak } from '../../utils/outbreak';
import { AlertTriangleIcon, MapIcon, InfoIcon } from 'lucide-react';
export const OutbreakHeatmap: React.FC = () => {
  const { user } = useAuth();
  const { diseaseReports } = useAppData();
  const officer = user as Officer;
  // Find if there's an outbreak
  const outbreakData = useMemo(() => {
    // Group reports by disease
    const districtReports = diseaseReports.filter(
      (r) => r.district === officer.district
    );
    const diseaseCounts: Record<string, number> = {};
    districtReports.forEach((r) => {
      diseaseCounts[r.diseaseName] = (diseaseCounts[r.diseaseName] || 0) + 1;
    });
    // Find the disease with the most reports
    let topDisease = '';
    let maxCount = 0;
    Object.entries(diseaseCounts).forEach(([disease, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topDisease = disease;
      }
    });
    if (topDisease) {
      return checkOutbreak(diseaseReports, officer.district, topDisease);
    }
    return null;
  }, [diseaseReports, officer.district]);
  // Mock heatmap grid data
  const generateGrid = () => {
    const grid = [];
    for (let i = 0; i < 25; i++) {
      // Create a cluster in the center if there's an outbreak
      const isCenter = i === 12 || i === 11 || i === 13 || i === 7 || i === 17;
      const intensity =
      outbreakData?.isOutbreak && isCenter ?
      Math.random() * 0.5 + 0.5 // High intensity (0.5 - 1.0)
      : Math.random() * 0.3; // Low intensity (0.0 - 0.3)
      grid.push({
        id: i,
        intensity
      });
    }
    return grid;
  };
  const gridData = useMemo(generateGrid, [outbreakData]);
  const getColorForIntensity = (intensity: number) => {
    if (intensity > 0.8) return 'bg-red-600';
    if (intensity > 0.6) return 'bg-red-500';
    if (intensity > 0.4) return 'bg-orange-500';
    if (intensity > 0.2) return 'bg-yellow-400';
    return 'bg-green-100 dark:bg-green-900/30';
  };
  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
          Outbreak Heatmap
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Spatial distribution of disease cases in {officer.district}
        </p>
      </div>

      {!outbreakData?.isOutbreak ?
      <Card className="text-center py-16 border-dashed border-2">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapIcon size={32} />
          </div>
          <h3 className="font-bold text-lg text-[var(--text)] mb-2">
            No Active Outbreaks
          </h3>
          <p className="text-[var(--text-muted)] max-w-md mx-auto">
            The heatmap is only generated when 5 or more cases of the same
            disease are reported within 7 days in your district.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-[var(--text-muted)]">
            <InfoIcon size={16} />
            Currently monitoring{' '}
            {
          diseaseReports.filter((r) => r.district === officer.district).
          length
          }{' '}
            total cases
          </div>
        </Card> :

      <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-4">
            <div className="w-12 h-12 bg-danger text-white rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangleIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-danger">
                  OUTBREAK DETECTED
                </h2>
                <Badge variant="danger">High Severity</Badge>
              </div>
              <p className="text-[var(--text)]">
                <strong>{outbreakData.diseaseName}</strong> is spreading rapidly
                in {officer.district}.{outbreakData.count} cases reported in the
                last 7 days.
              </p>
            </div>
          </div>

          <Card className="p-1">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 relative">
              {/* Mock Map Overlay */}
              <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
              }}>
            </div>

              <div className="grid grid-cols-5 gap-2 relative z-10 max-w-2xl mx-auto">
                {gridData.map((cell) =>
              <div
                key={cell.id}
                className={`aspect-square rounded-md transition-colors duration-500 ${getColorForIntensity(cell.intensity)} border border-black/5 dark:border-white/5`}
                title={`Intensity: ${(cell.intensity * 100).toFixed(0)}%`}>
              </div>
              )}
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
                <span>Low Risk</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30"></div>
                  <div className="w-4 h-4 rounded bg-yellow-400"></div>
                  <div className="w-4 h-4 rounded bg-orange-500"></div>
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <div className="w-4 h-4 rounded bg-red-600"></div>
                </div>
                <span>High Risk</span>
              </div>
            </div>
          </Card>
        </div>
      }
    </div>);

};