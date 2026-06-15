import React from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { PhoneIcon, MailIcon, UserIcon } from 'lucide-react';
interface DistrictOfficerCardProps {
  district: string;
}
export const DistrictOfficerCard: React.FC<DistrictOfficerCardProps> = ({
  district
}) => {
  const { officers } = useAppData();
  const officer = officers.find((o) => o.district === district);
  if (!officer) {
    return (
      <Card className="border-l-4 border-l-yellow-500">
        <p className="text-sm text-[var(--text-muted)]">
          No officer assigned to {district} district yet.
        </p>
      </Card>);

  }
  return (
    <Card className="border border-[var(--border)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-officer"></div>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          YOUR DISTRICT OFFICER
        </p>
        <Badge variant={officer.isActive ? 'success' : 'neutral'}>
          {officer.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="w-12 h-12 rounded-full bg-officer-light flex items-center justify-center text-white flex-shrink-0">
          <UserIcon size={24} />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--text)] text-lg">
            Officer {officer.name}
          </h4>
          <div className="flex items-center text-sm text-[var(--text-muted)] mt-1">
            <PhoneIcon size={14} className="mr-1 text-officer" />
            {officer.phone || 'N/A'}
          </div>
          <div className="flex items-center text-sm text-officer mt-1">
            <MailIcon size={14} className="mr-1" />
            <a href={`mailto:${officer.email}`} className="hover:underline">
              {officer.email}
            </a>
          </div>
        </div>
      </div>
    </Card>);

};