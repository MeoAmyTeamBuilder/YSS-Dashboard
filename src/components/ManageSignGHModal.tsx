import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Trash2, Search, User, Zap, Clock, AlertCircle, Filter, RefreshCw, Edit2, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SignGH, User as UserType } from '../types';
import { toast } from 'react-hot-toast';
import { logUpdateAction } from '../lib/updates';

interface ManageSignGHModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInUser: UserType | null;
}

export const ManageSignGHModal = ({ isOpen, onClose, loggedInUser }: ManageSignGHModalProps) => {
  const [registrations, setRegistrations] = useState<SignGH[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<number | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    registration?: SignGH | null;
  }>({ isOpen: false, type: 'single', registration: null });

  useEffect(() => {
    if (isOpen) {
      fetchRegistrations();
    }
  }, [isOpen]);

  async function fetchRegistrations() {
    try {
      setLoading(true);
      console.log('Fetching registrations from SignGH table...');
      const { data, error } = await supabase
        .from('SignGH')
        .select('*');
      
      if (error) {
        console.error('Supabase error fetching SignGH:', error);
        throw error;
      }
      
      console.log('Fetched registrations:', data);
      if (data && data.length > 0) {
        console.log('Registration keys:', Object.keys(data[0]));
        // Verify if id exists
        if (data[0].id === undefined) {
          console.warn('Warning: "id" field is missing from SignGH data. Check table schema.');
        }
        // Sort manually if id might not exist or to be safe
        const sortedData = [...data].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
        setRegistrations(sortedData);
      } else if (data) {
        setRegistrations([]);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
      toast.error('Failed to load registrations. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (registration: SignGH, newState: number) => {
    const { id, idMember, nameMember } = registration;
    
    console.log(`Attempting to update SignGH id=${id}, idMember=${idMember} to stateSign=${newState}`, registration);

    try {
      let data, error;

      if (id !== undefined && id !== null) {
        // Try updating by id first
        const result = await supabase
          .from('SignGH')
          .update({ stateSign: newState })
          .eq('id', id)
          .select();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log('Update by id failed or id is missing, trying by idMember...');
        // Fallback: try updating by idMember
        const fallbackResult = await supabase
          .from('SignGH')
          .update({ stateSign: newState })
          .eq('idMember', idMember)
          .select();
        
        data = fallbackResult.data;
        error = fallbackResult.error;

        if (error) throw error;
        
        if (!data || data.length === 0) {
          // Second fallback: try updating by nameMember
          console.log('Update by idMember failed, trying by nameMember...');
          const secondFallbackResult = await supabase
            .from('SignGH')
            .update({ stateSign: newState })
            .eq('nameMember', nameMember)
            .select();
            
          data = secondFallbackResult.data;
          error = secondFallbackResult.error;
          
          if (error) throw error;
          
          if (!data || data.length === 0) {
             console.error('All update attempts failed. This is likely due to Supabase Row Level Security (RLS) policies blocking the UPDATE operation.');
             throw new Error('No rows updated. Please check your Supabase RLS policies for the SignGH table. You need an UPDATE policy that allows this operation.');
          }
        }
      }

      const statusLabel = newState === 1 ? 'Agree' : newState === 2 ? 'Disagree' : 'Pending';
      toast.success(`Registration set to ${statusLabel}`);
      fetchRegistrations();
      
      if (loggedInUser) {
        logUpdateAction(loggedInUser.nameUser, `${statusLabel} Sign GH for ${nameMember}`);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      const errorMessage = err.message || 'Unknown error';
      if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
        toast.error('Permission denied: You do not have rights to update this data.');
      } else {
        toast.error(`Failed to update status: ${errorMessage}`);
      }
    }
  };

  const handleDelete = (registration: SignGH) => {
    setDeleteConfirm({ isOpen: true, type: 'single', registration });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.registration) return;
    const { id, idMember, nameMember } = deleteConfirm.registration;
    setDeleteConfirm({ isOpen: false, type: 'single', registration: null });

    try {
      let data, error;

      if (id !== undefined && id !== null) {
        const result = await supabase
          .from('SignGH')
          .delete()
          .eq('id', id)
          .select();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback to idMember
        const fallbackResult = await supabase
          .from('SignGH')
          .delete()
          .eq('idMember', idMember)
          .select();
          
        data = fallbackResult.data;
        error = fallbackResult.error;

        if (error) throw error;

        if (!data || data.length === 0) {
          // Second fallback to nameMember
          const secondFallbackResult = await supabase
            .from('SignGH')
            .delete()
            .eq('nameMember', nameMember)
            .select();
            
          data = secondFallbackResult.data;
          error = secondFallbackResult.error;
          
          if (error) throw error;
          
          if (!data || data.length === 0) {
            console.error('All delete attempts failed. This is likely due to Supabase Row Level Security (RLS) policies blocking the DELETE operation.');
            throw new Error('No rows deleted. Please check your Supabase RLS policies for the SignGH table. You need a DELETE policy that allows this operation.');
          }
        }
      }

      toast.success('Registration deleted');
      fetchRegistrations();

      if (loggedInUser) {
        logUpdateAction(loggedInUser.nameUser, `Deleted Sign GH registration for ${nameMember}`);
      }
    } catch (err: any) {
      console.error('Error deleting registration:', err);
      const errorMessage = err.message || 'Unknown error';
      if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
        toast.error('Permission denied: You do not have rights to delete this data.');
      } else {
        toast.error(`Failed to delete registration: ${errorMessage}`);
      }
    }
  };

  const handleDeleteAll = () => {
    setDeleteConfirm({ isOpen: true, type: 'all' });
  };

  const executeDeleteAll = async () => {
    setDeleteConfirm({ isOpen: false, type: 'all' });

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('SignGH')
        .delete()
        .not('idMember', 'is', null) // Delete all rows where idMember is not null
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        // If there were registrations before, but 0 were deleted, RLS is blocking it
        if (registrations.length > 0) {
          console.error('Delete operation returned 0 rows. This is likely due to Supabase Row Level Security (RLS) policies blocking the DELETE operation.');
          throw new Error('No rows deleted. Please check your Supabase RLS policies for the SignGH table. You need a DELETE policy that allows this operation.');
        }
      }

      toast.success('All registrations deleted successfully');
      setRegistrations([]);
      
      if (loggedInUser) {
        logUpdateAction(loggedInUser.nameUser, 'Deleted ALL Sign GH registrations');
      }
    } catch (err: any) {
      console.error('Error deleting all registrations:', err);
      toast.error(`Failed to delete all registrations: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = r.nameMember.toLowerCase().includes(searchTerm.toLowerCase()) || r.idMember.includes(searchTerm);
    const matchesFilter = filterState === 'all' || r.stateSign === filterState;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
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
            <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-transparent">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                  <Zap size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Manage Sign GH</h2>
                  <p className="text-[10px] sm:text-xs text-slate-400">Review and approve Great Hall registrations.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={fetchRegistrations}
                  disabled={loading}
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Refresh List"
                >
                  <RefreshCw size={18} className={`sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={handleDeleteAll}
                  disabled={registrations.length === 0 || loading}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-xl text-[10px] sm:text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Delete All</span>
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by name or ID..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Pending', value: 0 },
                    { label: 'Agree', value: 1 },
                    { label: 'Disagree', value: 2 }
                  ].map((f) => (
                    <button
                      key={f.label}
                      onClick={() => setFilterState(f.value as any)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all border ${
                        filterState === f.value 
                          ? 'bg-yellow-500 border-yellow-500 text-black' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="grid grid-cols-1 gap-3 min-h-[300px] content-start">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading registrations...</p>
                  </div>
                ) : filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map(r => (
                    <div key={r.id} className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 sm:gap-4 group hover:border-yellow-500/30 transition-all">
                      <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                          r.stateSign === 1 ? 'bg-emerald-500/10 text-emerald-400' :
                          r.stateSign === 2 ? 'bg-red-500/10 text-red-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          <User size={14} className="sm:size-6" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5 sm:gap-3">
                            <h4 className="text-xs sm:text-lg font-bold text-white truncate">{r.nameMember}</h4>
                            <span className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded text-[8px] sm:text-xs font-bold uppercase border ${
                              r.stateSign === 1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              r.stateSign === 2 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {r.stateSign === 1 ? 'Agree' : r.stateSign === 2 ? 'Disagree' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
                            <span>S: <span className="text-yellow-400 font-bold">{r.speedSign?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span></span>
                            <span>T: <span className="text-yellow-400 font-bold">{r.targetPow?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {r.stateSign === 0 ? (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(r, 1)}
                              className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                              title="Agree"
                            >
                              <Check size={12} className="sm:size-5" />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(r, 2)}
                              className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                              title="Disagree"
                            >
                              <X size={12} className="sm:size-5" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(r, 0)}
                            className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 text-slate-400 hover:text-frost-400 hover:bg-frost-500/10 transition-all border border-white/10"
                            title="Reset Status"
                          >
                            <RotateCcw size={12} className="sm:size-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(r)}
                          className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/10"
                          title="Delete"
                        >
                          <Trash2 size={12} className="sm:size-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <AlertCircle className="text-slate-600" size={32} />
                    </div>
                    <p className="text-slate-500 text-sm italic">No registrations found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/5 flex justify-between sm:justify-end items-center shrink-0 bg-[#0a0a0a]">
              <p className="text-[10px] sm:hidden text-slate-500 font-medium">
                Showing {filteredRegistrations.length} of {registrations.length}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 sm:px-6 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Delete Confirmation Modal */}
    <AnimatePresence>
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
            </div>
            
            <p className="text-slate-300 mb-6">
              {deleteConfirm.type === 'all' 
                ? 'WARNING: This will delete ALL Great Hall registrations. This action cannot be undone. Are you absolutely sure?'
                : `Are you sure you want to delete the registration for ${deleteConfirm.registration?.nameMember}? This action cannot be undone.`}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, type: 'single', registration: null })}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteConfirm.type === 'all' ? executeDeleteAll : executeDelete}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};
