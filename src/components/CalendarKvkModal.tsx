import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Plus, Trash2, Edit2, Save, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CalendarKvk } from '../types';
import { toast } from 'react-hot-toast';

interface CalendarKvkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarKvkModal = ({ isOpen, onClose }: CalendarKvkModalProps) => {
  const [events, setEvents] = useState<CalendarKvk[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarKvk | null>(null);
  const [formData, setFormData] = useState<Omit<CalendarKvk, 'id'>>({
    activeDate: '',
    nameDate: '',
    timeDate: '',
    desDate: '',
    importantDate: 0
  });

  useEffect(() => {
    if (isOpen) fetchEvents();
  }, [isOpen]);

  async function fetchEvents() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('CalendarKvk').select('*').order('activeDate', { ascending: false });
      if (error) {
        console.error('Supabase fetchEvents error:', error);
        throw error;
      }
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      toast.error(`Failed to fetch events: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    if (!formData.activeDate || !formData.nameDate) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingEvent) {
        const { error } = await supabase.from('CalendarKvk').update(formData).eq('id', editingEvent.id);
        if (error) throw error;
        toast.success('Event updated!');
      } else {
        const { error } = await supabase.from('CalendarKvk').insert([formData]);
        if (error) throw error;
        toast.success('Event added!');
      }
      setEditingEvent(null);
      setFormData({ activeDate: '', nameDate: '', timeDate: '', desDate: '', importantDate: 0 });
      fetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('CalendarKvk').delete().eq('id', id);
      if (error) throw error;
      toast.success('Event deleted!');
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Manage Calendar</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 shadow-xl h-fit">
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Date</label>
                    <input type="date" className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-3 text-white focus:border-emerald-500 transition-colors" value={formData.activeDate} onChange={e => setFormData({...formData, activeDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Event Name</label>
                    <input type="text" placeholder="e.g. KVK Start" className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-3 text-white focus:border-emerald-500 transition-colors" value={formData.nameDate} onChange={e => setFormData({...formData, nameDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Time</label>
                    <input type="text" placeholder="e.g. 19:00 UTC" className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-3 text-white focus:border-emerald-500 transition-colors" value={formData.timeDate} onChange={e => setFormData({...formData, timeDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Description</label>
                    <input type="text" placeholder="Brief details..." className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-3 text-white focus:border-emerald-500 transition-colors" value={formData.desDate} onChange={e => setFormData({...formData, desDate: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => setFormData({...formData, importantDate: formData.importantDate === 1 ? 0 : 1})}>
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${formData.importantDate === 1 ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-transparent'}`}>
                      {formData.importantDate === 1 && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.importantDate === 1} onChange={e => setFormData({...formData, importantDate: e.target.checked ? 1 : 0})} />
                    <label className="text-sm font-bold text-white cursor-pointer">Mark as Important</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
                    {editingEvent ? <Save size={18} /> : <Plus size={18} />} {editingEvent ? 'Update Event' : 'Add Event'}
                  </button>
                  {editingEvent && (
                    <button onClick={() => { setEditingEvent(null); setFormData({ activeDate: '', nameDate: '', timeDate: '', desDate: '' }); }} className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Events List Section */}
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={16} /> Upcoming Events
                </h3>
                <div className="max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-hide p-2 space-y-4 mt-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[1,2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <p className="text-slate-500">No events scheduled.</p>
                    </div>
                  ) : (
                    events.map(e => (
                      <div key={e.id} className={`group flex items-center justify-between p-2 transition-all ${e.importantDate === 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center w-10 h-10">
                            <span className="text-[9px] font-bold uppercase">{new Date(e.activeDate).toLocaleString('en-US', { month: 'short' })}</span>
                            <span className="text-sm font-black">{new Date(e.activeDate).getDate()}</span>
                          </div>
                          <div>
                            <p className="font-bold text-sm">{e.nameDate}</p>
                            <p className={`text-[11px] flex items-center gap-1 ${e.importantDate === 1 ? 'text-amber-300/70' : 'text-emerald-400/70'}`}>
                              <Clock size={10} /> {e.timeDate} • {e.desDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingEvent(e); setFormData({...e, importantDate: e.importantDate || 0}); }} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(e.id!)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
