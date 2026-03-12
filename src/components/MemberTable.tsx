import React, { useState } from 'react';
import { AllianceMember } from '../types';
import { Users, MoreVertical, Swords, Crown, User, X, Shield, Zap, Skull, Heart, Trophy } from 'lucide-react';
import { formatCompactNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MemberTableProps {
  members: AllianceMember[];
}

const RoleBadge = ({ role }: { role: string }) => {
  const getRoleInfo = (r: string) => {
    switch (r) {
      case '2': return { label: 'Team Leader', style: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10', icon: <Swords size={10} /> };
      case '3': return { label: 'King', style: 'border-amber-500/50 text-amber-400 bg-amber-500/10', icon: <Crown size={10} /> };
      case '1': return { label: 'Member', style: 'border-slate-500/30 text-slate-400 bg-slate-500/20', icon: <User size={10} /> };
      default: return { label: r, style: 'border-slate-500/30 text-slate-400 bg-slate-500/20', icon: <User size={10} /> };
    }
  };

  const { label, style, icon } = getRoleInfo(role);

  return (
    <span className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium border ${style}`}>
      {icon}
      {label}
    </span>
  );
};

export const MemberTable = ({ members }: MemberTableProps) => {
  const [selectedMember, setSelectedMember] = useState<AllianceMember | null>(null);

  return (
    <>
      <div className="frost-glass rounded-lg md:rounded-xl border-white/5 overflow-hidden flex flex-col h-full min-h-0 shadow-2xl">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Member Information</th>
                <th className="hidden md:table-cell p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Role</th>
                <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Power</th>
                <th className="hidden md:table-cell p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Mana Used</th>
                <th className="hidden md:table-cell p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Units Dead</th>
                <th className="hidden md:table-cell p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Units Healed</th>
                <th className="hidden md:table-cell p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Merits</th>
                <th className="hidden md:table-cell p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Kills</th>
                <th className="md:hidden p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => (
                <tr 
                  key={member.id} 
                  className="hover:bg-white/[0.03] transition-all group cursor-pointer md:cursor-default"
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setSelectedMember(member);
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
                          {member.nameMember}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-slate-500 font-mono tracking-wider">
                          ID: {member.idMember}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell p-3 md:p-6">
                    <RoleBadge role={member.roleMember || '1'} />
                  </td>
                  <td className="p-3 md:p-6 text-right">
                    <span className="text-xs md:text-base font-mono font-black text-frost-300 text-glow">
                      {formatCompactNumber(member.topPower || 0)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-3 md:p-6 text-right">
                    <span className="text-xs md:text-base font-mono font-black text-slate-400 text-glow">
                      {formatCompactNumber(member.manaUsed || 0)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-3 md:p-6 text-right">
                    <span className="text-xs md:text-base font-mono font-black text-red-400 text-glow">
                      {formatCompactNumber(member.totalDead || 0)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-3 md:p-6 text-right">
                    <span className="text-xs md:text-base font-mono font-black text-emerald-400 text-glow">
                      {formatCompactNumber(member.totalHealed || 0)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-3 md:p-6 text-right">
                    <span className="text-xs md:text-base font-mono font-black text-amber-400 text-glow">
                      {formatCompactNumber(Number(member.totalMertit || 0))}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-3 md:p-6 text-right">
                    <span className="text-xs md:text-base font-mono font-black text-blue-400 text-glow">
                      {formatCompactNumber(Number(member.totalKill || 0))}
                    </span>
                  </td>
                  <td className="md:hidden p-3 text-right">
                    <button className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:p-4 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full bg-[#0a0a0a] border border-white/10 rounded-t-xl md:rounded-t-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-frost-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedMember.nameMember}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {selectedMember.idMember}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">Role</span>
                  </div>
                  <RoleBadge role={selectedMember.roleMember || '1'} />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-frost-400" />
                    <span className="text-xs font-medium text-slate-300">Power</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-frost-300">
                    {formatCompactNumber(selectedMember.topPower || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">Mana Used</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-300">
                    {formatCompactNumber(selectedMember.manaUsed || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Skull size={16} className="text-red-400" />
                    <span className="text-xs font-medium text-slate-300">Units Dead</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-red-400">
                    {formatCompactNumber(selectedMember.totalDead || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Heart size={16} className="text-emerald-400" />
                    <span className="text-xs font-medium text-slate-300">Units Healed</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {formatCompactNumber(selectedMember.totalHealed || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Trophy size={16} className="text-amber-400" />
                    <span className="text-xs font-medium text-slate-300">Merits</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    {formatCompactNumber(Number(selectedMember.totalMertit || 0))}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Swords size={16} className="text-blue-400" />
                    <span className="text-xs font-medium text-slate-300">Kills</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-blue-400">
                    {formatCompactNumber(Number(selectedMember.totalKill || 0))}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
