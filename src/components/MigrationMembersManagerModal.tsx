import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check, Users, Save, AlertCircle, Loader2, Trash2, Plane } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AllianceMember, DiCuMember } from '../types';
import { toast } from 'react-hot-toast';

interface MigrationMembersManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MigrationMembersManagerModal = ({ isOpen, onClose }: MigrationMembersManagerModalProps) => {
  const [members, setMembers] = useState<AllianceMember[]>([]);
  const [migratedMemberIds, setMigratedMemberIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersRes, migratedRes] = await Promise.all([
        supabase.from('Member').select('*').order('nameMember'),
        supabase.from('DiCuMember').select('idmember')
      ]);

      if (membersRes.error) throw membersRes.error;
      if (migratedRes.error) throw migratedRes.error;

      setMembers(membersRes.data || []);
      setMigratedMemberIds(new Set(migratedRes.data?.map(m => m.idmember) || []));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch members');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (idMember: string) => {
    if (migratedMemberIds.has(idMember)) return;
    
    const newSelection = new Set(selectedIds);
    if (newSelection.has(idMember)) {
      newSelection.delete(idMember);
    } else {
      newSelection.add(idMember);
    }
    setSelectedIds(newSelection);
  };

  const handleRemove = async (idMember: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('DiCuMember')
        .delete()
        .eq('idmember', idMember);

      if (error) throw error;

      toast.success('Member removed from migration list');
      fetchData();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMigrate = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one member');
      return;
    }

    setIsSaving(true);
    try {
      const membersToMigrate = members
        .filter(m => selectedIds.has(m.idMember))
        .map(m => ({
          idmember: m.idMember,
          namemember: m.nameMember,
          toppower: m.topPower,
          totalkill: m.totalKill || '0'
        }));

      const { error } = await supabase.from('DiCuMember').insert(membersToMigrate);
      if (error) throw error;

      toast.success(`Successfully migrated ${selectedIds.size} members`);
      setSelectedIds(new Set());
      fetchData();
    } catch (error: any) {
      console.error('Migration error:', error);
      toast.error(error.message || 'Failed to migrate members');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.nameMember.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.idMember.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-frost-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-frost-500/20 border border-frost-500/30 flex items-center justify-center text-frost-400">
                  <Plane size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Migration Members Manager</h2>
                  <p className="text-xs text-slate-400 mt-1">Select members from the main list to migrate</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-frost-500/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-hide">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 size={32} className="text-frost-500 animate-spin" />
                  <p className="text-sm text-slate-400">Loading members...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-500">No members found</p>
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isMigrated = migratedMemberIds.has(member.idMember);
                  const isSelected = selectedIds.has(member.idMember);
                  
                  return (
                    <div
                      key={member.idMember}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                        isMigrated 
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : isSelected
                            ? 'bg-frost-500/10 border-frost-500/50 cursor-pointer'
                            : 'bg-white/5 border-white/5 hover:border-white/20 cursor-pointer'
                      }`}
                      onClick={() => !isMigrated && toggleSelection(member.idMember)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isMigrated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'
                        }`}>
                          {isMigrated ? <Check size={20} /> : <Users size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{member.nameMember}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {member.idMember}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isMigrated ? (
                          <>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Migrated</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(member.idMember);
                              }}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer relative z-10"
                              title="Remove from migration list"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-frost-500 border-frost-500 text-white' : 'border-white/10'
                          }`}>
                            {isSelected && <Check size={14} />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/5 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                <span className="font-bold text-frost-400">{selectedIds.size}</span> members selected
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMigrate}
                  disabled={selectedIds.size === 0 || isSaving}
                  className="px-8 py-3 rounded-2xl bg-frost-500 hover:bg-frost-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-frost-500/20 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Migrate Selected
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
