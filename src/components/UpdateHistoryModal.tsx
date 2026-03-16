import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Edit2, Trash2, Calendar, Flag, AlignLeft, Type, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { logUpdateAction } from '../lib/updates';
import { HistoryKingdom, User } from '../types';
import { checkPermission } from '../lib/permissions';

interface UpdateHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHistoryUpdated: () => void;
  loggedInUser: User | null;
}

export const UpdateHistoryModal = ({ isOpen, onClose, onHistoryUpdated, loggedInUser }: UpdateHistoryModalProps) => {
  const [histories, setHistories] = useState<HistoryKingdom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<HistoryKingdom>>({});

  useEffect(() => {
    if (isOpen) {
      fetchHistories();
      setIsFormOpen(false);
      setFormData({});
    }
  }, [isOpen]);

  const fetchHistories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('HistoryKingdom')
        .select('*')
        .order('dateHistory', { ascending: false });

      if (error) throw error;
      setHistories(data || []);
    } catch (error) {
      console.error('Error fetching histories:', error);
      toast.error('Failed to load history data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (history?: HistoryKingdom) => {
    if (history) {
      setFormData(history);
    } else {
      setFormData({
        status: '1',
        dateHistory: new Date().toISOString().split('T')[0]
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!checkPermission(loggedInUser, ['1', '2'])) {
      toast.error('You do not have permission to update history');
      return;
    }
    if (!formData.titleHistory || !formData.dateHistory || !formData.status) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (formData.id) {
        const { id, ...updateData } = formData;
        const { error } = await supabase
          .from('HistoryKingdom')
          .update(updateData)
          .eq('id', formData.id);
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }

        if (loggedInUser) {
          await logUpdateAction(loggedInUser.fullNameUser || loggedInUser.nameUser, `Updated history: ${formData.titleHistory}`);
        }

        toast.success('History updated successfully');
      } else {
        const { id, ...insertData } = formData;
        const { error } = await supabase
          .from('HistoryKingdom')
          .insert(insertData);
        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }

        if (loggedInUser) {
          await logUpdateAction(loggedInUser.fullNameUser || loggedInUser.nameUser, `Added history: ${formData.titleHistory}`);
        }

        toast.success('History added successfully');
      }

      fetchHistories();
      handleCloseForm();
      onHistoryUpdated();
    } catch (error: any) {
      console.error('Error saving history:', error);
      toast.error(error?.message || 'Failed to save history');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('HistoryKingdom')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      if (loggedInUser) {
        const deletedHistory = histories.find(h => h.id === id);
        await logUpdateAction(loggedInUser.fullNameUser || loggedInUser.nameUser, `Deleted history: ${deletedHistory?.titleHistory || id}`);
      }

      toast.success('History deleted successfully');
      fetchHistories();
      onHistoryUpdated();
    } catch (error) {
      console.error('Error deleting history:', error);
      toast.error('Failed to delete history');
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (String(status)) {
      case '1': return { text: 'Victory', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case '2': return { text: 'Defeat', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
      case '3': return { text: 'Current', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      default: return { text: status, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 100 }}
            className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Update History Alliance</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage the chronological history and major events</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : isFormOpen ? (
                /* Form View */
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {formData.id ? <Edit2 size={18} className="text-purple-400" /> : <Plus size={18} className="text-purple-400" />}
                      {formData.id ? 'Edit History Record' : 'Add New History Record'}
                    </h3>
                    <button 
                      onClick={handleCloseForm}
                      className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Back to List
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Type size={14} /> Title
                      </label>
                      <input
                        type="text"
                        name="titleHistory"
                        value={formData.titleHistory || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                        placeholder="e.g. KvK Season 1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} /> Date
                      </label>
                      <input
                        type="date"
                        name="dateHistory"
                        value={formData.dateHistory || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Flag size={14} /> Status
                    </label>
                    <select
                      name="status"
                      value={formData.status || '1'}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
                    >
                      <option value="1" className="bg-[#1a1a1a]">Victory</option>
                      <option value="2" className="bg-[#1a1a1a]">Defeat</option>
                      <option value="3" className="bg-[#1a1a1a]">Current</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <AlignLeft size={14} /> Description
                    </label>
                    <textarea
                      name="desHistory"
                      value={formData.desHistory || ''}
                      onChange={handleChange}
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                      placeholder="Describe the event..."
                    />
                  </div>
                </motion.div>
              ) : (
                /* List View */
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-300">Existing Records ({histories.length})</h3>
                    <button
                      onClick={() => handleOpenForm()}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl text-xs font-bold transition-colors border border-purple-500/30"
                    >
                      <Plus size={14} /> Add New
                    </button>
                  </div>

                  {histories.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                      <BookOpen size={32} className="mx-auto text-slate-600 mb-3" />
                      <p className="text-slate-400 text-sm">No history records found.</p>
                      <button
                        onClick={() => handleOpenForm()}
                        className="mt-4 text-purple-400 text-xs font-bold hover:text-purple-300 transition-colors"
                      >
                        Create your first record
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {histories.map((history) => (
                        <div 
                          key={history.id} 
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-sm font-bold text-white truncate">{history.titleHistory}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusDisplay(history.status).color}`}>
                                {getStatusDisplay(history.status).text}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> {history.dateHistory}
                              </span>
                            </div>
                            {history.desHistory && (
                              <p className="text-xs text-slate-500 mt-2 line-clamp-1">{history.desHistory}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleOpenForm(history)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => history.id && handleDelete(history.id)}
                              disabled={isDeleting === history.id}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {isDeleting === history.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex justify-end gap-3 shrink-0 bg-[#0a0a0a]">
              {isFormOpen ? (
                <>
                  <button
                    onClick={handleCloseForm}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Record
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
