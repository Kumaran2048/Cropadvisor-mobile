import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Officer } from '../../types';
import { RadioIcon, UsersIcon, SendIcon, ClockIcon } from 'lucide-react';
import { toast } from 'sonner';
export const Broadcast: React.FC = () => {
  const { user } = useAuth();
  const { farmers, broadcasts, addBroadcast, sendBroadcast } = useAppData();
  const officer = user as Officer;
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [allowReplies, setAllowReplies] = useState(false);
  const districtFarmers = farmers.filter((f) => f.district === officer.district);
  const officerBroadcasts = broadcasts.filter((b) => b.officerId === officer.id);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    await sendBroadcast(message.trim(), 'General', allowReplies);
    setMessage('');
    setAllowReplies(false);
    setIsSending(false);
  };
  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--text)] mb-1">
          Broadcast Advisory
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Send urgent messages to all farmers in your district
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleSend}>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-[var(--text)]">
                  Compose Message
                </label>
                <div className="flex items-center gap-1 text-xs font-medium text-officer bg-officer/10 px-2 py-1 rounded-full">
                  <UsersIcon size={12} />
                  Target: {districtFarmers.length} Farmers in {officer.district}
                </div>
              </div>

              <textarea
                className="w-full h-40 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-officer resize-none mb-4"
                placeholder="Type your advisory message here... (e.g., Weather warnings, disease outbreaks, subsidy announcements)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required>
              </textarea>

              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={allowReplies}
                    onChange={(e) => setAllowReplies(e.target.checked)}
                    className="rounded border-gray-300 text-officer focus:ring-officer"
                  />
                  <span className="text-sm font-medium text-[var(--text)]">Allow farmers to reply</span>
                </label>
                <span className="text-xs text-[var(--text-muted)]">
                  {message.length} characters
                </span>
              </div>

              <div className="flex justify-end items-center">
                <Button
                  type="submit"
                  className="bg-officer hover:bg-officer-light gap-2"
                  disabled={isSending || !message.trim()}>
                  
                  {isSending ?
                  'Sending...' :

                  <>
                      <SendIcon size={18} /> Send Broadcast
                    </>
                  }
                </Button>
              </div>
            </form>
          </Card>

          <div>
            <h3 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <ClockIcon size={18} className="text-[var(--text-muted)]" />
              Broadcast History
            </h3>

            <div className="space-y-4">
              {officerBroadcasts.length === 0 ?
              <Card className="text-center py-8 text-[var(--text-muted)]">
                  No broadcasts sent yet.
                </Card> :

              officerBroadcasts.map((broadcast) =>
              <Card key={broadcast.id} className="relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-officer"></div>
                    <div className="pl-2">
                      <p className="text-[var(--text)] whitespace-pre-wrap mb-3">
                        {broadcast.message}
                      </p>
                      <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
                        <span>{new Date(broadcast.date).toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          <UsersIcon size={12} /> Delivered to{' '}
                          {districtFarmers.length}
                        </span>
                      </div>
                      {broadcast.allowReplies && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)]">
                          <p className="text-xs font-bold text-[var(--text-muted)] mb-2">Farmer Replies ({broadcast.replies?.length || 0}):</p>
                          {broadcast.replies && broadcast.replies.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                              {broadcast.replies.map((reply, idx) => (
                                <div key={idx} className="bg-[var(--background)] p-2 rounded text-xs text-[var(--text)]">
                                  <span className="font-bold">{reply.farmerName}: </span>
                                  {reply.message}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[var(--text-muted)] italic">No replies yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
              )
              }
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <RadioIcon size={18} /> Best Practices
            </h3>
            <ul className="space-y-3 text-sm text-blue-900 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                Keep messages concise and actionable.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                Include specific dates or timeframes if applicable.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                Use local language terms where appropriate for better
                understanding.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                Avoid sending multiple broadcasts in a single day unless urgent.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>);

};