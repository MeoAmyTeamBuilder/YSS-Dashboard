import React, { useState, useEffect } from 'react';
import { Users, Database, Shield, Info, ChevronRight, Upload, RefreshCw, UserPlus, BookOpen, X, Edit2, History, AlertTriangle, Zap, FileSpreadsheet, Calendar } from 'lucide-react';
import { CalendarKvkModal } from './CalendarKvkModal';
import { motion, AnimatePresence } from 'motion/react';
import { SeasonEventManagerModal } from './SeasonEventManagerModal';
import { MembersManagerModal } from './MembersManagerModal';
import { AllianceManagerModal } from './AllianceManagerModal';
import { UpdateLeadershipModal } from './UpdateLeadershipModal';
import { UpdateAllianceInfoModal } from './UpdateAllianceInfoModal';
import { UpdateHistoryModal } from './UpdateHistoryModal';
import { AddAccountModal } from './AddAccountModal';
import { ImportSeasonModal } from './ImportSeasonModal';
import { SyncMembersModal } from './SyncMembersModal';
import { ManageRecordsModal } from './ManageRecordsModal';
import { UpdateHistoryLogModal } from './UpdateHistoryLogModal';
import { ManageViolationsModal } from './ManageViolationsModal';
import { ManageSignGHModal } from './ManageSignGHModal';
import { MigrationMembersManagerModal } from './MigrationMembersManagerModal';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { logUpdateAction } from '../lib/updates';

const SETTING_CARDS = [
  {
    id: 'members-manager',
    title: 'Members Manager',
    description: 'Synchronize member list and manage member violations.',
    icon: Users,
    color: 'text-frost-400',
    action: 'Manage Members'
  },
  {
    id: 'season-event-manager',
    title: 'Season & Events',
    description: 'Manage season data, Great Hall sign-ups, and calendar events.',
    icon: Calendar,
    color: 'text-amber-400',
    action: 'Manage Season'
  },
  {
    id: 'alliance-manager',
    title: 'Alliance Manager',
    description: 'Manage alliance leadership, profile information, and history logs.',
    icon: Shield,
    color: 'text-frost-400',
    action: 'Manage Alliance'
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
  exportToExcel: () => Promise<void>;
}

export const SettingsView = ({ loggedInUser, onLeadershipUpdated, onSetPowerThreshold, exportToExcel }: SettingsViewProps) => {
  const canManageAccounts = checkPermission(loggedInUser, ['1']);
  const filteredCards = SETTING_CARDS.filter(card => {
    if (card.id === 'add-account') return canManageAccounts;
    return true;
  });
  const [isLeadershipModalOpen, setIsLeadershipModalOpen] = useState(false);
  const [isAllianceInfoModalOpen, setIsAllianceInfoModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAllianceManagerModalOpen, setIsAllianceManagerModalOpen] = useState(false);
  const [isMembersManagerModalOpen, setIsMembersManagerModalOpen] = useState(false);
  const [isSeasonEventManagerModalOpen, setIsSeasonEventManagerModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isImportSeasonModalOpen, setIsImportSeasonModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isManageRecordsModalOpen, setIsManageRecordsModalOpen] = useState(false);
  const [isHistoryLogModalOpen, setIsHistoryLogModalOpen] = useState(false);
  const [isManageViolationsModalOpen, setIsManageViolationsModalOpen] = useState(false);
  const [isManageSignGHModalOpen, setIsManageSignGHModalOpen] = useState(false);
  const [isCalendarKvkModalOpen, setIsCalendarKvkModalOpen] = useState(false);
  const [isMigrationManagerModalOpen, setIsMigrationManagerModalOpen] = useState(false);
  const [powerInputValue, setPowerInputValue] = useState('60000000');

  useEffect(() => {
    // fetchLatestUpdate();
  }, []);

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
                <button 
                  onClick={() => {
                    if (card.id === 'members-manager') setIsMembersManagerModalOpen(true);
                    else if (card.id === 'season-event-manager') setIsSeasonEventManagerModalOpen(true);
                    else if (card.id === 'alliance-manager') setIsAllianceManagerModalOpen(true);
                    else if (card.id === 'add-account') setIsAccountModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold text-white transition-all"
                >
                  {card.id === 'season-event-manager' ? <Calendar size={14} /> : <RefreshCw size={14} />}
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
            <h4 className="text-sm font-bold text-white">System Monitoring Active</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Real-time alliance management tools
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

      <AllianceManagerModal
        isOpen={isAllianceManagerModalOpen}
        onClose={() => setIsAllianceManagerModalOpen(false)}
        onOpenLeadership={() => setIsLeadershipModalOpen(true)}
        onOpenAllianceInfo={() => setIsAllianceInfoModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
      />

      <MembersManagerModal
        isOpen={isMembersManagerModalOpen}
        onClose={() => setIsMembersManagerModalOpen(false)}
        onOpenUpdateMembers={() => setIsSyncModalOpen(true)}
        onOpenManageViolations={() => setIsManageViolationsModalOpen(true)}
        onOpenMigrationManager={() => setIsMigrationManagerModalOpen(true)}
      />

      <SeasonEventManagerModal
        isOpen={isSeasonEventManagerModalOpen}
        onClose={() => setIsSeasonEventManagerModalOpen(false)}
        onOpenImportSeason={() => setIsImportSeasonModalOpen(true)}
        onOpenManageRecords={() => setIsManageRecordsModalOpen(true)}
        onOpenManageSignGH={() => setIsManageSignGHModalOpen(true)}
        onOpenManageCalendar={() => setIsCalendarKvkModalOpen(true)}
        exportToExcel={exportToExcel}
      />

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
        }}
        loggedInUser={loggedInUser}
      />

      <SyncMembersModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={() => {
          onLeadershipUpdated();
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

      <ManageViolationsModal
        isOpen={isManageViolationsModalOpen}
        onClose={() => setIsManageViolationsModalOpen(false)}
        loggedInUser={loggedInUser}
      />

      <ManageSignGHModal
        isOpen={isManageSignGHModalOpen}
        onClose={() => setIsManageSignGHModalOpen(false)}
        loggedInUser={loggedInUser}
      />

      <CalendarKvkModal
        isOpen={isCalendarKvkModalOpen}
        onClose={() => setIsCalendarKvkModalOpen(false)}
      />

      <MigrationMembersManagerModal
        isOpen={isMigrationManagerModalOpen}
        onClose={() => setIsMigrationManagerModalOpen(false)}
      />
    </div>
  );
};
