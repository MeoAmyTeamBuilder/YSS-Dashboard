import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: string;
    isUp: boolean;
  };
}

export const StatCard = ({ label, value, icon: Icon, trend }: StatCardProps) => {
  return (
    <div className="frost-glass p-3 md:p-4 rounded-xl md:rounded-2xl relative overflow-hidden group hover:border-frost-500/30 transition-all duration-300 flex flex-col justify-center h-[70px] md:h-[100px]">
      <div className="absolute -right-2 -top-2 text-frost-500/5 group-hover:text-frost-500/10 transition-colors hidden md:block">
        <Icon size={80} />
      </div>
      
      <div className="flex items-center gap-2 md:gap-3 mb-1">
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-frost-500/10 flex items-center justify-center text-frost-400 border border-frost-500/20">
          <Icon size={14} className="md:w-4 md:h-4" />
        </div>
        <span className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      </div>

      <div className="flex items-end justify-between">
        <div className="text-xl md:text-2xl font-bold text-white frost-text-glow">{value}</div>
        {trend && (
          <div className={`text-[8px] md:text-[9px] font-semibold px-1.5 md:px-2 py-0.5 rounded-md md:rounded-lg ${
            trend.isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend.isUp ? '+' : '-'}{trend.value}
          </div>
        )}
      </div>
    </div>
  );
};
