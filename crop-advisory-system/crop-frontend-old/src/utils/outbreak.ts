import { DiseaseReport } from '../types';

export interface OutbreakAlert {
  diseaseName: string;
  district: string;
  count: number;
  isOutbreak: boolean;
}

export const checkOutbreak = (
reports: DiseaseReport[],
district: string,
diseaseName: string)
: OutbreakAlert => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentReports = reports.filter(
    (r) =>
    r.district === district &&
    r.diseaseName === diseaseName &&
    new Date(r.date) >= sevenDaysAgo
  );

  return {
    diseaseName,
    district,
    count: recentReports.length,
    isOutbreak: recentReports.length >= 5
  };
};