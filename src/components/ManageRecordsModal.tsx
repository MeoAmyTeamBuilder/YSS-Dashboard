import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Trash2, Edit2, Calendar, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface ManageRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordsUpdated: () => void;
}

export const ManageRecordsModal = ({ isOpen, onClose, onRecordsUpdated }: ManageRecordsModalProps) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('CheckRecord')
        .select('*')
        .order('dateRecord', { ascending: false });
      
      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
    } else {
      setEditingId(null);
    }
  }, [isOpen]);

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    setEditName(record.nameRecord);
    // Ensure date is in YYYY-MM-DD format for input type="date"
    const date = new Date(record.dateRecord);
    const formattedDate = date.toISOString().split('T')[0];
    setEditDate(formattedDate);
  };

  const handleSave = async (id: number) => {
    try {
      const { error } = await supabase
        .from('CheckRecord')
        .update({ nameRecord: editName, dateRecord: editDate })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Record updated successfully');
      setEditingId(null);
      fetchRecords();
      onRecordsUpdated();
    } catch (error: any) {
      toast.error('Failed to update record');
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      // 1. Delete associated data first (cascading manually as per request)
      const { error: deadError } = await supabase.from('CheckDead').delete().eq('idCheckRecord', id);
      if (deadError) throw deadError;

      const { error: manaError } = await supabase.from('CheckMana').delete().eq('idCheckRecord', id);
      if (manaError) throw manaError;

      const { error: meritError } = await supabase.from('CheckMertit').delete().eq('idCheckRecord', id);
      if (meritError) throw meritError;

      // 2. Delete the record itself
      const { error: recordError } = await supabase.from('CheckRecord').delete().eq('id', id);
      if (recordError) throw recordError;

      toast.success('Record and all associated data deleted');
      fetchRecords();
      onRecordsUpdated();
    } catch (error: any) {
      toast.error('Failed to delete record');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-frost-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-frost-500/20 border border-frost-500/30 flex items-center justify-center text-frost-400">
                  <Database size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Manage Season Records</h2>
                  <p className="text-xs text-slate-400 mt-1">Edit or delete existing check records</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-2 border-frost-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Fetching records...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-20">
                  <Database size={48} className="mx-auto text-slate-700 mb-4" />
                  <p className="text-slate-400">No records found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div 
                      key={record.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    >
                      {editingId === record.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Record Name</label>
                              <input 
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-frost-500/50"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                              <input 
                                type="date"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-frost-500/50"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingId(null)}
                              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:bg-white/5 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSave(record.id)}
                              className="px-4 py-2 rounded-lg text-xs font-bold bg-frost-500 text-white hover:bg-frost-600 transition-colors flex items-center gap-2"
                            >
                              <Check size={14} />
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                              <Calendar size={20} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">{record.nameRecord}</h3>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {new Date(record.dateRecord).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEdit(record)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-frost-400 transition-all"
                              title="Edit Record"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this record? This will also delete all associated Merits, Mana, and Dead data. This action cannot be undone.')) {
                                  handleDelete(record.id);
                                }
                              }}
                              disabled={isDeleting === record.id}
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all disabled:opacity-50"
                              title="Delete Record"
                            >
                              {isDeleting === record.id ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-start gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <AlertTriangle size={16} />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                <span className="font-bold text-amber-500 uppercase block mb-1">Warning</span>
                Deleting a record will permanently remove all member performance data (Merits, Mana, Units Dead) associated with that specific check date.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
