import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Image as ImageIcon, Link as LinkIcon, Info as InfoIcon, Globe, Clock, Target, Languages, MessageSquare, Hash, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { logUpdateAction } from '../lib/updates';
import { AllianceInformation, User } from '../types';
import { checkPermission } from '../lib/permissions';
import { getDirectDriveUrl } from '../lib/utils';

interface UpdateAllianceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllianceInfoUpdated: () => void;
  loggedInUser: User | null;
}

export const UpdateAllianceInfoModal = ({ isOpen, onClose, onAllianceInfoUpdated, loggedInUser }: UpdateAllianceInfoModalProps) => {
  const [info, setInfo] = useState<Partial<AllianceInformation>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllianceInfo();
    }
  }, [isOpen]);

  const fetchAllianceInfo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('AllianceInformation')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is not found
        throw error;
      }
      
      if (data) {
        setInfo(data);
      }
    } catch (error) {
      console.error('Error fetching alliance info:', error);
      toast.error('Failed to load alliance info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!checkPermission(loggedInUser, ['1', '2'])) {
      toast.error('You do not have permission to update alliance info');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        id: info.id || 1,
        nameAlliance: info.nameAlliance || '',
        serverAlliance: info.serverAlliance || '',
        tagAlliance: info.tagAlliance || '',
        kpiAlliance: info.kpiAlliance || '',
        timeAlliance: info.timeAlliance || '',
        desAlliance: info.desAlliance || '',
        imageAlliance: info.imageAlliance || '',
        languageAlliance: info.languageAlliance || '',
        discordLink: info.discordLink || '',
        zaloLink: info.zaloLink || ''
      };

      const { error } = await supabase
        .from('AllianceInformation')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Supabase upsert error:', error);
        throw error;
      }

      if (loggedInUser) {
        await logUpdateAction(loggedInUser.fullNameUser || loggedInUser.nameUser, 'Updated Alliance Info');
      }

      toast.success('Alliance info updated successfully');
      onAllianceInfoUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error saving alliance info:', error);
      toast.error(error?.message || 'Failed to save alliance info');
    } finally {
      setIsSaving(false);
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
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Update Alliance Info</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage your alliance's public profile and settings</p>
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
            <div className="p-6 overflow-y-auto overflow-x-hidden scrollbar-hide flex-1">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Visuals Section */}
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-1/3 shrink-0">
                      <div className="aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-white/5 overflow-hidden relative group">
                        {info.imageAlliance ? (
                          <img 
                            src={getDirectDriveUrl(info.imageAlliance)} 
                            alt="Alliance Logo" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                            <ImageIcon size={48} className="mb-2 opacity-50" />
                            <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <ImageIcon size={14} /> Image URL
                        </label>
                        <input
                          type="text"
                          name="imageAlliance"
                          value={info.imageAlliance || ''}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                          placeholder="https://example.com/image.png"
                        />
                        <p className="text-[10px] text-slate-500">Provide a direct URL to your alliance logo or banner.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Shield size={14} /> Alliance Name
                          </label>
                          <input
                            type="text"
                            name="nameAlliance"
                            value={info.nameAlliance || ''}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                            placeholder="e.g. Frost Wolves"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Hash size={14} /> Tag
                          </label>
                          <input
                            type="text"
                            name="tagAlliance"
                            value={info.tagAlliance || ''}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                            placeholder="e.g. [FW]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Operations Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Globe size={14} /> Server
                      </label>
                      <input
                        type="text"
                        name="serverAlliance"
                        value={info.serverAlliance || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        placeholder="e.g. Server 1"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={14} /> Time Active
                      </label>
                      <input
                        type="text"
                        name="timeAlliance"
                        value={info.timeAlliance || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        placeholder="e.g. 12:00 - 20:00 UTC"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Target size={14} /> KPI Requirement
                      </label>
                      <input
                        type="text"
                        name="kpiAlliance"
                        value={info.kpiAlliance || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        placeholder="e.g. 50M Power"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Languages size={14} /> Language
                      </label>
                      <input
                        type="text"
                        name="languageAlliance"
                        value={info.languageAlliance || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        placeholder="e.g. English"
                      />
                    </div>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Social & Links Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare size={14} className="text-[#5865F2]" /> Discord Link
                      </label>
                      <input
                        type="text"
                        name="discordLink"
                        value={info.discordLink || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#5865F2]/50 transition-colors"
                        placeholder="https://discord.gg/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare size={14} className="text-[#0068FF]" /> Zalo Link
                      </label>
                      <input
                        type="text"
                        name="zaloLink"
                        value={info.zaloLink || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0068FF]/50 transition-colors"
                        placeholder="https://zalo.me/..."
                      />
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <InfoIcon size={14} /> Description
                    </label>
                    <textarea
                      name="desAlliance"
                      value={info.desAlliance || ''}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none scrollbar-hide"
                      placeholder="Enter a compelling description for your alliance..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex justify-end gap-3 shrink-0 bg-[#0a0a0a]">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
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
