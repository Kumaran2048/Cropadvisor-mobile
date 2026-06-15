import API from './api';

export interface DiseaseResult {
  diseaseName: string;
  confidence: number;
  treatment: string;
  prevention: string;
  isHighRisk: boolean;
  severity?: string;
  pesticide?: string;
}

export const detectDisease = async (
  image: File
): Promise<DiseaseResult> => {
  try {
    const formData = new FormData();
    formData.append('image', image);
    
    const res = await API.post('/disease/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Adapt API response to DiseaseResult interface
    return {
      diseaseName: res.data.disease || res.data.diseaseName,
      confidence: res.data.confidence,
      treatment: res.data.treatment,
      prevention: res.data.prevention,
      isHighRisk: res.data.severity === 'High',
      severity: res.data.severity,
      pesticide: res.data.pesticide
    };
  } catch (err) {
    console.error('Disease detection failed:', err);
    throw err;
  }
};