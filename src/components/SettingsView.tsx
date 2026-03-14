import React, { useState, useEffect } from 'react';
import { Users, Database, Shield, Info, ChevronRight, Upload, RefreshCw, UserPlus, BookOpen, X, Edit2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UpdateLeadershipModal } from './UpdateLeadershipModal';
import { UpdateAllianceInfoModal } from './UpdateAllianceInfoModal';
import { UpdateHistoryModal } from './UpdateHistoryModal';
import { AddAccountModal } from './AddAccountModal';
import { ImportSeasonModal } from './ImportSeasonModal';
import { SyncMembersModal } from './SyncMembersModal';
import { ManageRecordsModal } from './ManageRecordsModal';
import { UpdateHistoryLogModal } from './UpdateHistoryLogModal';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { logUpdateAction } from '../lib/updates';

const SETTING_CARDS = [
  {
    id: 'update-members',
    title: 'Update Member List',
    description: 'Synchronize and refresh the current alliance roster from game data.',
    icon: Users,
    color: 'text-frost-400',
    action: 'Sync Now'
  },
  {
    id: 'import-season',
    title: 'Import Season Data',
    description: 'Upload and process performance metrics for the current competitive season.',
    icon: Database,
    color: 'text-amber-400',
    action: 'Import CSV',
    secondaryAction: 'Edit Records'
  },
  {
    id: 'update-leadership',
    title: 'Update Leadership Info',
    description: 'Modify roles and permissions for alliance officers and leaders.',
    icon: Shield,
    color: 'text-red-400',
    action: 'Manage Roles'
  },
  {
    id: 'update-alliance',
    title: 'Update Alliance Info',
    description: 'Edit alliance description, requirements, and public profile details.',
    icon: Info,
    color: 'text-emerald-400',
    action: 'Edit Profile'
  },
  {
    id: 'update-history',
    title: 'Update History Alliance',
    description: 'Manage the chronological history and major events of the alliance.',
    icon: BookOpen,
    color: 'text-purple-400',
    action: 'Manage History'
  },
  {
    id: 'add-account',
    title: 'Add Account',
    description: 'Manage system accounts and administrator roles.',
    icon: UserPlus,
    color: 'text-blue-400',
    action: 'Manage Accounts'
  }
];

import { User } from '../types';
import { checkPermission } from '../lib/permissions';

interface SettingsViewProps {
  loggedInUser: User | null;
  onLeadershipUpdated: () => void;
  onSetPowerThreshold?: (threshold: number) => void;
}

