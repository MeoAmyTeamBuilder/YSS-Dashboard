import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Search, User, Zap, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AllianceMember } from '../types';
import { toast } from 'react-hot-toast';

interface SignGHModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignGHModal = ({ isOpen, onClose }: SignGHModalProps) => {
  const [members, setMembers] = useState<AllianceMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<AllianceMember | null>(null);
  const [speedSign, setSpeedSign] = useState('');
  const [targetPow, setTargetPow] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  async function fetchMembers() {
    try {
      const { data, error } = await supabase
        .from('Member')
        .select('*')
        .order('nameMember', { ascending: true });
      if (error) throw error;
      if (data) setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  }

  const filteredMembers = members.filter(m => 
    m.nameMember.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.idMember.includes(searchTerm)
  ).slice(0, 5);

  const handleSubmit = async () => {
    if (!selectedMember || !speedSign || !targetPow) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('SignGH')
        .insert([{
          idMember: selectedMember.idMember,
          nameMember: selectedMember.nameMember,
          speedSign: `${speedSign} days`,
          targetPow,
          stateSign: 0
        }]);

      if (error) throw error;

      toast.success('Registration submitted successfully!');
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error submitting registration:', err);
      toast.error('Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMember(null);
    setSearchTerm('');
    setSpeedSign('');
    setTargetPow('');
  };

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
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-transparent">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                  <Zap size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Sign top GH</h2>
                  <p className="text-[10px] sm:text-xs text-slate-400">Register for the Great Hall ranking.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Member Selection */}
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Search your name or ID</label>
                {!selectedMember ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search your name or ID..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm sm:text-base focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-xs placeholder:text-slate-600"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl">
                        {filteredMembers.map(m => (
                          <button
                            key={m.idMember}
                            onClick={() => setSelectedMember(m)}
                            className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5 transition-colors flex items-center justify-between border-b border-white/5 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <User size={14} className="text-slate-500" />
                              <span className="font-bold">{m.nameMember}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {m.idMember}</span>
                          </button>
                        ))}
                        {filteredMembers.length === 0 && (
                          <div className="px-4 py-3 text-xs text-slate-500 italic">No members found</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{selectedMember.nameMember}</p>
                        <p className="text-[10px] text-blue-500/70 font-mono">ID: {selectedMember.idMember}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedMember(null)}
                      className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Speed Sign */}
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Speed Sign (Days)</label>
                <div className="relative group">
                  <Clock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-blue-500/50 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="number" 
                    placeholder="Enter number..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-12 sm:pr-16 text-base sm:text-lg font-bold text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-sm placeholder:text-slate-600"
                    value={speedSign}
                    onChange={(e) => setSpeedSign(e.target.value)}
                  />
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-black text-blue-500/50 uppercase">days</div>
                </div>
              </div>

              {/* Target Power */}
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Target Power</label>
                <div className="relative group">
                  <Zap className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-blue-500/50 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="E.g. 80,000,000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-base sm:text-lg font-bold text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-sm placeholder:text-slate-600"
                    value={targetPow}
                    onChange={(e) => setTargetPow(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 sm:py-4 bg-blue-400 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base tracking-widest rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-4 border-b-4 border-blue-700"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Submit registration
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
