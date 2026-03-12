import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AllianceMember, CheckRecord } from '../types';
import { Search, Database, Trophy, Zap, Skull, Users, ChevronDown, ArrowDownUp, ArrowDown, ArrowUp, Hash, SortAsc, SortDesc, X, MoreVertical } from 'lucide-react';
import { formatCompactNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SeasonViewProps {
  members: AllianceMember[];
  checkRecords: CheckRecord[];
  historyKingdom?: any;
}

interface JoinedRecord {
  idMember: number;
  lordId: string;
  nameMember: string;
  merits: number;
  mana: number;
  deads: number;
}

export const SeasonView = ({ members, checkRecords }: SeasonViewProps) => {
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [joinedData, setJoinedData] = useState<JoinedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'merits' | 'mana' | 'deads'>('all');
  const [sortType, setSortType] = useState<'high-low' | 'low-high' | 'id' | 'az' | 'za'>('high-low');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [selectedJoinedRecord, setSelectedJoinedRecord] = useState<JoinedRecord | null>(null);

  const selectedRecord = checkRecords.find(r => r.id === selectedRecordId);

  useEffect(() => {
    if (checkRecords.length > 0) {
      if (selectedRecordId === null || !checkRecords.find(r => r.id === selectedRecordId)) {
        setSelectedRecordId(checkRecords[0].id || null);
      }
    } else {
      setSelectedRecordId(null);
      setJoinedData([]);
    }
  }, [checkRecords]);

  useEffect(() => {
    if (selectedRecordId) {
      fetchJoinedData(selectedRecordId);
    }
  }, [selectedRecordId]);

  const fetchJoinedData = async (recordId: number) => {
    try {
      setLoading(true);
      const [meritsRes, manaRes, deadsRes] = await Promise.all([
        supabase.from('CheckMertit').select('*').eq('idCheckRecord', recordId),
        supabase.from('CheckMana').select('*').eq('idCheckRecord', recordId),
        supabase.from('CheckDead').select('*').eq('idCheckRecord', recordId)
      ]);

      if (meritsRes.error) throw meritsRes.error;
      if (manaRes.error) throw manaRes.error;
      if (deadsRes.error) throw deadsRes.error;

      const dataMap = new Map<number, JoinedRecord>();
      members.forEach(m => {
        if (m.id) {
          dataMap.set(m.id, {
            idMember: m.id,
            lordId: m.idMember,
            nameMember: m.nameMember,
            merits: 0,
            mana: 0,
            deads: 0
          });
        }
      });

      meritsRes.data.forEach(item => {
        const record = dataMap.get(item.idMember);
        if (record) record.merits = item.mertits;
      });

      manaRes.data.forEach(item => {
        const record = dataMap.get(item.idMember);
        if (record) record.mana = item.deads;
      });

      deadsRes.data.forEach(item => {
        const record = dataMap.get(item.idMember);
        if (record) record.deads = item.deads;
      });

      const filtered = Array.from(dataMap.values()).filter(r => 
        r.merits !== 0 || r.mana !== 0 || r.deads !== 0
      );

      setJoinedData(filtered);
    } catch (error) {
      console.error('Error fetching joined data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedData = joinedData
    .filter(item => 
      item.nameMember.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lordId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (filterType === 'all') return 0;
      const valA = a[filterType];
      const valB = b[filterType];
      
      switch (sortType) {
        case 'high-low': return valB - valA;
        case 'low-high': return valA - valB;
        case 'id': return parseInt(a.lordId) - parseInt(b.lordId);
        case 'az': return a.nameMember.localeCompare(b.nameMember);
        case 'za': return b.nameMember.localeCompare(a.nameMember);
        default: return 0;
      }
    });

  const getSortIcon = () => {
    switch (sortType) {
      case 'high-low': return <ArrowDown size={14} />;
      case 'low-high': return <ArrowUp size={14} />;
      case 'id': return <Hash size={14} />;
      case 'az': return <SortAsc size={14} />;
      case 'za': return <SortDesc size={14} />;
      default: return <ArrowDownUp size={14} />;
    }
  };

  const colSpan = filterType === 'all' ? 4 : 2;

  return (
    <div className="h-full flex flex-col gap-6 scrollbar-hide">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-frost-500/50 transition-all flex items-center justify-between hover:bg-white/10 group"
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-frost-400">
                  <Database size={18} />
                </div>
                <span className="truncate mr-2">
                  {selectedRecord 
                    ? `${selectedRecord.nameRecord} — ${new Date(selectedRecord.dateRecord).toLocaleDateString('vi-VN')}`
                    : 'Select Record'}
                </span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto overflow-x-hidden scrollbar-hide"
                    >
                      <div className="p-1">
                        {checkRecords.map(record => (
                          <button
                            key={record.id}
                            onClick={() => {
                              setSelectedRecordId(record.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all flex flex-col gap-0.5 ${selectedRecordId === record.id ? 'bg-frost-500/20 text-frost-400' : 'text-slate-300 hover:bg-white/5'}`}
                          >
                            <span className="font-bold">{record.nameRecord}</span>
                            <span className="text-[10px] opacity-60 font-mono">
                              {new Date(record.dateRecord).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search member name or ID..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-frost-500/50 transition-all hover:bg-white/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {(['merits', 'mana', 'deads'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(filterType === type ? 'all' : type)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filterType === type ? 'bg-frost-500 border-frost-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            {filterType !== 'all' && (
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-frost-500/20 border border-frost-500/30 text-frost-300 text-xs font-bold hover:bg-frost-500/30 transition-all"
                >
                  {getSortIcon()}
                  Conditional filtering
                </button>
                <AnimatePresence>
                  {isSortDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 w-40"
                      >
                        {[
                          { id: 'high-low', label: 'High to Low', icon: <ArrowDown size={14} /> },
                          { id: 'low-high', label: 'Low to High', icon: <ArrowUp size={14} /> },
                          { id: 'id', label: 'By ID', icon: <Hash size={14} /> },
                          { id: 'az', label: 'A to Z', icon: <SortAsc size={14} /> },
                          { id: 'za', label: 'Z to A', icon: <SortDesc size={14} /> },
                        ].map(option => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSortType(option.id as any);
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 ${sortType === option.id ? 'bg-frost-500/20 text-frost-400' : 'text-slate-300 hover:bg-white/5'}`}
                          >
                            {option.icon}
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 frost-glass rounded-2xl md:rounded-[24px] border-white/5 overflow-hidden flex flex-col shadow-2xl">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Member Information</th>
                {(filterType === 'all' || filterType === 'merits') && (
                  <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Trophy size={14} className="text-amber-400" />
                      Merits
                    </div>
                  </th>
                )}
                {(filterType === 'all' || filterType === 'mana') && (
                  <th className={`p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right ${filterType === 'all' ? 'hidden md:table-cell' : ''}`}>
                    <div className="flex items-center justify-end gap-2">
                      <Zap size={14} className="text-frost-400" />
                      Mana Used
                    </div>
                  </th>
                )}
                {(filterType === 'all' || filterType === 'deads') && (
                  <th className={`p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right ${filterType === 'all' ? 'hidden md:table-cell' : ''}`}>
                    <div className="flex items-center justify-end gap-2">
                      <Skull size={14} className="text-red-400" />
                      Units Dead
                    </div>
                  </th>
                )}
                {filterType === 'all' && (
                  <th className="md:hidden p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Details</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-2 border-frost-500/20 rounded-full" />
                        <div className="absolute inset-0 border-2 border-frost-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-sm font-medium text-slate-400 animate-pulse">Synchronizing record data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Database size={48} className="text-slate-600" />
                      <p className="text-sm text-slate-400 font-medium">No activity data found for this period.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map((item) => (
                  <tr 
                    key={item.idMember} 
                    className="hover:bg-white/[0.03] transition-all group cursor-pointer md:cursor-default"
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setSelectedJoinedRecord(item);
                      }
                    }}
                  >
                    <td className="p-3 md:p-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-frost-400 group-hover:scale-110 transition-transform">
                          <Users size={16} className="md:w-5 md:h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs md:text-base font-bold text-white group-hover:text-frost-400 transition-colors">
                            {item.nameMember}
                          </span>
                          <span className="text-[9px] md:text-[10px] text-slate-500 font-mono tracking-wider">
                            ID: {item.lordId}
                          </span>
                        </div>
                      </div>
                    </td>
                    {(filterType === 'all' || filterType === 'merits') && (
                      <td className="p-3 md:p-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs md:text-base font-mono font-black text-amber-400 text-glow">
                            {formatCompactNumber(item.merits)}
                          </span>
                          <div className="w-12 h-1 bg-amber-400/10 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (item.merits / 1000000) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                    )}
                    {(filterType === 'all' || filterType === 'mana') && (
                      <td className={`p-3 md:p-6 text-right ${filterType === 'all' ? 'hidden md:table-cell' : ''}`}>
                        <div className="flex flex-col items-end">
                          <span className="text-xs md:text-base font-mono font-black text-frost-400 text-glow">
                            {formatCompactNumber(item.mana)}
                          </span>
                          <div className="w-12 h-1 bg-frost-400/10 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-frost-400" style={{ width: `${Math.min(100, (item.mana / 10000000) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                    )}
                    {(filterType === 'all' || filterType === 'deads') && (
                      <td className={`p-3 md:p-6 text-right ${filterType === 'all' ? 'hidden md:table-cell' : ''}`}>
                        <div className="flex flex-col items-end">
                          <span className="text-xs md:text-base font-mono font-black text-red-400 text-glow">
                            {formatCompactNumber(item.deads)}
                          </span>
                          <div className="w-12 h-1 bg-red-400/10 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-red-400" style={{ width: `${Math.min(100, (item.deads / 500000) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                    )}
                    {filterType === 'all' && (
                      <td className="md:hidden p-3 text-right">
                        <button className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedJoinedRecord && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:p-4 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJoinedRecord(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full bg-[#0a0a0a] border border-white/10 rounded-t-2xl md:rounded-t-[24px] p-6 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-frost-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedJoinedRecord.nameMember}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {selectedJoinedRecord.lordId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJoinedRecord(null)}
                  className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Trophy size={16} className="text-amber-400" />
                    <span className="text-xs font-medium text-slate-300">Merits</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    {formatCompactNumber(selectedJoinedRecord.merits || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-frost-400" />
                    <span className="text-xs font-medium text-slate-300">Mana Used</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-frost-400">
                    {formatCompactNumber(selectedJoinedRecord.mana || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Skull size={16} className="text-red-400" />
                    <span className="text-xs font-medium text-slate-300">Units Dead</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-red-400">
                    {formatCompactNumber(selectedJoinedRecord.deads || 0)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
