import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Swords, Shield, User } from 'lucide-react';
import { AllianceMember } from '../types';

interface LeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: AllianceMember[];
}

export const LeaderModal = ({ isOpen, onClose, members }: LeaderModalProps) => {
  // roleMember '3' is King, '2' is Team Leader
  const leaders = members.filter(m => m.roleMember === '3' || m.roleMember === '2');
  
  const kings = leaders.filter(m => m.roleMember === '3');
  const teamLeaders = leaders.filter(m => m.roleMember === '2');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 100 }}
            className="relative w-full max-w-5xl frost-glass p-6 md:p-8 rounded-t-[32px] sm:rounded-[32px] border-white/10 shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all z-10"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6 sm:mb-8 flex-shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">Alliance Structure</h2>
              <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest font-bold">Command Leaders</p>
            </div>

            <div className="overflow-y-auto pr-2 scrollbar-hide flex-1">
              <div className="space-y-6 sm:space-y-8">
                {/* Kings Section */}
                {kings.length > 0 && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                      <Crown size={14} className="text-amber-400 sm:w-4 sm:h-4" />
                      King
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                      {kings.map(king => (
                          <div key={king.idMember} className="bg-white/5 border border-amber-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center gap-3 sm:gap-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-400 font-bold text-lg border border-amber-500/30 flex-shrink-0">
                              <User size={18} className="sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white truncate">{king.nameMember}</div>
                              <div className="text-[10px] text-slate-400 truncate">ID: {king.idMember}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold border border-amber-500/30 whitespace-nowrap">
                                <Crown size={12} className="sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">King</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team Leaders Section */}
                  {teamLeaders.length > 0 && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                        <Swords size={14} className="text-emerald-400 sm:w-4 sm:h-4" />
                        Team Leaders
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                        {teamLeaders.map(leader => (
                          <div key={leader.idMember} className="bg-white/5 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center gap-3 sm:gap-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 flex items-center justify-center text-emerald-400 font-bold text-lg border border-emerald-500/30 flex-shrink-0">
                              <User size={18} className="sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white truncate">{leader.nameMember}</div>
                              <div className="text-[10px] text-slate-400 truncate">ID: {leader.idMember}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-500/30 whitespace-nowrap">
                                <Swords size={12} className="sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">Leader</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {leaders.length === 0 && (
                    <div className="text-center py-12">
                      <Shield className="mx-auto text-slate-600 mb-4" size={48} />
                      <p className="text-slate-400 text-sm">No leaders found in the alliance.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };
