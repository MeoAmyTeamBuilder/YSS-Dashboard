import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Search, AlertTriangle, User, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { MemberViolation, AllianceMember, User as UserType } from '../types';
import { toast } from 'react-hot-toast';
import { logUpdateAction } from '../lib/updates';

interface ManageViolationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInUser: UserType | null;
}

export const ManageViolationsModal = ({ isOpen, onClose, loggedInUser }: ManageViolationsModalProps) => {
  const [violations, setViolations] = useState<MemberViolation[]>([]);
  const [members, setMembers] = useState<AllianceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // Form state
  const [selectedMember, setSelectedMember] = useState<AllianceMember | null>(null);
  const [stateMember, setStateMember] = useState('');
  const [describeMember, setDescribeMember] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  async function fetchData() {
    try {
      setLoading(true);
      const [violationsRes, membersRes] = await Promise.all([
        supabase.from('MemberViolation').select('*').order('id', { ascending: false }),
        supabase.from('Member').select('*').order('nameMember', { ascending: true })
      ]);

      if (violationsRes.error) throw violationsRes.error;
      if (membersRes.error) throw membersRes.error;

      setViolations(violationsRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!selectedMember || !stateMember || !describeMember) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const newViolation = {
        idMember: selectedMember.idMember,
        nameMembber: selectedMember.nameMember,
        stateMember,
        describeMember
      };

      const { error } = await supabase.from('MemberViolation').insert([newViolation]);
      if (error) throw error;

      toast.success('Violation added successfully');
      setIsAdding(false);
      resetForm();
      fetchData();
      
      if (loggedInUser) {
        logUpdateAction(loggedInUser.nameUser, `Added violation for ${selectedMember.nameMember}`);
      }
    } catch (err) {
      console.error('Error adding violation:', err);
      toast.error('Failed to add violation');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!stateMember || !describeMember) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('MemberViolation')
        .update({ stateMember, describeMember })
        .eq('id', id);

      if (error) throw error;

      toast.success('Violation updated successfully');
      setEditingId(null);
      resetForm();
      fetchData();

      if (loggedInUser) {
        logUpdateAction(loggedInUser.nameUser, `Updated violation ID ${id}`);
      }
    } catch (err) {
      console.error('Error updating violation:', err);
      toast.error('Failed to update violation');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from('MemberViolation').delete().eq('id', id);
      if (error) throw error;

      toast.success('Violation deleted successfully');
      fetchData();

      if (loggedInUser) {
        logUpdateAction(loggedInUser.nameUser, `Deleted violation ID ${id}`);
      }
    } catch (err) {
      console.error('Error deleting violation:', err);
      toast.error('Failed to delete violation');
    }
  };

  const resetForm = () => {
    setSelectedMember(null);
    setStateMember('');
    setDescribeMember('');
    setMemberSearchTerm('');
  };

  const filteredMembers = members.filter(m => 
    m.nameMember.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    m.idMember.includes(memberSearchTerm)
  ).slice(0, 5);

  const filteredViolations = violations.filter(v => 
    v.nameMembber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.idMember.toString().includes(searchTerm)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
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
            className="relative w-full max-w-4xl max-h-[95vh] bg-[#0a0a0a] border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Manage Violations</h2>
                  <p className="text-xs text-slate-400">Add, edit, or remove member violations.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Add/Edit Form */}
              {(isAdding || editingId !== null) ? (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {editingId ? 'Edit Violation' : 'Add New Violation'}
                    </h3>
                    <button 
                      onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {!editingId && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Member</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search member..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-frost-500/50 transition-all"
                          value={memberSearchTerm}
                          onChange={(e) => setMemberSearchTerm(e.target.value)}
                        />
                      </div>
                      {memberSearchTerm && !selectedMember && (
                        <div className="mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                          {filteredMembers.map(m => (
                            <button
                              key={m.idMember}
                              onClick={() => { setSelectedMember(m); setMemberSearchTerm(m.nameMember); }}
                              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 transition-colors flex items-center justify-between"
                            >
                              <span>{m.nameMember}</span>
                              <span className="text-[10px] text-slate-500">ID: {m.idMember}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedMember && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-frost-500/10 border border-frost-500/20">
                          <div className="flex items-center gap-3">
                            <User size={16} className="text-frost-400" />
                            <span className="text-sm font-bold text-white">{selectedMember.nameMember}</span>
                          </div>
                          <button onClick={() => setSelectedMember(null)} className="text-frost-400 hover:text-white">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Violation State</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Warning, Serious, Kick"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-frost-500/50 transition-all"
                        value={stateMember}
                        onChange={(e) => setStateMember(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                      <input 
                        type="text" 
                        placeholder="Describe the violation..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-frost-500/50 transition-all"
                        value={describeMember}
                        onChange={(e) => setDescribeMember(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
                      className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all text-sm font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                      className="px-6 py-2 rounded-xl bg-frost-500 hover:bg-frost-600 text-white transition-all text-sm font-bold flex items-center gap-2"
                    >
                      <Save size={16} />
                      {editingId ? 'Update Violation' : 'Save Violation'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-frost-500/30 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-3 text-slate-400 hover:text-frost-400"
                >
                  <Plus size={24} />
                  <span className="font-bold">Add New Violation Record</span>
                </button>
              )}

              {/* Search & List */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search violations..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {loading ? (
                    <div className="py-20 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
                    </div>
                  ) : filteredViolations.length > 0 ? (
                    filteredViolations.map(v => (
                      <div key={v.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden group hover:border-white/20 transition-all">
                        <div 
                          className="p-3 flex items-center justify-between cursor-pointer"
                          onClick={() => {
                            const el = document.getElementById(`violation-${v.id}`);
                            if (el) el.classList.toggle('hidden');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-red-400 transition-colors">
                              <User size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">{v.nameMembber}</h4>
                              <p className="text-[10px] text-slate-500 font-mono">ID: {v.idMember}</p>
                            </div>
                          </div>
                          <div className="text-red-400 text-[10px] font-bold uppercase bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                            {v.stateMember}
                          </div>
                        </div>
                        <div id={`violation-${v.id}`} className="hidden px-3 pb-3 pt-1 border-t border-white/5 bg-white/[0.02]">
                          <p className="text-xs text-slate-300 mb-3">{v.describeMember}</p>
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingId(v.id!);
                                setStateMember(v.stateMember);
                                setDescribeMember(v.describeMember);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-frost-400 hover:bg-frost-500/10 transition-all text-xs font-bold"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(v.id!)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-slate-500 text-sm italic">
                      No violation records found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex justify-end shrink-0 bg-[#0a0a0a]">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
