import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Farmer } from '../../types';
import {
  BellIcon,
  AlertTriangleIcon,
  CloudLightningIcon,
  RadioIcon } from
'lucide-react';
export const Alerts: React.FC = () => {
  const { user } = useAuth();
  const { broadcasts, diseaseReports, replyToBroadcast } = useAppData();
  const { language } = useLanguage();
  const farmer = user as Farmer;
  
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [translatedAlerts, setTranslatedAlerts] = useState<{ [key: string]: boolean }>({});

  const handleReply = async (alertId: string) => {
    if (!replyText[alertId]) return;
    await replyToBroadcast(alertId, replyText[alertId]);
    setReplyText((prev) => ({ ...prev, [alertId]: '' }));
  };

  const toggleTranslate = (alertId: string) => {
    setTranslatedAlerts((prev) => ({ ...prev, [alertId]: !prev[alertId] }));
  };

  // Filter broadcasts for this farmer's district
  const districtBroadcasts = broadcasts.filter(
    (b) => b.district === farmer.district
  );
  // Mock an outbreak alert if there are recent reports in the district
  const recentDistrictReports = diseaseReports.filter(
    (r) => r.district === farmer.district
  );
  const hasOutbreak = recentDistrictReports.length >= 2; // Lowered threshold for demo visibility
  return (
    <div className="max-w-md mx-auto pb-20 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-farmer/10 text-farmer flex items-center justify-center">
          <BellIcon size={20} />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
            Alerts
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Important updates for your farm
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Outbreak Alert */}
        {hasOutbreak && (() => {
          const isTranslated = translatedAlerts['outbreak'];
          
          let title = "OUTBREAK WARNING";
          let message = `Multiple cases of Tomato Late Blight detected in ${farmer.district} district.`;
          
          if (isTranslated && language !== 'en') {
            if (language === 'hi') {
              title = "प्रकोप की चेतावनी";
              message = `${farmer.district} जिले में टमाटर के पछेती झुलसा रोग (Tomato Late Blight) के कई मामले पाए गए हैं।`;
            } else if (language === 'ta') {
              title = "வெடிப்பு எச்சரிக்கை";
              message = `${farmer.district} மாவட்டத்தில் தக்காளி லேட் பிளைட் நோயின் பல வழக்குகள் கண்டறியப்பட்டுள்ளன.`;
            } else if (language === 'mr') {
              title = "प्रकोपाचा इशारा";
              message = `${farmer.district} जिल्ह्यात टोमॅटो लेट ब्लाईटचे अनेक रुग्ण आढळले आहेत.`;
            } else if (language === 'te') {
              title = "వ్యాప్తి హెచ్చరిక";
              message = `${farmer.district} జిల్లాలో టమోటా లేట్ బ్లైట్ యొక్క బహుళ కేసులు కనుగొనబడ్డాయి.`;
            }
          }

          return (
            <Card className="border-l-4 border-l-danger bg-red-50 dark:bg-red-900/20">
              <div className="flex gap-3">
                <AlertTriangleIcon
                className="text-danger flex-shrink-0 mt-1"
                size={20} />
              
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-danger mb-1">{title}</h3>
                    {language !== 'en' && (
                      <button 
                        onClick={() => toggleTranslate('outbreak')}
                        className="text-xs text-danger hover:underline"
                      >
                        {isTranslated ? 'Show Original' : 'Translate'}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text)] mb-2">
                    {message}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">2 hours ago</p>
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Weather Alert */}
        {(() => {
          const isTranslated = translatedAlerts['weather'];
          
          let title = "Heavy Rain Expected";
          let message = "15-20mm rain expected tomorrow. Delay irrigation and secure harvested crops.";
          
          if (isTranslated && language !== 'en') {
            if (language === 'hi') {
              title = "भारी बारिश की संभावना";
              message = "कल 15-20 मिमी बारिश की उम्मीद है। सिंचाई में देरी करें और कटी हुई फसलों को सुरक्षित करें।";
            } else if (language === 'ta') {
              title = "கனமழை எதிர்பார்க்கப்படுகிறது";
              message = "நாளை 15-20மிமீ மழை எதிர்பார்க்கப்படுகிறது. நீர்ப்பாசனத்தைத் தள்ளிப்போட்டு, அறுவடை செய்த பயிர்களைப் பாதுகாக்கவும்.";
            } else if (language === 'mr') {
              title = "मुसळधार पावसाची शक्यता";
              message = "उद्या 15-20 मिमी पावसाची शक्यता आहे. सिंचनास उशीर करा आणि काढणी केलेले पीक सुरक्षित करा.";
            } else if (language === 'te') {
              title = "భారీ వర్షం సూచన";
              message = "రేపు 15-20 మిమీ వర్షం పడే అవకాశం ఉంది. నీటిపారుదలని ఆలస్యం చేయండి మరియు కోసిన పంటలను సురక్షితం చేయండి.";
            }
          }

          return (
            <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex gap-3">
                <CloudLightningIcon
                  className="text-blue-500 flex-shrink-0 mt-1"
                  size={20} />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-1">
                      {title}
                    </h3>
                    {language !== 'en' && (
                      <button 
                        onClick={() => toggleTranslate('weather')}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        {isTranslated ? 'Show Original' : 'Translate'}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text)] mb-2">
                    {message}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">5 hours ago</p>
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Broadcasts from Officer */}
        {districtBroadcasts.map((broadcast) => {
          const isTranslated = translatedAlerts[broadcast.id];
          // Mock translation: Just append a note indicating translation if toggled and language is not English
          const displayMessage = isTranslated && language !== 'en' 
            ? `${broadcast.message}\n\n[Translated to ${language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : language === 'mr' ? 'Marathi' : 'Telugu'} (Mock)]` 
            : broadcast.message;

          return (
          <Card key={broadcast.id} className="border-l-4 border-l-officer">
              <div className="flex gap-3">
                <RadioIcon
                className="text-officer flex-shrink-0 mt-1"
                size={20} />
              
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[var(--text)] mb-1">
                      Officer Advisory
                    </h3>
                    {language !== 'en' && (
                      <button 
                        onClick={() => toggleTranslate(broadcast.id)}
                        className="text-xs text-officer hover:underline"
                      >
                        {isTranslated ? 'Show Original' : 'Translate'}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text)] mb-2 whitespace-pre-wrap">
                    {displayMessage}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    {new Date(broadcast.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  </p>

                  {broadcast.allowReplies && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Reply to officer..." 
                          value={replyText[broadcast.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [broadcast.id]: e.target.value })}
                          className="flex-1 text-sm"
                        />
                        <Button onClick={() => handleReply(broadcast.id)} className="px-3" disabled={!replyText[broadcast.id]}>
                          Send
                        </Button>
                      </div>
                      
                      {broadcast.replies && broadcast.replies.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-bold text-[var(--text-muted)]">Your Replies:</p>
                          {broadcast.replies.filter(r => r.farmerId === farmer.id).map((r, idx) => (
                            <div key={idx} className="bg-[var(--background)] p-2 rounded text-xs text-[var(--text)]">
                              {r.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {!hasOutbreak && districtBroadcasts.length === 0 &&
        <div className="text-center py-10 text-[var(--text-muted)]">
            <BellIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>No new alerts at this time.</p>
          </div>
        }
      </div>
    </div>);

};