import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Loader2, Plane, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DiCuMember } from '../types';

export const MigrationView = () => {
  const [members, setMembers] = useState<DiCuMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('DiCuMember')
        .select('*')
        .order('toppower', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching migrated members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.namemember.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.idmember.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Plane size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Migration Members List</h2>
            <p className="text-xs text-slate-400 mt-1">List of members scheduled for migration</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search migrated members..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-hide">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="text-amber-500 animate-spin" />
            <p className="text-slate-400">Loading migration list...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <Users className="text-slate-500" size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No members found</h3>
            <p className="text-slate-400 max-w-md">No members have been added to the migration list yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <motion.div
                key={member.idmember}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{member.namemember}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {member.idmember}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Zap size={14} />
                    <span className="text-sm font-bold font-mono">{(member.toppower || 0).toLocaleString()}</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{member.totalkill || '0'} Kills</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-sm text-slate-400">
            Total Migrated: <span className="font-bold text-white">{filteredMembers.length}</span> members
          </span>
        </div>
        <p className="text-xs text-slate-500 italic">Data synced with Supabase DiCuMember table</p>
      </div>
    </div>
  );
};
