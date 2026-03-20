import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Info, BookOpen, ChevronRight } from 'lucide-react';

interface AllianceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeadership: () => void;
  onOpenAllianceInfo: () => void;
  onOpenHistory: () => void;
}

export const AllianceManagerModal = ({ isOpen, onClose, onOpenLeadership, onOpenAllianceInfo, onOpenHistory }: AllianceManagerModalProps) => {
  const options = [
    { title: 'Update Leadership Info', icon: Shield, color: 'text-red-400', onClick: onOpenLeadership },
    { title: 'Update Alliance Info', icon: Info, color: 'text-emerald-400', onClick: onOpenAllianceInfo },
    { title: 'Update History Alliance', icon: BookOpen, color: 'text-purple-400', onClick: onOpenHistory },
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
              <h2 className="text-xl font-bold text-white">Alliance Manager</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    option.onClick();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-frost-500/30 hover:bg-white/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 ${option.color}`}>
                      <option.icon size={20} />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-frost-300 transition-colors">{option.title}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-frost-500 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
