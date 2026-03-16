import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, User, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { MemberViolation } from '../types';

export const MemberViolationView = () => {
  const [violations, setViolations] = useState<MemberViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchViolations();
  }, []);

  async function fetchViolations() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('MemberViolation')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setViolations(data || []);
    } catch (err) {
      console.error('Error fetching violations:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredViolations = violations.filter(v => 
    v.nameMembber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.idMember.toString().includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <div className="flex gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search violations by name or ID..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400">
            <AlertTriangle size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{violations.length} Records</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 frost-glass rounded-[32px] border-white/5 overflow-hidden flex flex-col">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">ID Member</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">State</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-500 font-medium">Loading violation records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredViolations.length > 0 ? (
                filteredViolations.map((violation, index) => (
                  <motion.tr 
                    key={violation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-red-400 transition-colors">
                          <User size={20} />
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                          {violation.nameMembber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                        {violation.idMember}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                        {violation.stateMember}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-400 italic max-w-md line-clamp-2">
                        {violation.describeMember}
                      </p>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <AlertTriangle size={48} className="text-slate-600" />
                      <p className="text-slate-400 text-sm">No violation records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
