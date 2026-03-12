import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, User, Shield, Crown, Check, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { AllianceMember, User as UserType } from '../types';
import { checkPermission } from '../lib/permissions';

interface UpdateLeadershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadershipUpdated: () => void;
  loggedInUser: UserType | null;
}

export const UpdateLeadershipModal = ({ isOpen, onClose, onLeadershipUpdated, loggedInUser }: UpdateLeadershipModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<AllianceMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<AllianceMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [existingRole, setExistingRole] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedMember(null);
      setSelectedRole('');
      setExistingRole(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchExistingRole = async () => {
      if (!selectedMember) {
        setExistingRole(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('Leader')
          .select('roleMember')
          .eq('idMember', selectedMember.idMember)
          .single();
        
        if (data) {
          setExistingRole(data.roleMember);
          setSelectedRole(data.roleMember);
        } else {
          setExistingRole(null);
          setSelectedRole('');
        }
      } catch (error) {
        setExistingRole(null);
        setSelectedRole('');
      }
    };
    fetchExistingRole();
  }, [selectedMember]);

  useEffect(() => {
    const searchMembers = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('Member')
          .select('*')
          .or(`nameMember.ilike.%${searchTerm}%,idMember.ilike.%${searchTerm}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching members:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSave = async () => {
    if (!checkPermission(loggedInUser, ['1', '2'])) {
      toast.error('You do not have permission to update leadership');
      return;
    }
    if (!selectedMember || !selectedRole) return;

    setIsSaving(true);
    try {
      if (existingRole) {
        // Update existing
        const { error } = await supabase
          .from('Leader')
          .update({ roleMember: selectedRole, nameMember: selectedMember.nameMember })
          .eq('idMember', selectedMember.idMember);
        if (error) throw error;
        toast.success(`Updated role for ${selectedMember.nameMember}`);
      } else {
        // Insert new
        const { error } = await supabase
          .from('Leader')
          .insert({
            idMember: selectedMember.idMember,
            nameMember: selectedMember.nameMember,
            roleMember: selectedRole
          });
        if (error) throw error;
        toast.success(`Assigned role to ${selectedMember.nameMember}`);
      }

      onLeadershipUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving leadership info:', error);
      toast.error('Failed to save leadership info. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('Leader')
        .delete()
        .eq('idMember', selectedMember.idMember);
      
      if (error) throw error;
      
      toast.success(`Removed role from ${selectedMember.nameMember}`);
      onLeadershipUpdated();
      onClose();
    } catch (error) {
      console.error('Error deleting leadership info:', error);
      toast.error('Failed to remove role. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const roles = [
    { id: '1', name: 'Member', icon: User, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { id: '2', name: 'Leader', icon: Shield, color: 'text-frost-400', bg: 'bg-frost-500/10', border: 'border-frost-500/20' },
    { id: '3', name: 'King', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
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
            className="relative w-full max-w-lg max-h-[90vh] sm:h-auto bg-[#0a0a0a] border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Update Leadership Info</h2>
                  <p className="text-xs text-slate-400 mt-1">Assign roles to alliance members.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search by ID or Name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedMember(null);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-frost-500/50 transition-colors"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="w-4 h-4 border-2 border-frost-500/30 border-t-frost-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {!selectedMember && searchResults.length > 0 && (
                <div className="mb-6 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Select Member</p>
                  {searchResults.map((member) => (
                    <button
                      key={member.idMember}
                      onClick={() => setSelectedMember(member)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-frost-500/30 hover:bg-white/10 transition-all text-left"
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{member.nameMember}</p>
                        <p className="text-[10px] text-slate-500">ID: {member.idMember}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Member & Role Selection */}
              {selectedMember && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-2xl bg-frost-500/10 border border-frost-500/20 flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-frost-400 uppercase tracking-wider mb-1">Selected Member</p>
                      <p className="text-base font-bold text-white">{selectedMember.nameMember}</p>
                      <p className="text-[11px] text-slate-400">ID: {selectedMember.idMember}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedMember(null)}
                      className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Assign Role</p>
                    <div className="grid grid-cols-3 gap-3">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                            selectedRole === role.id 
                              ? `${role.bg} ${role.border} ring-1 ring-inset ring-${role.color.replace('text-', '')}/50` 
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          <role.icon 
                            size={24} 
                            className={`mb-2 ${selectedRole === role.id ? role.color : 'text-slate-500'}`} 
                          />
                          <span className={`text-xs font-bold ${selectedRole === role.id ? 'text-white' : 'text-slate-400'}`}>
                            {role.name}
                          </span>
                          {selectedRole === role.id && (
                            <div className={`absolute top-2 right-2 ${role.color}`}>
                              <Check size={14} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 flex justify-between gap-3">
              <div>
                {existingRole && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting || isSaving}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Remove Role
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedMember || !selectedRole || isSaving || isDeleting}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-frost-500 hover:bg-frost-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
