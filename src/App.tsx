import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { MemberTable } from './components/MemberTable';
import { PowerChart } from './components/PowerChart';
import { RankingView, RankingTable } from './components/RankingView';
import { ProfileModal } from './components/ProfileModal';
import { SettingsView } from './components/SettingsView';
import { SeasonView } from './components/SeasonView';
import { LoginModal } from './components/LoginModal';
import { LeaderModal } from './components/LeaderModal';
import { MemberViolationView } from './components/MemberViolationView';
import { SignGHModal } from './components/SignGHModal';
import { SignGHListModal } from './components/SignGHListModal';
import { AllianceMember, AllianceInformation, User as UserType, SignGH } from './types';
import { Users, Zap, Shield, Trophy, Search, Plus, Filter, Upload, Crown, X, PieChart, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { getDirectDriveUrl, formatCompactNumber } from './lib/utils';
import * as XLSX from 'xlsx';

export default function App() {
  const [members, setMembers] = useState<AllianceMember[]>([]);
  const [signGHRegistrations, setSignGHRegistrations] = useState<SignGH[]>([]);
  const [allianceInfo, setAllianceInfo] = useState<AllianceInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserType | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isSignGHModalOpen, setIsSignGHModalOpen] = useState(false);
  const [isSignGHListModalOpen, setIsSignGHListModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'power' | 'mana' | 'dead' | 'healed'>('power');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [powerThreshold, setPowerThreshold] = useState<number>(60000000);
  const [historyKingdom, setHistoryKingdom] = useState<any>(null);
  const [checkRecords, setCheckRecords] = useState<any[]>([]);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  async function fetchData(background = false) {
    try {
      if (!background) setLoading(true);
      
      // Fetch HistoryKingdom
      const { data: historyData } = await supabase
        .from('HistoryKingdom')
        .select('*')
        .eq('status', '3')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      
      if (historyData) {
        setHistoryKingdom(historyData);
      }

      // Fetch CheckRecords
      const { data: recordsData } = await supabase
        .from('CheckRecord')
        .select('*')
        .order('dateRecord', { ascending: false });
      
      if (recordsData) {
        setCheckRecords(recordsData);
      }

      const { data: membersData, error: membersError } = await supabase
        .from('Member')
        .select('*')
        .order('topPower', { ascending: false });

      if (membersError) throw membersError;

      const { data: leadersData, error: leadersError } = await supabase
        .from('Leader')
        .select('*');

      if (leadersError) {
        console.error('Error fetching Leader data:', leadersError);
      }

      if (membersData) {
        const leaderMap = new Map();
        if (leadersData) {
          leadersData.forEach(l => leaderMap.set(l.idMember, l.roleMember));
        }
        const updatedMembers = membersData.map(m => ({
          ...m,
          roleMember: leaderMap.get(m.idMember) || m.roleMember || '1'
        }));
        setMembers(updatedMembers);
      }

      const { data: infoData, error: infoError } = await supabase
        .from('AllianceInformation')
        .select('*');
      
      if (infoError) {
        console.error('Error fetching AllianceInformation:', infoError);
      } else if (infoData && infoData.length > 0) {
        setAllianceInfo(infoData[0]);
      }

      // Fetch SignGH
      const { data: signGHData, error: signGHError } = await supabase
        .from('SignGH')
        .select('*');
      
      if (signGHError) {
        console.error('Error fetching SignGH:', signGHError);
      } else if (signGHData) {
        setSignGHRegistrations(signGHData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = async () => {
    setLoading(true);
    const { data: freshSignGHData, error } = await supabase
      .from('SignGH')
      .select('*');
    setLoading(false);

    if (error) {
      console.error('Error fetching SignGH:', error);
      toast.error('Error fetching data');
      return;
    }

    const approvedOnly = freshSignGHData.filter(r => {
      console.log('Record:', r);
      return r.stateSign === 1 || r.stateSign === '1' || r.stateSign === true;
    });
    console.log('Approved records:', approvedOnly);
    
    // Export all data if available, even if not approved, but prioritize approved
    const dataToExport = approvedOnly.length > 0 ? approvedOnly : freshSignGHData;
    
    if (freshSignGHData.length === 0) {
      toast.error('Database dont have data');
      return;
    }
    
    const data = dataToExport.map(r => ({
      ID: r.idMember,
      Name: r.nameMember,
      Speed: r.speedSign,
      'Pow up': r.targetPow,
      Status: r.stateSign === 1 || r.stateSign === '1' || r.stateSign === true ? 'Approved' : 'Pending'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "SignGH.xlsx");
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allianceInfo?.tagAlliance) {
      document.title = `${allianceInfo.tagAlliance} Alliance Dashboard | Call of Dragons`;
    }
  }, [allianceInfo]);

  const filteredMembers = members
    .filter(m => 
      m.nameMember.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.idMember.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortBy === 'power') return b.topPower - a.topPower;
      if (sortBy === 'mana') return b.manaUsed - a.manaUsed;
      if (sortBy === 'dead') return b.totalDead - a.totalDead;
      if (sortBy === 'healed') return b.totalHealed - a.totalHealed;
      return 0;
    });

  const totalPower = members.reduce((acc, m) => acc + m.topPower, 0);
  const totalMana = members.reduce((acc, m) => acc + m.manaUsed, 0);

  return (
    <div className="h-screen bg-[#050505] relative overflow-hidden flex flex-col">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#0a0a0a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0a0a0a',
            },
          },
        }}
      />
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-frost-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-frost-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isLoggedIn={isLoggedIn}
        loggedInUser={loggedInUser}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={() => {
          setIsLoggedIn(false);
          setLoggedInUser(null);
        }}
        historyKingdom={historyKingdom}
      />
      
      {/* Fixed Header */}
      <header className="px-8 pt-6 md:px-12 lg:px-16 flex-shrink-0 z-10">
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-2xl font-bold text-white mb-0.5 capitalize">
            {activeTab === 'overview' ? 'Overview' : 
             activeTab === 'members' ? 'Members' : 
             activeTab === 'ranking' ? 'Ranking' : 
             activeTab === 'violations' ? 'Member Violations' :
             activeTab === 'activity' ? (
               <>
                 Season{' '}
                 <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 animate-gradient drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
                   {historyKingdom?.titleHistory || 'History'}
                 </span>
               </>
             ) :
             'Settings'}
          </h2>
          <p className="text-xs text-slate-400">
            {activeTab === 'overview' ? (
              <>
                Welcome back, {isLoggedIn && loggedInUser ? (
                  <span className="font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">
                    {loggedInUser.fullNameUser || loggedInUser.nameUser}
                  </span>
                ) : (
                  "Commander"
                )}. Here is the current status of{' '}
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-gradient drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                  {allianceInfo?.nameAlliance || 'Alliance'}
                </span>
                {' | '}
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 animate-gradient drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
                  {allianceInfo?.serverAlliance || 'Server'}
                </span>
                .
              </>
            ) : 
             activeTab === 'members' ? `Manage and track the performance of warriors.` : 
             activeTab === 'ranking' ? `View the competitive standings of members.` : 
             activeTab === 'violations' ? `List of members who have violated alliance rules.` :
             activeTab === 'activity' ? `Track and analyze historical performance data for the current season.` :
             'Access alliance features and configurations.'}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 md:px-12 lg:px-16">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-[1600px] mx-auto h-full"
        >
          {activeTab === 'overview' && (
            <div className="h-full flex flex-col gap-6">
              {/* Main Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                
                {/* Right Side: Alliance Info Box (Moved to top on mobile) */}
                <div className="lg:col-span-1 order-first lg:order-last">
                  <div 
                    className={`frost-glass p-4 md:p-6 rounded-xl md:rounded-2xl border-frost-500/20 bg-gradient-to-br from-[#0a0a0a]/90 to-transparent backdrop-blur-xl flex flex-col h-auto lg:h-full cursor-pointer lg:cursor-default mb-2 lg:mb-0`}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setIsProfileModalOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-16 h-16 bg-frost-500 rounded-2xl flex items-center justify-center frost-glow shadow-2xl overflow-hidden">
                        {allianceInfo?.imageAlliance ? (
                          <img src={getDirectDriveUrl(allianceInfo.imageAlliance)} alt="Alliance" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Shield className="text-white" size={32} />
                        )}
                      </div>
                      <div>
                          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-white to-blue-500 animate-gradient tracking-tight text-glow">
                            {loading ? 'Loading...' : (allianceInfo?.nameAlliance || 'No data')}
                          </h1>
                        <p className="text-sm uppercase tracking-widest text-frost-400 font-bold">
                          {loading ? '...' : (allianceInfo?.tagAlliance || 'Alliance')}
                        </p>
                      </div>
                    </div>

                    <div className="hidden lg:block space-y-4 flex-1 mt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-sm font-bold text-slate-400">Leader</span>
                          <span className="text-sm font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">{members.find(m => m.roleMember === '3')?.nameMember || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-sm font-bold text-slate-400">Server</span>
                          <span className="text-sm font-bold text-white">{allianceInfo?.serverAlliance || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-sm font-bold text-slate-400">Time active</span>
                          <span className="text-sm font-bold text-white">{allianceInfo?.timeAlliance || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-sm font-bold text-slate-400">KPI</span>
                          <span className="text-sm font-bold text-white">{allianceInfo?.kpiAlliance || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-sm font-bold text-slate-400">Language</span>
                          <span className="text-sm font-bold text-white">{allianceInfo?.languageAlliance || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-base text-slate-400 leading-relaxed italic text-center line-clamp-3">
                          {allianceInfo?.desAlliance || '"United under the frost, we conquer the dragons."'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex-shrink-0 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <a 
                          href={allianceInfo?.zaloLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="p-3 rounded-xl bg-blue-200 text-blue-900 border border-blue-300 text-center text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Zalo
                        </a>
                        <a 
                          href={allianceInfo?.discordLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="p-3 rounded-xl bg-purple-200 text-purple-900 border border-purple-300 text-center text-sm font-bold hover:bg-purple-600 hover:text-white transition-all"
                        >
                          Discord
                        </a>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSignGHModalOpen(true);
                        }}
                        className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-xl text-sm tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                      >
                        <Zap size={18} />
                        Sign top GH
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all"
                      >
                        View Alliance Profile
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Left Side: 3 Rows Layout */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">
                  {/* Row 1: Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-shrink-0">
                    <StatCard 
                      label="Total Members" 
                      value={`${members.length} / 200`} 
                      icon={Users} 
                      trend={{ value: 'Live', isUp: true }}
                    />
                    <StatCard 
                      label="Total Power" 
                      value={totalPower > 1000000000 ? `${(totalPower / 1000000000).toFixed(2)}B` : `${(totalPower / 1000000).toFixed(1)}M`} 
                      icon={Zap} 
                      trend={{ value: 'Live', isUp: true }}
                    />
                  </div>

                  {/* Row 2: Ranking Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-shrink-0 md:h-[230px]">
                    <RankingTable 
                      title="Top Power" 
                      icon={Trophy} 
                      members={members} 
                      valueKey="topPower" 
                      valueLabel="Power" 
                      colorClass="text-amber-400" 
                      limit={3} 
                      variant="card"
                      badgeClass="bg-amber-400 text-black"
                    />
                    <RankingTable 
                      title="Top Total Mana Used" 
                      icon={Zap} 
                      members={members} 
                      valueKey="manaUsed" 
                      valueLabel="Total Mana" 
                      colorClass="text-frost-400" 
                      limit={3} 
                      variant="card"
                      badgeClass="bg-frost-400 text-black"
                    />
                  </div>

                  {/* Row 3: Power Distribution Chart */}
                  <div className="flex-1 min-h-0">
                    <div className="hidden md:block h-full">
                      <PowerChart members={members} />
                    </div>
                    <div 
                      className="md:hidden frost-glass p-4 rounded-xl md:rounded-2xl border-frost-500/10 flex flex-col cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => setIsChartModalOpen(true)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/5 text-purple-400">
                          <PieChart size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Power Distribution</h3>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="h-full flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
                <div className="flex gap-3 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search by name or ID..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-frost-500/50 focus:ring-1 focus:ring-frost-500/50 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-frost-500 hover:bg-frost-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-frost-500/20 transition-all whitespace-nowrap"
                    >
                      <Filter size={16} />
                      <span className="hidden sm:inline">Filter</span>
                    </button>
                    
                    {isFilterOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsFilterOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                          <div className="p-1">
                            <button 
                              onClick={() => { setSortBy('power'); setIsFilterOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${sortBy === 'power' ? 'bg-frost-500/20 text-frost-400' : 'text-slate-300 hover:bg-white/5'}`}
                            >
                              Sort by Power
                            </button>
                            <button 
                              onClick={() => { setSortBy('mana'); setIsFilterOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${sortBy === 'mana' ? 'bg-frost-500/20 text-frost-400' : 'text-slate-300 hover:bg-white/5'}`}
                            >
                              Sort by Total Mana Used
                            </button>
                            <button 
                              onClick={() => { setSortBy('dead'); setIsFilterOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${sortBy === 'dead' ? 'bg-frost-500/20 text-frost-400' : 'text-slate-300 hover:bg-white/5'}`}
                            >
                              Sort by Dead
                            </button>
                            <button 
                              onClick={() => { setSortBy('healed'); setIsFilterOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${sortBy === 'healed' ? 'bg-frost-500/20 text-frost-400' : 'text-slate-300 hover:bg-white/5'}`}
                            >
                              Sort by Healed
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setIsLeaderModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/10 transition-all whitespace-nowrap"
                  >
                    <Crown size={16} />
                    <span className="hidden sm:inline">List Leader</span>
                  </button>

                  <button 
                    onClick={() => setIsSignGHListModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-xl text-xs font-bold shadow-lg shadow-yellow-500/10 transition-all whitespace-nowrap"
                  >
                    <Zap size={16} />
                    <span className="hidden sm:inline">List Member GH</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <MemberTable members={filteredMembers} />
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <SeasonView 
              members={members} 
              checkRecords={checkRecords} 
              historyKingdom={historyKingdom}
            />
          )}

          {activeTab === 'ranking' && (
            <RankingView members={members} />
          )}

          {activeTab === 'violations' && (
            <MemberViolationView />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              loggedInUser={loggedInUser}
              onLeadershipUpdated={() => fetchData(true)}
              onSetPowerThreshold={setPowerThreshold}
              exportToExcel={exportToExcel}
            />
          )}

          {!['overview', 'members', 'ranking', 'settings', 'activity', 'violations'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-20 text-center h-full">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <Shield className="text-frost-500" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Feature Under Development</h2>
              <p className="text-slate-400 max-w-md">The {activeTab} function is being built by {allianceInfo?.tagAlliance || 'Alliance'} engineers. Please check back later!</p>
            </div>
          )}
        </motion.div>
      </main>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={(user) => {
          setIsLoggedIn(true);
          setLoggedInUser(user);
        }}
      />

      <LeaderModal 
        isOpen={isLeaderModalOpen}
        onClose={() => setIsLeaderModalOpen(false)}
        members={members}
      />

      <SignGHModal 
        isOpen={isSignGHModalOpen}
        onClose={() => setIsSignGHModalOpen(false)}
      />

      <SignGHListModal 
        isOpen={isSignGHListModalOpen}
        onClose={() => setIsSignGHListModalOpen(false)}
      />

      <AnimatePresence>
        {isChartModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChartModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl h-[60vh] bg-[#0a0a0a] border border-white/10 rounded-xl md:rounded-2xl overflow-hidden flex flex-col shadow-2xl p-6"
            >
              <button 
                onClick={() => setIsChartModalOpen(false)}
                className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex-1 min-h-0 mt-4">
                <PowerChart members={members} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fixed Footer */}
      <footer className="px-8 py-4 md:px-12 lg:px-16 border-t border-white/5 bg-[#050505]/80 backdrop-blur-md flex-shrink-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-end items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Develop by MeoAmy Team | Kitty 亗 17090807
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
