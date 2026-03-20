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
  const [showEventsMobile, setShowEventsMobile] = useState(false);
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

  const renderEventsList = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      );
    }
    
    if (events.length === 0) {
      return (
        <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p className="text-slate-500">No events scheduled.</p>
        </div>
      );
    }

    return events.map(e => (
      <div key={e.id} className={`group flex items-center justify-between p-2 transition-all ${e.importantDate === 1 ? 'text-amber-400 [text-shadow:0_0_8px_#fbbf24]' : 'text-emerald-400'}`}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center w-10 h-10">
            <span className="text-[9px] font-bold uppercase">{new Date(e.activeDate).toLocaleString('en-US', { month: 'short' })}</span>
            <span className="text-sm font-black">{new Date(e.activeDate).getDate()}</span>
          </div>
          <div>
            <p className="font-bold text-sm">{e.nameDate}</p>
            <p className={`text-[11px] flex items-center gap-1 ${e.importantDate === 1 ? 'text-amber-300/70 [text-shadow:0_0_5px_rgba(252,211,77,0.5)]' : 'text-emerald-400/70'}`}>
              <Clock size={10} /> {e.timeDate} • {e.desDate}
            </p>
          </div>
        </div>
        <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button onClick={() => { setEditingEvent(e); setFormData({...e, importantDate: e.importantDate || 0}); setShowEventsMobile(false); }} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 size={14} /></button>
          <button onClick={() => handleDelete(e.id!)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>
    ));
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 100 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 100 }} 
            className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-hide"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Manage Calendar</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Form Section */}
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl h-fit">
                <h3 className="text-xs sm:text-sm font-bold text-slate-400 mb-4 sm:mb-6 uppercase tracking-widest">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">Date</label>
                    <input type="date" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-sm sm:text-base text-white focus:border-emerald-500 transition-colors" value={formData.activeDate} onChange={e => setFormData({...formData, activeDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">Event Name</label>
                    <input type="text" placeholder="e.g. KVK Start" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-sm sm:text-base text-white focus:border-emerald-500 transition-colors" value={formData.nameDate} onChange={e => setFormData({...formData, nameDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">Time</label>
                    <input type="text" placeholder="e.g. 19:00 UTC" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-sm sm:text-base text-white focus:border-emerald-500 transition-colors" value={formData.timeDate} onChange={e => setFormData({...formData, timeDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">Description</label>
                    <input type="text" placeholder="Brief details..." className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-sm sm:text-base text-white focus:border-emerald-500 transition-colors" value={formData.desDate} onChange={e => setFormData({...formData, desDate: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-3 p-2.5 sm:p-3 bg-[#0a0a0a] rounded-xl sm:rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => setFormData({...formData, importantDate: formData.importantDate === 1 ? 0 : 1})}>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg border flex items-center justify-center transition-all ${formData.importantDate === 1 ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-transparent'}`}>
                      {formData.importantDate === 1 && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-black rounded-sm" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.importantDate === 1} onChange={e => setFormData({...formData, importantDate: e.target.checked ? 1 : 0})} />
                    <label className="text-xs sm:text-sm font-bold text-white cursor-pointer">Mark as Important</label>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 sm:py-3.5 text-sm sm:text-base bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
                    {editingEvent ? <Save size={16} /> : <Plus size={16} />} {editingEvent ? 'Update' : 'Add'}
                  </button>
                  {editingEvent && (
                    <button onClick={() => { setEditingEvent(null); setFormData({ activeDate: '', nameDate: '', timeDate: '', desDate: '' }); }} className="px-4 sm:px-6 py-2.5 sm:py-3.5 text-sm sm:text-base bg-white/5 hover:bg-white/10 text-white rounded-xl sm:rounded-2xl font-bold transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Events List Section */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between lg:block">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="sm:w-4 sm:h-4" /> Upcoming Events
                  </h3>
                  <button 
                    onClick={() => setShowEventsMobile(true)}
                    className="lg:hidden px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    Show Events
                  </button>
                </div>
                {/* Desktop Events List */}
                <div className="hidden lg:block max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-hide p-2 space-y-4 mt-4">
                  {renderEventsList()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Mobile Events Popup */}
    <AnimatePresence>
      {showEventsMobile && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 lg:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEventsMobile(false)} className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm" />
          <motion.div 
            initial={{ opacity: 0, y: '100%' }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full bg-[#0a0a0a] border-t border-white/10 rounded-t-[32px] p-6 shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={18} /> Upcoming Events
              </h3>
              <button onClick={() => setShowEventsMobile(false)} className="text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto overflow-x-hidden scrollbar-hide space-y-4 pb-8">
              {renderEventsList()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};
