import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Zap, Calendar, ChevronRight, Edit2, FileSpreadsheet } from 'lucide-react';

interface SeasonEventManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportSeason: () => void;
  onOpenManageRecords: () => void;
  onOpenManageSignGH: () => void;
  onOpenManageCalendar: () => void;
  exportToExcel: () => Promise<void>;
}

export const SeasonEventManagerModal = ({ 
  isOpen, 
  onClose, 
  onOpenImportSeason, 
  onOpenManageRecords,
  onOpenManageSignGH, 
  onOpenManageCalendar,
  exportToExcel
}: SeasonEventManagerModalProps) => {
  const options = [
    { 
      title: 'Import Season Data', 
      icon: Database, 
      color: 'text-amber-400', 
      onClick: onOpenImportSeason,
      secondaryAction: {
        icon: Edit2,
        label: 'Edit Records',
        onClick: onOpenManageRecords
      }
    },
    { 
      title: 'Manage Sign Top GH', 
      icon: Zap, 
      color: 'text-yellow-400', 
      onClick: onOpenManageSignGH,
      secondaryAction: {
        icon: FileSpreadsheet,
        label: 'Export Excel',
        onClick: exportToExcel
      }
    },
    { 
      title: 'Manage Calendar', 
      icon: Calendar, 
      color: 'text-blue-400', 
      onClick: onOpenManageCalendar 
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
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
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Season & Events</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-stretch gap-2">
                  <button
                    onClick={() => {
                      option.onClick();
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-frost-500/30 hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-white/5 ${option.color}`}>
                        <option.icon size={20} />
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-frost-300 transition-colors">{option.title}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-frost-500 transition-colors" />
                  </button>

                  {option.secondaryAction && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        option.secondaryAction!.onClick();
                        if (option.secondaryAction!.label !== 'Export Excel') {
                          onClose();
                        }
                      }}
                      className={`flex flex-col items-center justify-center gap-1 px-3 rounded-2xl border border-white/5 transition-all w-[88px] ${
                        option.secondaryAction.label === 'Export Excel' 
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                      }`}
                      title={option.secondaryAction.label}
                    >
                      <option.secondaryAction.icon size={18} />
                      <span className="text-[10px] font-bold text-center leading-tight">{option.secondaryAction.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
