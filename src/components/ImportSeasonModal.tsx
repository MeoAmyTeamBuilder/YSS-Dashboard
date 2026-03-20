import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Database, FileText, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { logUpdateAction } from '../lib/updates';
import * as XLSX from 'xlsx';

import { User } from '../types';
import { checkPermission } from '../lib/permissions';

interface ImportSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
  loggedInUser: User | null;
}

export const ImportSeasonModal = ({ isOpen, onClose, onImportSuccess, loggedInUser }: ImportSeasonModalProps) => {
  const [step, setStep] = useState(1);
  const [nameRecord, setNameRecord] = useState('');
  const [dateRecord, setDateRecord] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    merits: '',
    mana: '',
    deads: '',
    heals: '',
    kills: ''
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImport = async () => {
    if (!checkPermission(loggedInUser, ['1'])) {
      toast.error('You do not have permission to import season');
      return;
    }
    if (!fileInputRef.current?.files?.[0]) {
      toast.error('Please select a file first');
      return;
    }

    if (!nameRecord || !dateRecord) {
      toast.error('Please fill in record name and date');
      return;
    }

    const file = fileInputRef.current.files[0];
    setIsProcessing(true);

    try {
      // 0. Fetch all members to map idMember (string) to Number(idMember)
      const { data: members, error: membersError } = await supabase
        .from('Member')
        .select('id, idMember');
      
      if (membersError) throw membersError;
      
      const memberMap = new Map<string, number>();
      members.forEach(m => {
        if (m.idMember) {
          memberMap.set(String(m.idMember).trim().toLowerCase(), Number(m.idMember));
        }
      });

      // 1. Create CheckRecord first
      const { data: recordData, error: recordError } = await supabase
        .from('CheckRecord')
        .insert([{ nameRecord, dateRecord }])
        .select()
        .single();

      if (recordError) throw recordError;
      const idCheckRecord = recordData.id;

      // 2. Process Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        throw new Error('The file is empty');
      }

      const hasMetricMapping = ['merits', 'mana', 'deads', 'heals', 'kills'].some(key => columnMapping[key as keyof typeof columnMapping] !== '');
      if (!hasMetricMapping) {
        throw new Error('Please map at least one metric column (Merits, Mana, Deads, Heals, or Kills) before importing.');
      }

      const manaRecords: any[] = [];
      const mertitRecords: any[] = [];
      const deadRecords: any[] = [];
      const healRecords: any[] = [];
      const killRecords: any[] = [];

      const parseNumber = (val: any) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        const str = String(val).replace(/,/g, '').trim();
        const num = Number(str);
        return isNaN(num) ? 0 : num;
      };

      let foundLordId = false;
      jsonData.forEach((row) => {
        let lordId = String(row['Lord ID'] || row.idMember || row['idMember'] || row['ID'] || '').trim();
        if (lordId.endsWith('.0')) {
          lordId = lordId.slice(0, -2);
        }
        if (lordId) foundLordId = true;
        
        const internalId = memberMap.get(lordId.toLowerCase());
        if (!internalId) return;

        // Mana
        const manaUsed = parseNumber(row[columnMapping.mana]);
        if (manaUsed !== 0) {
          manaRecords.push({
            idCheckRecord,
            idMember: internalId,
            manas: manaUsed // Updated from 'deads' to 'manas'
          });
        }

        // Mertit (negative becomes 0)
        let mertitAmount = parseNumber(row[columnMapping.merits]);
        if (mertitAmount < 0) mertitAmount = 0;
        if (mertitAmount !== 0) {
          mertitRecords.push({
            idCheckRecord,
            idMember: internalId,
            mertits: mertitAmount
          });
        }

        // Dead
        const deadAmount = parseNumber(row[columnMapping.deads]);
        if (deadAmount !== 0) {
          deadRecords.push({
            idCheckRecord,
            idMember: internalId,
            deads: deadAmount
          });
        }

        // Heal
        const healAmount = parseNumber(row[columnMapping.heals]);
        if (healAmount !== 0) {
          healRecords.push({
            idCheckRecord,
            idMember: internalId,
            heals: healAmount
          });
        }

        // Kill
        const killAmount = parseNumber(row[columnMapping.kills]);
        if (killAmount !== 0) {
          killRecords.push({
            idCheckRecord,
            idMember: internalId,
            kills: killAmount
          });
        }
      });

      if (!foundLordId) {
        throw new Error('Could not find Lord ID in the uploaded file. Ensure the column is named "Lord ID" or "idMember".');
      }

      if (manaRecords.length === 0 && mertitRecords.length === 0 && deadRecords.length === 0 && healRecords.length === 0 && killRecords.length === 0) {
        throw new Error('No valid data found to import. Please check your column mapping and ensure Lord IDs match the member list.');
      }

      // Insert into Supabase
      if (manaRecords.length > 0) {
        const { error } = await supabase.from('CheckMana').insert(manaRecords);
        if (error) throw error;
      }

      if (mertitRecords.length > 0) {
        const { error } = await supabase.from('CheckMertit').insert(mertitRecords);
        if (error) throw error;
      }

      if (deadRecords.length > 0) {
        const { error } = await supabase.from('CheckDead').insert(deadRecords);
        if (error) throw error;
      }

      if (healRecords.length > 0) {
        const { error } = await supabase.from('CheckHeal').insert(healRecords);
        if (error) throw error;
      }

      if (killRecords.length > 0) {
        const { error } = await supabase.from('CheckKill').insert(killRecords);
        if (error) throw error;
      }

      // Log the action
      if (loggedInUser) {
        await logUpdateAction(loggedInUser.fullNameUser || loggedInUser.nameUser, 'Import Season Data');
      }

      toast.success(`Successfully imported ${jsonData.length} records for "${nameRecord}"`);
      if (onImportSuccess) onImportSuccess();
      onClose();
      // Reset state
      setStep(1);
      setNameRecord('');
      setFileName(null);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error?.message || 'Failed to import season data');
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
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Database size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Import Season Data</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {step === 1 ? 'Step 1: Record Information' : step === 2 ? 'Step 2: Upload Data File' : 'Step 3: Map Columns'}
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Record Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Season 1 - Week 4"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
                      value={nameRecord}
                      onChange={(e) => setNameRecord(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Record Date</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
                      value={dateRecord}
                      onChange={(e) => setDateRecord(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!nameRecord) {
                        toast.error('Please enter a record name');
                        return;
                      }
                      setStep(2);
                    }}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                  >
                    Next: Upload Data
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
                      className="w-full aspect-video rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all flex flex-col items-center justify-center gap-4 group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-amber-400 transition-colors">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">Click to upload Excel file</p>
                        <p className="text-xs text-slate-500 mt-1">Support .xlsx, .xls, .csv</p>
                      </div>
                    </button>
                  ) : (
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
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
                          <p className="font-bold text-blue-300 mb-1">Required Columns:</p>
                          <p>• Lord ID / idMember</p>
                          <p>• Name / nameMember</p>
                          <p>• Mana Used (Change) / Merits (Change) / Units Dead (Change)</p>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-4">
                        {Object.keys(columnMapping).map((key) => {
                          const filteredCols = availableColumns.filter(col => {
                            const lowerCol = col.toLowerCase();
                            if (key === 'merits') return lowerCol.includes('merit');
                            if (key === 'mana') return lowerCol.includes('mana');
                            if (key === 'deads') return lowerCol.includes('dead');
                            if (key === 'heals') return lowerCol.includes('heal');
                            if (key === 'kills') return lowerCol.includes('kill');
                            return true;
                          });
                          return (
                            <div key={key} className="space-y-1 relative">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key}</label>
                              <button
                                onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all flex items-center justify-between hover:bg-white/10"
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
                                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all ${columnMapping[key as keyof typeof columnMapping] === col ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-white/5'}`}
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
                            handleImport();
                          }
                        }}
                        disabled={isProcessing}
                        className="flex-[2] py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            {step === 2 ? 'Next: Map Columns' : 'Start Import'}
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
