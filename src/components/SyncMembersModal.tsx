import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Users, FileText, Check, AlertCircle, Zap, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { logUpdateAction } from '../lib/updates';
import * as XLSX from 'xlsx';
import { AllianceMember, User } from '../types';
import { checkPermission } from '../lib/permissions';
import { parseNumber } from '../lib/utils';

interface SyncMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loggedInUser: User | null;
}

export const SyncMembersModal = ({ isOpen, onClose, onSuccess, loggedInUser }: SyncMembersModalProps) => {
  const [step, setStep] = useState(1);
  const [powerThreshold, setPowerThreshold] = useState(60000000);
  const [displayValue, setDisplayValue] = useState('60,000,000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    power: '',
    mana: '',
    deads: '',
    merits: '',
    kills: ''
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFileName(null);
      setPowerThreshold(60000000);
      setDisplayValue('60,000,000');
    }
  }, [isOpen]);

  const handlePowerChange = (val: string) => {
    // Remove non-numeric characters
    const numericValue = val.replace(/[^0-9]/g, '');
    if (numericValue === '') {
      setPowerThreshold(0);
      setDisplayValue('');
      return;
    }
    const num = parseInt(numericValue, 10);
    setPowerThreshold(num);
    setDisplayValue(num.toLocaleString('en-US'));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (jsonData.length > 0) {
      setAvailableColumns(jsonData[0]);
    }
  };

  const handleSync = async () => {
    if (!checkPermission(loggedInUser, ['1', '2'])) {
      toast.error('You do not have permission to sync members');
      return;
    }
    if (!fileInputRef.current?.files?.[0]) {
      toast.error('Please select a file first');
      return;
    }

    const file = fileInputRef.current.files[0];
    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

      const memberMap = new Map<string, AllianceMember>();

      jsonData.forEach((row: any) => {
        const idMember = String(row['Lord ID'] || row.idMember || '');
        const nameMember = row['Name'] || row['Lord'] || row.nameMember || '';
        const power = parseNumber(row[columnMapping.power] || row['Current Power'] || row['Top Power'] || row.power || 0);
        const manaUsed = parseNumber(row[columnMapping.mana] || row['Mana Spent'] || row['Mana Used (Current)'] || row.manaUsed || 0);
        const totalDead = parseNumber(row[columnMapping.deads] || row['Units Dead'] || row['Units Dead (Current)'] || row['Dead (Current)'] || row.totalDead || 0);
        const totalHealed = parseNumber(row['Units Healed (Current)'] || row['Units Healed'] || row.totalHealed || 0);
        const mertitAmount = parseNumber(row[columnMapping.merits] || row['Merits'] || row['Mertit'] || row['Merit'] || row.mertitAmount || 0);
        const totalKill = parseNumber(row[columnMapping.kills] || row['Units Killed'] || row['Kills'] || row['Total Kills'] || row.totalKill || 0);

        if (!nameMember || power < powerThreshold) {
          return;
        }
        
        if (memberMap.has(idMember)) {
          const existing = memberMap.get(idMember)!;
          existing.topPower = Math.max(existing.topPower, power);
          existing.manaUsed += manaUsed;
          existing.totalDead += totalDead;
          existing.totalHealed += totalHealed;
          const currentMerit = parseNumber(existing.totalMertit || 0) + mertitAmount;
          existing.totalMertit = String(currentMerit);
          const currentKill = parseNumber(existing.totalKill || 0) + totalKill;
          existing.totalKill = String(currentKill);
        } else {
          memberMap.set(idMember, {
            idMember,
            nameMember,
            topPower: power,
            manaUsed,
            totalDead,
            totalHealed,
            totalMertit: String(mertitAmount),
            totalKill: String(totalKill),
          });
        }
      });

      const processedMembers = Array.from(memberMap.values());

      if (processedMembers.length === 0) {
        throw new Error(`No members found matching the criteria (Power >= ${powerThreshold.toLocaleString()})`);
      }

      // Sync using upsert to avoid breaking foreign key constraints with historical data
      const { error: upsertError } = await supabase
        .from('Member')
        .upsert(processedMembers, { onConflict: 'idMember' });
      
      if (upsertError) throw upsertError;

      // Log the action
      if (loggedInUser) {
        await logUpdateAction(loggedInUser.fullNameUser || loggedInUser.nameUser, 'Update Member List');
      }

      toast.success(`Successfully synchronized ${processedMembers.length} members`);
      onSuccess();
      onClose();
      // Reset
      setStep(1);
      setFileName(null);
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(error?.message || 'Failed to synchronize members');
    } finally {
      setIsProcessing(false);
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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 100 }}
            className="relative w-full max-w-lg max-h-[90vh] sm:h-auto bg-[#0a0a0a] border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-frost-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-frost-500/20 border border-frost-500/30 flex items-center justify-center text-frost-400">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Sync Member List</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {step === 1 ? 'Step 1: Configuration' : step === 2 ? 'Step 2: Upload Member Data' : 'Step 3: Map Columns'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Minimum Power Threshold</label>
                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-frost-400" size={18} />
                      <input
                        type="text"
                        placeholder="e.g., 60,000,000"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-frost-500/50 transition-all font-mono"
                        value={displayValue}
                        onChange={(e) => handlePowerChange(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 px-1">Members with power below this value will be excluded from the synchronization.</p>
                  </div>
                  
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-frost-500 hover:bg-frost-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-frost-500/20"
                  >
                    Next: Upload File
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />

                  {!fileName ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-frost-500/30 transition-all flex flex-col items-center justify-center gap-4 group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-frost-400 transition-colors">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">Click to upload Member Excel</p>
                        <p className="text-xs text-slate-500 mt-1">Support .xlsx, .xls, .csv</p>
                      </div>
                    </button>
                  ) : (
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-frost-500/20 flex items-center justify-center text-frost-400">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white truncate max-w-[200px]">{fileName}</p>
                          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">File Ready</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFileName(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}

                  <div className="mt-8 space-y-4">
                    {step === 2 && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-slate-400 leading-relaxed">
                          <p className="font-bold text-blue-300 mb-1">Data Mapping Info:</p>
                          <p>• Power, Mana Used, Units Dead, Merits</p>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-4">
                        {Object.keys(columnMapping).map((key) => {
                          const filteredCols = availableColumns.filter(col => {
                            const lowerCol = col.toLowerCase();
                            if (key === 'power') return lowerCol.includes('power');
                            if (key === 'mana') return lowerCol.includes('mana');
                            if (key === 'deads') return lowerCol.includes('dead');
                            if (key === 'merits') return lowerCol.includes('merit');
                            if (key === 'kills') return lowerCol.includes('kill');
                            return true;
                          });
                          return (
                            <div key={key} className="space-y-1 relative">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key}</label>
                              <button
                                onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-frost-500/50 transition-all flex items-center justify-between hover:bg-white/10"
                              >
                                <span className="truncate mr-2">{columnMapping[key as keyof typeof columnMapping] || 'Select column'}</span>
                                <ChevronDown size={14} className={`text-slate-500 transition-transform ${openDropdown === key ? 'rotate-180' : ''}`} />
                              </button>
                              <AnimatePresence>
                                {openDropdown === key && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 10 }}
                                      className="absolute left-0 right-0 mt-1 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-48 overflow-y-auto scrollbar-hide"
                                    >
                                      <div className="p-1">
                                        {filteredCols.length > 0 ? (
                                          filteredCols.map(col => (
                                            <button
                                              key={col}
                                              onClick={() => {
                                                setColumnMapping(prev => ({ ...prev, [key]: col }));
                                                setOpenDropdown(null);
                                              }}
                                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all ${columnMapping[key as keyof typeof columnMapping] === col ? 'bg-frost-500/20 text-frost-400' : 'text-slate-300 hover:bg-white/5'}`}
                                            >
                                              {col}
                                            </button>
                                          ))
                                        ) : (
                                          <div className="px-3 py-2 text-xs text-slate-500">No matching columns</div>
                                        )}
                                      </div>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(prev => Math.max(1, prev - 1))}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-sm transition-all border border-white/10"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (step === 2) {
                            if (!fileName) {
                              toast.error('Please upload a file');
                              return;
                            }
                            setStep(3);
                          } else {
                            handleSync();
                          }
                        }}
                        disabled={isProcessing}
                        className="flex-[2] py-4 bg-frost-500 hover:bg-frost-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-frost-500/20 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            {step === 2 ? 'Next: Map Columns' : 'Start Sync'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
