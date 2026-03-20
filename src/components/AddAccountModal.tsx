import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Edit2, Trash2, User, Shield, Lock, Users, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { logUpdateAction } from '../lib/updates';
import { User as UserType } from '../types';
import { checkPermission } from '../lib/permissions';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInUser: UserType | null;
}

export const AddAccountModal = ({ isOpen, onClose, loggedInUser }: AddAccountModalProps) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setIsFormOpen(false);
      setFormData({});
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (user?: UserType) => {
    if (user) {
      const { passUser, ...rest } = user;
      setFormData(rest);
    } else {
      setFormData({
        roleUser: '2', // Default to AdminLeader
      });
    }
    setShowPassword(false);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!checkPermission(loggedInUser, ['1'])) {
      toast.error('You do not have permission to add/edit accounts');
      return;
    }
    if (!formData.nameUser || !formData.roleUser || !formData.fullNameUser) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (formData.id) {
        const { error } = await supabase
          .from('User')
          .update(formData)
          .eq('id', formData.id);
        if (error) throw error;

        if (loggedInUser) {
          await logUpdateAction(loggedInUser.fullNameUser || loggedInUser.nameUser, `Updated account: ${formData.nameUser}`);
        }

        toast.success('User updated successfully');
      } else {
        if (!formData.passUser) {
          toast.error('Password is required for new users');
          setIsSaving(false);
          return;
        }
        const { error } = await supabase
          .from('User')
          .insert(formData);
        if (error) throw error;

        if (loggedInUser) {
          await logUpdateAction(loggedInUser.fullNameUser || loggedInUser.nameUser, `Added account: ${formData.nameUser}`);
        }

        toast.success('User added successfully');
      }

      fetchUsers();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('User')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      if (loggedInUser) {
        const deletedUser = users.find(u => u.id === id);
        await logUpdateAction(loggedInUser.fullNameUser || loggedInUser.nameUser, `Deleted account: ${deletedUser?.nameUser || id}`);
      }

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(null);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (String(role)) {
      case '1': return { text: 'Superadmin', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case '2': return { text: 'AdminLeader', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      default: return { text: role, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' };
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
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-blue-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Manage Accounts</h2>
                  <p className="text-xs text-slate-400 mt-1">Add, edit, or remove system administrators</p>
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
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
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
                      {formData.id ? <Edit2 size={18} className="text-blue-400" /> : <Plus size={18} className="text-blue-400" />}
                      {formData.id ? 'Edit Account' : 'Add New Account'}
                    </h3>
                    <button 
                      onClick={handleCloseForm}
                      className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Back to List
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <User size={14} /> Full Name
                    </label>
                    <input
                      type="text"
                      name="fullNameUser"
                      value={formData.fullNameUser || ''}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User size={14} /> Username
                      </label>
                      <input
                        type="text"
                        name="nameUser"
                        value={formData.nameUser || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="Enter username"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Lock size={14} /> {formData.id ? 'Reset Password' : 'Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="passUser"
                          value={formData.passUser || ''}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors pr-10"
                          placeholder={formData.id ? "Enter new password to reset" : "Enter password"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Shield size={14} /> Role
                    </label>
                    <select
                      name="roleUser"
                      value={formData.roleUser || '2'}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      <option value="1" className="bg-[#1a1a1a]">Superadmin (1)</option>
                      <option value="2" className="bg-[#1a1a1a]">AdminLeader (2)</option>
                    </select>
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
                    <h3 className="text-sm font-bold text-slate-300">Existing Accounts ({users.length})</h3>
                    <button
                      onClick={() => handleOpenForm()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition-colors border border-blue-500/30"
                    >
                      <Plus size={14} /> Add New
                    </button>
                  </div>

                  {users.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                      <Users size={32} className="mx-auto text-slate-600 mb-3" />
                      <p className="text-slate-400 text-sm">No accounts found.</p>
                      <button
                        onClick={() => handleOpenForm()}
                        className="mt-4 text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors"
                      >
                        Create your first account
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div 
                          key={user.id} 
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-sm font-bold text-white truncate">{user.fullNameUser || user.nameUser}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleDisplay(user.roleUser).color}`}>
                                {getRoleDisplay(user.roleUser).text}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <User size={12} /> @{user.nameUser}
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield size={12} /> Role ID: {user.roleUser}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleOpenForm(user)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            {!(loggedInUser?.roleUser === '1' && user.roleUser === '1') && (
                              <button
                                onClick={() => user.id && handleDelete(user.id)}
                                disabled={isDeleting === user.id}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                {isDeleting === user.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            )}
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
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Account
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
