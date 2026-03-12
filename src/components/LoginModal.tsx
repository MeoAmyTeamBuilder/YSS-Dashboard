import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { User as UserType } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }: LoginModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('nameUser', username)
        .eq('passUser', password)
        .single();

      if (error || !data) {
        toast.error('Invalid username or password');
        return;
      }

      toast.success('Login successful');
      onLoginSuccess(data as UserType);
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md frost-glass p-8 rounded-[32px] border-white/10 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-frost-500 rounded-2xl flex items-center justify-center mx-auto mb-4 frost-glow shadow-lg">
                <ShieldCheck className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Commander Access</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Authentication Required</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-frost-500/50 focus:ring-1 focus:ring-frost-500/50 transition-all text-white"
                    placeholder="Enter your ID"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-frost-500/50 focus:ring-1 focus:ring-frost-500/50 transition-all text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-frost-500 hover:bg-frost-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-bold shadow-lg shadow-frost-500/20 transition-all mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Authorize Access'
                )}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Restricted to Officers Only
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
