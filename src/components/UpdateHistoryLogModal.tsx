import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, User, Calendar, Activity, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface UpdateHistoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateHistoryLogModal = ({ isOpen, onClose }: UpdateHistoryLogModalProps) => {
  const [logs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetchLogs();
    setLoading(false);
    setError('Update history logging is currently disabled.');
  }, [isOpen]);

  async function fetchLogs() {
    // Disabled
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Update History Log</h2>
                  <p className="text-xs text-slate-400 mt-1">Track all system update actions</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading history...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                    <AlertCircle className="text-red-400" size={32} />
                  </div>
                  <p className="text-red-400 font-bold mb-2">Error Fetching Data</p>
                  <p className="text-slate-400 text-xs max-w-xs">{error}</p>
                  <button 
                    onClick={fetchLogs}
                    className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all"
                  >
                    Try Again
                  </button>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <Activity className="text-slate-600" size={32} />
                  </div>
                  <p className="text-slate-400 font-medium">No update history found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div 
                      key={log.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                            <User size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                              {log.idUser}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              Performed <span className="text-blue-300 font-bold">{log.actionUpdate}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {format(new Date(log.dateUpdate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 font-mono">
                            {format(new Date(log.dateUpdate), 'HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