export const SettingsView = ({ loggedInUser, onLeadershipUpdated, onSetPowerThreshold }: SettingsViewProps) => {
  const canManageAccounts = checkPermission(loggedInUser, ['1']);
  const filteredCards = SETTING_CARDS.filter(card => {
    if (card.id === 'add-account') return canManageAccounts;
    return true;
  });
  const [isLeadershipModalOpen, setIsLeadershipModalOpen] = useState(false);
  const [isAllianceInfoModalOpen, setIsAllianceInfoModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isImportSeasonModalOpen, setIsImportSeasonModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isManageRecordsModalOpen, setIsManageRecordsModalOpen] = useState(false);
  const [isHistoryLogModalOpen, setIsHistoryLogModalOpen] = useState(false);
  const [powerInputValue, setPowerInputValue] = useState('60000000');
  const [latestUpdate, setLatestUpdate] = useState<{ idUser: string, actionUpdate: string, dateUpdate: string } | null>(null);

  useEffect(() => {
    fetchLatestUpdate();
  }, []);

  async function fetchLatestUpdate() {
    try {
      const { data, error } = await supabase
        .from('CheckUpdateDataByUser')
        .select('*')
        .order('dateUpdate', { ascending: false })
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching latest update:', error);
        if (error.message.includes('permission denied')) {
          console.warn('RLS Policy might be missing for CheckUpdateDataByUser table');
        }
      }
      if (data) setLatestUpdate(data);
    } catch (err) {
      console.error('Failed to fetch latest update:', err);
    }
  }

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="frost-glass p-6 rounded-[32px] border-white/5 hover:border-frost-500/30 transition-all group cursor-pointer relative overflow-hidden"
          >
            {/* Background Icon Decoration */}
            <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity ${card.color}`}>
              <card.icon size={120} />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${card.color}`}>
                  <card.icon size={24} />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-frost-300 transition-colors">
                {card.title}
              </h3>
              
              <p className="text-xs text-slate-400 leading-relaxed mb-6 flex-1">
                {card.description}
              </p>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                {card.secondaryAction && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.id === 'import-season') setIsManageRecordsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all"
                  >
                    <Edit2 size={12} />
                    {card.secondaryAction}
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (card.id === 'update-members') setIsSyncModalOpen(true);
                    else if (card.id === 'import-season') setIsImportSeasonModalOpen(true);
                    else if (card.id === 'update-leadership') setIsLeadershipModalOpen(true);
                    else if (card.id === 'update-alliance') setIsAllianceInfoModalOpen(true);
                    else if (card.id === 'update-history') setIsHistoryModalOpen(true);
                    else if (card.id === 'add-account') setIsAccountModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold text-white transition-all"
                >
                  {card.id === 'import-season' ? <Upload size={14} /> : <RefreshCw size={14} />}
                  {card.action}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions / System Status */}
      <div className="mt-auto p-6 rounded-[32px] bg-frost-500/5 border border-frost-500/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <RefreshCw size={20} className="animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">System Auto-Sync Active</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              {latestUpdate ? (
                <>
                  <span className="text-frost-400 font-bold">{latestUpdate.idUser}</span> performed <span className="text-white font-bold">{latestUpdate.actionUpdate}</span> on {format(new Date(latestUpdate.dateUpdate), 'MMM dd, HH:mm')}
                </>
              ) : (
                'No recent synchronization activity'
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsHistoryLogModalOpen(true)}
          className="px-6 py-2.5 bg-frost-500 hover:bg-frost-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-frost-500/20 transition-all flex items-center gap-2"
        >
          <History size={14} />
          History Update
        </button>
      </div>

      <UpdateLeadershipModal 
        isOpen={isLeadershipModalOpen} 
        onClose={() => setIsLeadershipModalOpen(false)} 
        onLeadershipUpdated={onLeadershipUpdated}
        loggedInUser={loggedInUser}
      />

      <UpdateAllianceInfoModal
        isOpen={isAllianceInfoModalOpen}
        onClose={() => setIsAllianceInfoModalOpen(false)}
        onAllianceInfoUpdated={onLeadershipUpdated}
        loggedInUser={loggedInUser}
      />

      <UpdateHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onHistoryUpdated={onLeadershipUpdated}
        loggedInUser={loggedInUser}
      />

      <AddAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        loggedInUser={loggedInUser}
      />

      <ImportSeasonModal
        isOpen={isImportSeasonModalOpen}
        onClose={() => setIsImportSeasonModalOpen(false)}
        onImportSuccess={() => {
          onLeadershipUpdated();
          fetchLatestUpdate();
        }}
        loggedInUser={loggedInUser}
      />

      <SyncMembersModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={() => {
          onLeadershipUpdated();
          fetchLatestUpdate();
        }}
        loggedInUser={loggedInUser}
      />

      <ManageRecordsModal
        isOpen={isManageRecordsModalOpen}
        onClose={() => setIsManageRecordsModalOpen(false)}
        onRecordsUpdated={onLeadershipUpdated}
        loggedInUser={loggedInUser}
      />

      <UpdateHistoryLogModal
        isOpen={isHistoryLogModalOpen}
        onClose={() => setIsHistoryLogModalOpen(false)}
      />
    </div>
  );
};
