import React, { useState } from 'react';
import { AllianceMember } from '../types';
import { Trophy, Zap, Skull, Heart, X, Swords } from 'lucide-react';
import { formatCompactNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface RankingViewProps {
  members: AllianceMember[];
}

const RankingModal = ({ isOpen, onClose, title, icon: Icon, members, valueKey, valueLabel, colorClass }: any) => {
  if (!isOpen) return null;
  
  const sortedMembers = [...members].sort((a, b) => Number(b[valueKey] || 0) - Number(a[valueKey] || 0));

  const getRankClasses = (index: number) => {
    if (index === 0) return 'border-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    if (index === 1) return 'border-yellow-500 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
    if (index === 2) return 'border-green-500 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]';
    return 'border-white/10 text-slate-400';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md frost-glass p-6 rounded-xl md:rounded-2xl border-white/10 shadow-2xl max-h-[85vh] flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6 flex-shrink-0">
          <div className={`p-2 rounded-xl bg-white/5 ${colorClass}`}>
            <Icon size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 w-12">Rank</th>
                <th className="pb-2">Member</th>
                <th className="pb-2 text-right w-16">{valueLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedMembers.map((member, index) => {
                const rankClasses = getRankClasses(index);
                return (
                  <tr key={member.id} className="text-sm">
                    <td className="py-3 pr-2">
                      <span className={`font-mono font-bold px-2 py-1 rounded-lg border text-xs ${rankClasses}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className={`py-3 font-medium truncate max-w-[120px] min-w-0 ${index < 3 ? rankClasses.split(' ').slice(1).join(' ') : 'text-slate-200'}`}>
                      {member.nameMember}
                    </td>
                    <td className="py-3 text-right font-mono text-white text-xs">
                      {formatCompactNumber(Number(member[valueKey] || 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export const RankingTable = ({ title, icon: Icon, members, valueKey, valueLabel, colorClass, limit, variant = 'table', badgeClass }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sortedMembers = [...members].sort((a, b) => Number(b[valueKey] || 0) - Number(a[valueKey] || 0));
  const displayMembers = limit ? sortedMembers.slice(0, limit) : sortedMembers;

  const getRankClasses = (index: number) => {
    if (index === 0) return 'border-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    if (index === 1) return 'border-yellow-500 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
    if (index === 2) return 'border-green-500 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]';
    return 'border-white/10 text-slate-400';
  };

  return (
    <>
      <div 
        className="frost-glass p-3 md:p-4 rounded-xl md:rounded-2xl border-frost-500/10 flex flex-col h-auto md:h-full overflow-hidden min-w-0 cursor-pointer md:cursor-default hover:bg-white/[0.02] transition-colors"
        onClick={() => {
          if (window.innerWidth < 768) {
            setIsModalOpen(true);
          }
        }}
      >
        <div className="flex items-center gap-2 mb-2 md:mb-2 flex-shrink-0">
          <div className={`p-1.5 rounded-xl bg-white/5 ${colorClass}`}>
            <Icon size={16} />
          </div>
          <h3 className="text-sm md:text-base font-bold text-white">{title}</h3>
        </div>
        
        <div className={`${variant === 'card' ? 'flex' : 'hidden md:block'} flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide ${variant === 'card' ? 'flex-col justify-around space-y-1.5' : ''}`}>
          {variant === 'table' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="pb-2 w-12">Rank</th>
                  <th className="pb-2">Member</th>
                  <th className="pb-2 text-right w-16">{valueLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayMembers.map((member: any, index: number) => {
                  const rankClasses = getRankClasses(index);
                  return (
                    <tr key={member.id} className="text-xs">
                      <td className="py-2.5 pr-2">
                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded-lg border text-[10px] ${rankClasses}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className={`py-2.5 font-medium truncate max-w-[80px] min-w-0 ${index < 3 ? rankClasses.split(' ').slice(1).join(' ') : 'text-slate-200'}`}>
                        {member.nameMember}
                      </td>
                      <td className="py-2.5 text-right font-mono text-white text-[11px]">
                        {formatCompactNumber(Number(member[valueKey] || 0))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            displayMembers.map((member: any, index: number) => (
              <div key={member.id} className="flex items-center justify-between p-1 md:p-1.5 rounded-lg md:rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className={`text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ${index === 0 ? (badgeClass || 'bg-white text-black') : 'bg-white/10 text-slate-400'}`}>
                    {index + 1}
                  </span>
                  <span className="text-[10px] md:text-xs font-medium text-slate-200 truncate max-w-[100px]">{member.nameMember}</span>
                </div>
                <span className={`text-[10px] md:text-xs font-mono font-bold ${colorClass}`}>{formatCompactNumber(Number(member[valueKey] || 0))}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <RankingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={title}
            icon={Icon}
            members={members}
            valueKey={valueKey}
            valueLabel={valueLabel}
            colorClass={colorClass}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export const RankingView = ({ members }: RankingViewProps) => {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <RankingTable title="Top Power" icon={Trophy} members={members} valueKey="topPower" valueLabel="Power" colorClass="text-amber-400" />
      <RankingTable title="Top Total Dead" icon={Skull} members={members} valueKey="totalDead" valueLabel="Dead" colorClass="text-red-400" />
      <RankingTable title="Top Total Healed" icon={Heart} members={members} valueKey="totalHealed" valueLabel="Healed" colorClass="text-emerald-400" />
      <RankingTable title="Top Merits" icon={Trophy} members={members} valueKey="totalMertit" valueLabel="Merits" colorClass="text-amber-300" />
      <RankingTable title="Top Kills" icon={Swords} members={members} valueKey="totalKill" valueLabel="Kills" colorClass="text-blue-400" />
    </div>
  );
};
