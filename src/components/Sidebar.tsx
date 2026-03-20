import React, { useState } from 'react';
import { Users, Shield, Trophy, TrendingUp, Settings, LogOut, LogIn, LayoutDashboard, Menu, X, Calendar, AlertTriangle, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'success';
  tooltipPosition?: 'right' | 'top';
}

const SidebarItem = ({ icon: Icon, label, active, onClick, variant = 'default', tooltipPosition = 'right' }: SidebarItemProps) => {
  const variantStyles = {
    default: active 
      ? 'bg-frost-500 text-white shadow-lg shadow-frost-500/40' 
      : 'text-slate-400 hover:bg-white/10 hover:text-slate-200',
    danger: 'text-red-400 hover:bg-red-500/10 hover:text-red-300',
    success: 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
  };

  const tooltipStyles = tooltipPosition === 'right'
    ? 'left-14'
    : 'bottom-14 left-1/2 -translate-x-1/2';

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${variantStyles[variant]}`}
    >
      <Icon size={22} />
      <span className={`absolute ${tooltipStyles} bg-frost-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 z-50`}>
        {label}
      </span>
    </div>
  );
};

import { User } from '../types';
import { checkPermission } from '../lib/permissions';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
  loggedInUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  historyKingdom?: any;
}

export const Sidebar = ({ activeTab, setActiveTab, isLoggedIn, loggedInUser, onLoginClick, onLogoutClick, historyKingdom }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const canAccessSettings = checkPermission(loggedInUser, ['1', '2']);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  const seasonLabel = historyKingdom 
    ? `Season ${historyKingdom.titleHistory}` 
    : 'Season';

  return (
    <div className="fixed left-6 bottom-6 z-50 flex flex-col-reverse items-center gap-4">
      {/* Main Toggle Button and Right-side buttons */}
      <div className="relative flex items-center">
        <motion.button 
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-frost-500 rounded-2xl flex items-center justify-center frost-glow text-white shadow-xl z-50 relative"
        >
          {isOpen ? <X size={28} /> : <Shield size={28} />}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.8 }}
              className="absolute left-full ml-4 flex items-center gap-2 frost-glass p-2 rounded-2xl shadow-2xl"
            >
              <SidebarItem 
                icon={CalendarDays} 
                label="Calendar" 
                active={activeTab === 'calendar'} 
                onClick={() => handleTabClick('calendar')}
                tooltipPosition="top"
              />
              <SidebarItem 
                icon={AlertTriangle} 
                label="Member Violent" 
                active={activeTab === 'violations'}
                variant="danger"
                onClick={() => handleTabClick('violations')}
                tooltipPosition="top"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="frost-glass p-2 rounded-2xl flex flex-col gap-2 shadow-2xl mb-2"
          >
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Overview" 
              active={activeTab === 'overview'} 
              onClick={() => handleTabClick('overview')}
            />
            <SidebarItem 
              icon={Users} 
              label="Members" 
              active={activeTab === 'members'} 
              onClick={() => handleTabClick('members')}
            />
            <div 
              onClick={() => handleTabClick('activity')}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                activeTab === 'activity' 
                  ? 'bg-frost-500 text-white shadow-lg shadow-frost-500/40' 
                  : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <Calendar size={22} />
              <span className={`absolute left-14 px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 z-50 bg-gradient-to-r from-blue-500 via-white to-blue-500 bg-clip-text text-transparent animate-gradient text-glow`}>
                {seasonLabel}
              </span>
            </div>
            <SidebarItem 
              icon={TrendingUp} 
              label="Ranking" 
              active={activeTab === 'ranking'} 
              onClick={() => handleTabClick('ranking')}
            />
            {canAccessSettings && (
              <>
                <div className="h-px bg-white/10 my-1" />
                <div 
                  onClick={() => handleTabClick('settings')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                    activeTab === 'settings' 
                      ? 'bg-frost-500 text-white shadow-lg shadow-frost-500/40' 
                      : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <Settings size={22} />
                  <span className={`absolute left-14 px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 z-50 ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-blue-500 via-white to-blue-500 bg-clip-text text-transparent animate-gradient text-glow'
                      : 'bg-frost-900 text-white'
                  }`}>
                    Settings
                  </span>
                </div>
              </>
            )}
            {isLoggedIn ? (
              <SidebarItem 
                icon={LogOut} 
                label="Logout" 
                variant="danger"
                onClick={() => {
                  onLogoutClick();
                  setIsOpen(false);
                }}
              />
            ) : (
              <SidebarItem 
                icon={LogIn} 
                label="Login" 
                variant="success"
                onClick={() => {
                  onLoginClick();
                  setIsOpen(false);
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
