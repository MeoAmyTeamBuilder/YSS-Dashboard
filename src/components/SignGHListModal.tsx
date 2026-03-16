import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Zap, Clock, Search, AlertCircle, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SignGH } from '../types';
import * as XLSX from 'xlsx';

interface SignGHListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignGHListModal = ({ isOpen, onClose }: SignGHListModalProps) => {
  const [registrations, setRegistrations] = useState<SignGH[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<number | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRegistrations();
    }
  }, [isOpen]);

  async function fetchRegistrations() {
    try {
      setLoading(true);
      // Fetch only Approved (1) and Rejected (2)
      const { data, error } = await supabase
        .from('SignGH')
        .select('*')
        .in('stateSign', [1, 2])
        .order('id', { ascending: false });
      
      if (error) throw error;
      if (data) setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const matchesSearch = r.nameMember.toLowerCase().includes(searchTerm.toLowerCase()) || r.idMember.includes(searchTerm);
      const matchesFilter = filterState === 'all' || r.stateSign === filterState;
      return matchesSearch && matchesFilter;
    });
  }, [registrations, searchTerm, filterState]);

  const stats = useMemo(() => {
    return {
      total: registrations.length,
      approved: registrations.filter(r => r.stateSign === 1).length,
      rejected: registrations.filter(r => r.stateSign === 2).length
    };
  }, [registrations]);

  const filterOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 1, label: 'Approved Only' },
    { value: 2, label: 'Rejected Only' }
  ];
  const currentFilterLabel = filterOptions.find(o => o.value === filterState)?.label || 'All Statuses';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
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
            className="relative w-full max-w-5xl h-[90vh] sm:h-[85vh] max-h-[900px] bg-[#0a0a0a] border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent shrink-0">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                  <Zap size={20} className="drop-shadow-md sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">Great Hall Members</h2>
                  <p className="text-[10px] sm:text-sm text-slate-400 mt-0.5 sm:mt-1">Review approved and rejected registrations</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-4 bg-white/5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-white/5 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex flex-col items-center px-2 sm:px-4 border-r border-white/10">
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
                    <span className="text-sm sm:text-lg font-black text-white">{stats.total}</span>
                  </div>
                  <div className="flex flex-col items-center px-2 sm:px-4 border-r border-white/10">
                    <span className="text-[8px] sm:text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider">Approved</span>
                    <span className="text-sm sm:text-lg font-black text-emerald-400">{stats.approved}</span>
                  </div>
                  <div className="flex flex-col items-center px-2 sm:px-4">
                    <span className="text-[8px] sm:text-[10px] font-bold text-red-500/70 uppercase tracking-wider">Rejected</span>
                    <span className="text-sm sm:text-lg font-black text-red-400">{stats.rejected}</span>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all hidden sm:block"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 md:p-8 gap-4 sm:gap-6">
              {/* Controls */}
              <div className="flex gap-2 sm:gap-4 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by member name or ID..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-2 sm:py-3.5 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative shrink-0 z-10">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="h-full w-10 sm:w-48 flex items-center justify-center sm:justify-between bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl sm:px-4 sm:pl-12 sm:pr-4 text-sm focus:outline-none focus:border-yellow-500/50 hover:bg-white/10 transition-all text-white cursor-pointer"
                  >
                    <Filter className="sm:absolute sm:left-4 sm:top-1/2 sm:-translate-y-1/2 text-slate-500" size={16} />
                    <span className="hidden sm:block truncate">{currentFilterLabel}</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`hidden sm:block transition-transform text-slate-500 ${isFilterOpen ? 'rotate-180' : ''}`}>
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isFilterOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsFilterOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-[#141414] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20"
                        >
                          {filterOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setFilterState(option.value as any);
                                setIsFilterOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                filterState === option.value 
                                  ? 'bg-yellow-500/10 text-yellow-400 font-bold' 
                                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Loading Members...</p>
                  </div>
                ) : filteredRegistrations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 pb-4">
                    {filteredRegistrations.map(r => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={r.id} 
                        className={`relative overflow-hidden rounded-xl sm:rounded-2xl border p-2.5 sm:p-5 transition-all hover:-translate-y-1 hover:shadow-xl flex sm:block items-center gap-3 sm:gap-0 ${
                          r.stateSign === 1 
                            ? 'bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5' 
                            : 'bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/5'
                        }`}
                      >
                        {/* Status Indicator Line */}
                        <div className={`absolute top-0 left-0 sm:w-full sm:h-1 w-1 h-full ${
                          r.stateSign === 1 ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />

                        <div className="flex items-center sm:items-start justify-between sm:mb-4 flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                              r.stateSign === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              <User size={14} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-xs sm:text-base truncate" title={r.nameMember}>{r.nameMember}</h4>
                              <p className="text-[9px] sm:text-[11px] text-slate-500 font-mono truncate">ID: {r.idMember}</p>
                            </div>
                          </div>
                          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            r.stateSign === 1 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {r.stateSign === 1 ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>{r.stateSign === 1 ? 'Approved' : 'Rejected'}</span>
                          </div>
                        </div>

                        <div className="flex sm:grid sm:grid-cols-2 gap-2 sm:gap-3 sm:mt-4 shrink-0">
                          <div className="bg-black/40 rounded-lg sm:rounded-xl px-2 py-1.5 sm:p-3 border border-white/5 flex flex-col justify-center">
                            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400 mb-0.5 sm:mb-1">
                              <Clock size={10} className="text-blue-400 sm:w-3.5 sm:h-3.5" />
                              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Speed</span>
                            </div>
                            <div className="text-white font-black text-[10px] sm:text-lg truncate">
                              {r.speedSign?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            </div>
                          </div>
                          <div className="bg-black/40 rounded-lg sm:rounded-xl px-2 py-1.5 sm:p-3 border border-white/5 flex flex-col justify-center">
                            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400 mb-0.5 sm:mb-1">
                              <Zap size={10} className="text-yellow-500 sm:w-3.5 sm:h-3.5" />
                              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Target</span>
                            </div>
                            <div className="text-white font-black text-[10px] sm:text-lg truncate">
                              {r.targetPow?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3 sm:gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <AlertCircle className="text-slate-600 sm:w-10 sm:h-10" size={32} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1">No members found</h3>
                      <p className="text-slate-500 text-xs sm:text-sm">Try adjusting your search or filter criteria.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/5 flex justify-between items-center shrink-0 bg-[#0a0a0a]">
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                Showing {filteredRegistrations.length} of {registrations.length} members
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
