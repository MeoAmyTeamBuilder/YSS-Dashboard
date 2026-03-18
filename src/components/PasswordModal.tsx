import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordModal = ({ isOpen, onClose, onSuccess }: PasswordModalProps) => {
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (password === '090807') {
      toast.success('Đăng kí thành công');
      onSuccess();
      onClose();
      setPassword('');
    } else {
      toast.error('Sai mật khẩu');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-xs bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Enter Password</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  placeholder="Password..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <button 
                onClick={handleSubmit}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
