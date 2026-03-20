import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Calendar, Skull } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getDirectDriveUrl } from '../lib/utils';
import { AllianceInformation, HistoryKingdom } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [allianceInfo, setAllianceInfo] = useState<AllianceInformation | null>(null);
  const [history, setHistory] = useState<HistoryKingdom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchData() {
      setLoading(true);
      try {
        const { data: infoData, error: infoError } = await supabase
          .from('AllianceInformation')
          .select('*');
        
        const { data: historyData, error: historyError } = await supabase
          .from('HistoryKingdom')
          .select('*')
          .order('dateHistory', { ascending: false });

        if (infoError) console.error('Error fetching AllianceInformation:', infoError);
        else if (infoData && infoData.length > 0) setAllianceInfo(infoData[0]);

        if (historyError) console.error('Error fetching HistoryKingdom:', historyError);
        else if (historyData) setHistory(historyData);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl h-[95vh] md:h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/50 text-white/50 hover:text-white hover:bg-black/80 transition-all"
            >
              <X size={24} />
            </button>

            {/* Left Side: Alliance Avatar (Large) */}
            <div className="h-48 md:h-auto md:flex-[1.5] relative overflow-hidden group flex-shrink-0">
              <img 
                src={getDirectDriveUrl(allianceInfo?.imageAlliance) || "https://picsum.photos/seed/dragon-alliance/1200/1200"} 
                alt="Alliance Crest"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              
              <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12">
                <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-frost-500 rounded-xl md:rounded-3xl flex items-center justify-center frost-glow shadow-2xl border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    <Skull className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] w-6 h-6 md:w-10 md:h-10" />
                  </div>
                  <div>
                    <p className="text-yellow-400 font-bold tracking-[0.3em] uppercase text-[10px] md:text-sm drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">{allianceInfo?.tagAlliance || 'YSS'}</p>
                    <h2 className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-white to-blue-500 animate-gradient tracking-tighter italic text-glow">{allianceInfo?.nameAlliance || 'Elite Vanguard'}</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Alliance Stats & History */}
            <div className="flex-1 p-3 md:p-8 flex flex-col bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/5 overflow-y-auto overflow-x-hidden scrollbar-hide min-h-0">
              {/* Current Season Section */}
              <div className="mb-3 md:mb-8 flex-shrink-0">
                <div className="mb-1.5 md:mb-4">
                  <h3 className="text-base md:text-xl font-bold text-white mb-0.5 md:mb-1 flex items-center gap-2">
                    <Trophy className="text-emerald-400" size={16} />
                    Current Season
                  </h3>
                  <p className="text-slate-500 text-[9px] md:text-[11px]">Server: {allianceInfo?.serverAlliance || 'N/A'}</p>
                </div>
                
                {/* Current Season Items */}
                {history.filter(item => item.status === '3').map((item) => (
                  <div key={item.id} className="p-2 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                    <h4 className="text-[11px] md:text-sm font-bold text-white mb-0.5 md:mb-1">{item.titleHistory}</h4>
                    <p className="text-[9px] md:text-[10px] text-emerald-300/70">{item.desHistory}</p>
                  </div>
                ))}
              </div>

              {/* Victory History Section */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-1.5 md:mb-4 flex-shrink-0">
                  <h3 className="text-base md:text-xl font-bold text-white mb-0.5 md:mb-1 flex items-center gap-2">
                    <Trophy className="text-amber-400" size={16} />
                    Kingdom History
                  </h3>
                  <p className="text-slate-500 text-[9px] md:text-[11px]">The glorious path of our kingdom.</p>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1.5 md:pr-2 space-y-1.5 md:space-y-3 scrollbar-hide min-h-0">
                  {history.filter(item => item.status === '1' || item.status === '2').map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-2 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r ${
                        item.status === '1' 
                          ? 'from-blue-500/10 to-transparent border border-blue-500/20' 
                          : 'from-red-500/10 to-transparent border border-red-500/20'
                      } transition-all group`}
                    >
                      <div className="flex justify-between items-start mb-0.5 md:mb-1">
                        <h4 className="text-[11px] md:text-sm font-bold text-white group-hover:text-frost-300 transition-colors">{item.titleHistory}</h4>
                        <span className={`text-[7px] md:text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.status === '1' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.status === '1' ? 'Victory' : 'Defeat'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 md:gap-1">
                        <p className="text-[9px] md:text-[10px] text-slate-400 line-clamp-2">{item.desHistory}</p>
                        <div className="flex items-center gap-1 text-[8px] md:text-[9px] text-slate-500 mt-0.5 md:mt-1">
                          <Calendar size={10} />
                          {new Date(item.dateHistory).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 pt-2 md:mt-6 md:pt-6 border-t border-white/5 flex-shrink-0">
                <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-[280px] md:max-w-none mx-auto md:mx-0">
                  <div className="text-center py-2 px-2 md:p-3 rounded-xl md:rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold mb-0.5">Total Wins</p>
                    <p className="text-sm md:text-xl font-bold text-white">
                      {history.filter(item => item.status === '1').length}
                    </p>
                  </div>
                  <div className="text-center py-2 px-2 md:p-3 rounded-xl md:rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold mb-0.5">Win Rate</p>
                    <p className="text-sm md:text-xl font-bold text-white">
                      {(() => {
                        const wins = history.filter(item => item.status === '1').length;
                        const total = history.filter(item => item.status === '1' || item.status === '2').length;
                        return total > 0 ? `${Math.round((wins / total) * 100)}%` : '0%';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
