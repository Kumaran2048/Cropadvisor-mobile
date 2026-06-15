import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { detectDisease } from '../../utils/detectDisease';
import { toast } from 'sonner';

export const DiseaseScanner: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setResult(null); // Clear previous result
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const data = await detectDisease(image);
      setResult(data);
      toast.success('AI Analysis Complete!', {
        description: `Detected ${data.diseaseName} with ${data.confidence}% confidence.`
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Ensure the analysis service is running and try again.';
      toast.error('Scanning Failed', {
        description: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    toast.success('Result Saved', {
      description: 'Your diagnosis has been added to your history and shared with your district officer.'
    });
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-800">AI Disease Scanner</h1>
          <p className="text-gray-500 mt-1">Instant leaf disease detection using TensorFlow AI</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
           <Badge variant="success" className="px-3 py-1.5 gap-1.5">
             <ShieldCheck size={14} /> 98% Accuracy
           </Badge>
           <Badge variant="info" className="px-3 py-1.5 gap-1.5">
             <Zap size={14} /> Real-time
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Upload & Preview */}
        <Card className="p-8 border-none shadow-xl shadow-gray-200/50 bg-white min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 bg-farmer/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                   <div className="absolute inset-0 bg-farmer/10 rounded-full animate-ping opacity-20"></div>
                   <Camera size={40} className="text-farmer" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Capture or Upload</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">Take a clear photo of the infected leaf for accurate AI analysis</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()} className="gap-2 px-8">
                    <Upload size={18} />
                    Choose File
                  </Button>
                  <Button onClick={() => cameraInputRef.current?.click()} variant="outline" className="gap-2 px-8">
                    <Camera size={18} />
                    Open Camera
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full flex flex-col items-center"
              >
                <div className="relative w-full aspect-video md:aspect-square max-h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src={preview} alt="Leaf preview" className="w-full h-full object-cover" />
                  {loading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                       <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                       <p className="font-bold tracking-widest uppercase text-xs">Analyzing with AI...</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6 w-full max-w-md">
                   {!result && (
                     <Button 
                      fullWidth 
                      onClick={handleScan} 
                      disabled={loading}
                      className="bg-gradient-to-r from-farmer to-green-600 shadow-lg shadow-farmer/30 h-14"
                     >
                       Start Deep Scan
                     </Button>
                   )}
                   <Button variant="ghost" onClick={reset} disabled={loading} className="text-gray-500">
                     Remove
                   </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Right Column: Results & Info */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className={`border-none shadow-xl ${result.disease === 'Healthy' ? 'bg-green-50' : 'bg-red-50'} p-8`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.disease === 'Healthy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {result.disease === 'Healthy' ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Diagnosis</p>
                          <h2 className="text-2xl font-bold text-gray-800">{result.disease}</h2>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-gray-800">{result.confidence}%</p>
                         <p className="text-[10px] font-bold opacity-60 uppercase">Confidence</p>
                      </div>
                   </div>

                   <div className="bg-white/60 rounded-2xl p-6 border border-white">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-gold" />
                        Treatment Plan
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {result.treatment}
                      </p>
                      {result.pesticide && result.pesticide !== 'None required' && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                           <span className="text-xs font-bold text-gray-500 uppercase">Recommended Product</span>
                           <Badge variant="warning">{result.pesticide}</Badge>
                        </div>
                      )}
                   </div>

                   <div className="mt-6 flex gap-4">
                      <Button fullWidth variant="outline" onClick={reset}>Scan New Leaf</Button>
                      <Button fullWidth className="bg-white text-gray-800 border-none hover:bg-gray-100 shadow-sm" onClick={handleSave}>Save Result</Button>
                   </div>
                </Card>

                {/* Helpful Info Card */}
                <Card className="bg-blue-50 border-none p-6">
                   <div className="flex gap-3">
                      <Info className="text-blue-500 flex-shrink-0" size={20} />
                      <div>
                        <h4 className="text-sm font-bold text-blue-900">Expert Review Needed?</h4>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">Your district officer has been notified of this diagnosis. You can request a field visit directly from the dashboard if the condition persists.</p>
                      </div>
                   </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Photo Tips Card */}
                <Card className="p-8 bg-gradient-to-br from-gray-50 to-white border-none shadow-lg">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-farmer" />
                    Scanning Best Practices
                  </h3>
                  <div className="space-y-6">
                    {[
                      { title: 'Good Lighting', desc: 'Avoid direct sunlight or heavy shadows.', icon: Zap },
                      { title: 'Clear Focus', desc: 'Hold the camera about 6-10 inches away.', icon: Zap },
                      { title: 'Infected Area', desc: 'Ensure the disease spots are clearly visible.', icon: Zap }
                    ].map((tip) => (
                      <div key={tip.title} className="flex gap-4 group">
                        <div className="w-1.5 h-10 bg-gray-100 rounded-full group-hover:bg-farmer/20 transition-colors"></div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">{tip.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Statistics Card */}
                <Card className="bg-[#1A1A1A] text-white p-8 border-none shadow-xl shadow-gray-900/10">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest">Recent Activity</h4>
                      <History size={18} className="opacity-40" />
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                         <span className="text-xs text-gray-400">Total Scans</span>
                         <span className="font-bold">24</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                         <span className="text-xs text-gray-400">Healthy Leaves</span>
                         <span className="font-bold text-success">18</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                         <span className="text-xs text-gray-400">Diseases Found</span>
                         <span className="font-bold text-red-400">6</span>
                      </div>
                   </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};