import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroScreen from './IntroScreen';
import ClickEffect from './ClickEffect';
import { 
  Briefcase, CheckCircle, Clock, Scale, TrendingUp, BrainCircuit,
  FileText, AlertTriangle, X, ChevronRight, User, Mail, FileCheck,
  Search, Bell, Settings, LayoutDashboard, FolderOpen, PieChart as PieChartIcon,
  LogOut, Activity, ArrowUpRight, Download, Check
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, BarChart, Bar
} from 'recharts';

// --- DATA ---
const intakeVolumeData = [
  { name: 'Mon', intakes: 4 }, { name: 'Tue', intakes: 7 }, { name: 'Wed', intakes: 5 },
  { name: 'Thu', intakes: 12 }, { name: 'Fri', intakes: 15 }, { name: 'Sat', intakes: 8 }, { name: 'Sun', intakes: 14 },
];

const sparklineData1 = [{v: 10},{v: 15},{v: 8},{v: 25},{v: 20},{v: 30},{v: 41}];
const sparklineData2 = [{v: 60},{v: 65},{v: 80},{v: 75},{v: 85},{v: 82},{v: 88}];

const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/19mDLzy0Xyx47CEABOO4Gi6WRkl-aqxOni2Iz8jrex8g/edit#gid=0';

const initialIntakes = [
  { id: 'INT-4921', client: 'Alice Johnson', email: 'alice@example.com', type: 'Divorce', status: 'Onboarded', aiConfidence: 0.98, time: '10 mins ago', desc: 'Client seeking legal separation and asset division.', driveUrl: 'https://drive.google.com/drive/search?q=Alice+Johnson' },
  { id: 'INT-4922', client: 'Ravi Kumar', email: 'ravi@example.com', type: 'Property', status: 'Onboarded', aiConfidence: 0.92, time: '2 hrs ago', desc: 'Dispute over boundary line with neighbor.', driveUrl: 'https://drive.google.com/drive/search?q=Ravi+Kumar' },
  { id: 'INT-4923', client: 'Susan Park', email: 'susan@example.com', type: 'Contract', status: 'Onboarded', aiConfidence: 0.89, time: '3 hrs ago', desc: 'Breach of employment contract by former employer.', driveUrl: 'https://drive.google.com/drive/search?q=Susan+Park' },
  { id: 'INT-4924', client: 'David Smith', email: 'david@example.com', type: 'Unknown', status: 'Manual Review', aiConfidence: 0.45, time: '5 hrs ago', desc: 'Complex corporate merger and acquisition advice needed.', driveUrl: 'https://drive.google.com/drive/my-drive' },
  { id: 'INT-4925', client: 'Emma Wilson', email: 'emma@example.com', type: 'Property', status: 'Onboarded', aiConfidence: 0.95, time: '1 day ago', desc: 'Landlord refusing to return security deposit.', driveUrl: 'https://drive.google.com/drive/search?q=Emma+Wilson' },
  { id: 'INT-4926', client: 'John Doe', email: 'john@example.com', type: 'Divorce', status: 'Onboarded', aiConfidence: 0.99, time: '1 day ago', desc: 'Uncontested divorce filing.', driveUrl: 'https://drive.google.com/drive/search?q=John+Doe' },
  { id: 'INT-4927', client: 'Sarah Lee', email: 'sarah@example.com', type: 'Contract', status: 'Manual Review', aiConfidence: 0.65, time: '2 days ago', desc: 'Vendor agreement terms dispute and intellectual property.', driveUrl: 'https://drive.google.com/drive/search?q=Sarah+Lee' },
];

const recentActivity = [
  { text: 'Automated email sent to Alice Johnson', time: '10 mins ago', icon: Mail, color: 'text-blue-500' },
  { text: 'New Drive Folder created for INT-4921', time: '11 mins ago', icon: FolderOpen, color: 'text-emerald-500' },
  { text: 'AI routed Property case to Real Estate Dept', time: '2 hrs ago', icon: BrainCircuit, color: 'text-purple-500' },
  { text: 'Manual review flagged for INT-4924', time: '5 hrs ago', icon: AlertTriangle, color: 'text-yellow-500' },
];

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

// --- SHARED UI COMPONENTS ---

const ModalOverlay = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
  <AnimatePresence>
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-3xl neo-panel rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
        className="fixed bottom-10 left-1/2 z-50 flex items-center gap-3 bg-white text-black px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(255,255,255,0.2)] font-medium"
      >
        <Check className="w-5 h-5 text-emerald-500" />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

const MetricCard = ({ title, value, subtext, icon: Icon, trend, sparkData, color }: any) => (
  <div className="neo-panel p-5 rounded-xl flex flex-col justify-between h-[140px] transition-all duration-300 hover:border-gray-600">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-400">{title}</span>
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <ArrowUpRight className="w-3 h-3 mr-1"/> {trend}
        </span>
      )}
    </div>
    <div className="flex justify-between items-end mt-4">
      <div>
        <h3 className="text-3xl font-bold tracking-tight text-white mb-1">{value}</h3>
        <p className="text-xs text-gray-500">{subtext}</p>
      </div>
      {sparkData && (
        <div className="w-24 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  </div>
);

// --- MAIN APP ---

function App() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedIntake, setSelectedIntake] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => setMounted(true), []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const generateReport = () => {
    showToast("Generating CSV report...");
    const headers = ["ID", "Client", "Email", "Matter Type", "Status", "AI Confidence"];
    const csvRows = [headers.join(',')];
    
    filteredIntakes.forEach(intake => {
      const row = [
        intake.id,
        `"${intake.client}"`,
        intake.email,
        intake.type,
        intake.status,
        intake.aiConfidence
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Intake_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => showToast("Report downloaded successfully!"), 1000);
  };

  // Filter intakes based on search query globally
  const filteredIntakes = useMemo(() => {
    return initialIntakes.filter(i => 
      i.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const dynamicCaseTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIntakes.forEach(i => counts[i.type] = (counts[i.type] || 0) + 1);
    return Object.entries(counts).map(([name, value], idx) => ({ name, value, color: COLORS[idx % COLORS.length] }));
  }, [filteredIntakes]);

  if (!mounted) return null;

  // Show the cinematic intro until it completes
  if (showIntro) {
    return (
      <>
        <ClickEffect />
        <IntroScreen onComplete={() => setShowIntro(false)} />
      </>
    );
  }

  // --- VIEWS ---

  const renderDashboard = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Overview</h1>
          <p className="text-gray-400 text-sm">Monitor live AI routing and intake volumes across the firm.</p>
        </div>
        <button onClick={generateReport} className="neo-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard title="Total Intakes (Week)" value={filteredIntakes.length.toString()} subtext="Active filtering" icon={Briefcase} trend="+28%" sparkData={sparklineData1} color="#3B82F6" />
        <MetricCard title="AI Auto-Routed" value="88%" subtext="Required no human touch" icon={BrainCircuit} trend="+5%" sparkData={sparklineData2} color="#8B5CF6" />
        <MetricCard title="Pending Review" value={filteredIntakes.filter(i => i.status !== 'Onboarded').length.toString()} subtext="Requires attorney validation" icon={AlertTriangle} color="#F59E0B" />
        <MetricCard title="Avg Onboarding" value="1.8m" subtext="Time from form to folder" icon={Clock} color="#10B981" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="neo-panel p-6 rounded-2xl xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Intake Volume Trend</h2>
            <select className="bg-[#171717] border border-[#262626] text-sm text-gray-300 rounded-lg px-3 py-1 outline-none">
              <option>Past 7 days</option>
              <option>Past 30 days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intakeVolumeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIntakes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/><stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" tick={{ fill: '#737373', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} cursor={{ stroke: '#525252', strokeWidth: 1 }}/>
                <Area type="monotone" dataKey="intakes" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorIntakes)" activeDot={{ r: 6, fill: '#fff', stroke: '#000', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="neo-panel p-6 rounded-2xl flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-2">Matter Types</h2>
          <p className="text-xs text-gray-500 mb-6">Real-time breakdown</p>
          <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dynamicCaseTypes} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {dynamicCaseTypes.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #262626', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
              <span className="text-3xl font-bold text-white">{filteredIntakes.length}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="neo-panel rounded-2xl overflow-hidden xl:col-span-2 flex flex-col">
          <div className="p-5 border-b border-[#262626] flex justify-between items-center bg-[#050505]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">Live Case Stream</h2>
            <button onClick={() => setActiveTab('Intakes')} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center">
              View All DB <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A0A0A] text-gray-500 text-[10px] uppercase tracking-wider border-b border-[#262626]">
                  <th className="py-3 px-5 font-semibold">Case ID</th>
                  <th className="py-3 px-5 font-semibold">Client</th>
                  <th className="py-3 px-5 font-semibold">Matter</th>
                  <th className="py-3 px-5 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredIntakes.slice(0, 4).map((intake, i) => (
                  <tr key={intake.id} onClick={() => setSelectedIntake(intake)} className="border-b border-[#1A1A1A] hover:bg-[#171717] transition-colors cursor-pointer">
                    <td className="py-4 px-5 font-mono text-xs text-blue-400">{intake.id}</td>
                    <td className="py-4 px-5 font-medium text-gray-200">{intake.client}</td>
                    <td className="py-4 px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#1A1A1A] text-gray-300 border border-[#262626]">{intake.type}</span></td>
                    <td className="py-4 px-5">
                      <div className="w-12 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden inline-block mr-2 align-middle">
                        <div className={`h-full ${intake.aiConfidence > 0.8 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${intake.aiConfidence * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 font-mono">{(intake.aiConfidence * 100).toFixed(0)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="neo-panel rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#262626] bg-[#050505]"><h2 className="text-lg font-semibold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-gray-400" />System Activity</h2></div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#262626] before:to-transparent">
              {recentActivity.map((act, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full border border-[#262626] bg-[#0A0A0A] flex items-center justify-center shrink-0 z-10 ${act.color}`}><act.icon className="w-3.5 h-3.5" /></div>
                  <div className="pt-1"><p className="text-sm text-gray-300 font-medium">{act.text}</p><p className="text-xs text-gray-500 mt-1">{act.time}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderIntakes = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Master Intake Log</h1>
        <p className="text-gray-400 text-sm">Full database of all leads processed by the AI.</p>
      </div>
      <div className="neo-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-[#262626] bg-[#050505] flex justify-between">
          <h2 className="font-semibold">All Cases ({filteredIntakes.length})</h2>
          <button onClick={generateReport} className="text-xs text-blue-400 border border-blue-400/30 px-3 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20">Export CSV</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#050505] z-10 border-b border-[#262626]">
              <tr className="text-gray-500 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-5 font-semibold">ID</th><th className="py-3 px-5 font-semibold">Client</th><th className="py-3 px-5 font-semibold">Matter</th><th className="py-3 px-5 font-semibold">Confidence</th><th className="py-3 px-5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredIntakes.map((intake) => (
                <tr key={intake.id} onClick={() => setSelectedIntake(intake)} className="border-b border-[#1A1A1A] hover:bg-[#171717] cursor-pointer">
                  <td className="py-4 px-5 font-mono text-xs text-gray-400">{intake.id}</td>
                  <td className="py-4 px-5 font-medium text-gray-200">{intake.client}</td>
                  <td className="py-4 px-5 text-gray-400">{intake.type}</td>
                  <td className="py-4 px-5 text-gray-400 font-mono">{(intake.aiConfidence * 100).toFixed(0)}%</td>
                  <td className="py-4 px-5"><span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${intake.status === 'Onboarded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{intake.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderAnalytics = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Deep Analytics</h1>
        <p className="text-gray-400 text-sm">AI routing performance and volume breakdowns.</p>
      </div>
      <div className="neo-panel p-8 rounded-2xl">
        <h2 className="text-xl font-semibold mb-6">Matter Intake by Day (Detailed)</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intakeVolumeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="name" stroke="#525252" />
              <YAxis stroke="#525252" />
              <RechartsTooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #262626' }} />
              <Bar dataKey="intakes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Workflow Settings</h1>
      <div className="space-y-6">
        <div className="neo-panel p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 border-b border-[#262626] pb-2">API Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">Google Gemini API Key</label>
              <input type="password" value="*************************" readOnly className="w-full bg-[#171717] border border-[#262626] rounded-lg px-4 py-2 text-gray-300 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">n8n Webhook URL</label>
              <input type="text" value="https://n8n.antigravity.legal/webhook/intake" readOnly className="w-full bg-[#171717] border border-[#262626] rounded-lg px-4 py-2 text-gray-300 outline-none" />
            </div>
          </div>
          <button onClick={() => showToast("Keys saved successfully")} className="neo-btn mt-6 px-6 py-2 rounded-lg text-sm w-full">Save Configuration</button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-screen overflow-hidden relative"
    >
      <ClickEffect />
      <Toast message={toastMessage} visible={toastMessage !== ''} />


      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-[#262626] bg-[#0A0A0A] flex flex-col justify-between shrink-0 transition-all duration-300 z-20">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-[#262626]">
            <Scale className="w-8 h-8 text-white" />
            <span className="ml-3 font-bold text-lg hidden lg:block tracking-wide">Antigravity</span>
          </div>
          <nav className="mt-6 flex flex-col gap-2 px-3">
            {[
              { id: 'Dashboard', icon: LayoutDashboard },
              { id: 'Intakes', icon: Briefcase },
              { id: 'Analytics', icon: PieChartIcon },
              { id: 'Settings', icon: Settings },
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:bg-[#171717] hover:text-white'}`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium hidden lg:block">{item.id}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#262626]">
          <button onClick={() => setIsSignOutModalOpen(true)} className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-medium hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#262626] bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-30">
          {/* Search with suggestions dropdown */}
          <div className="relative w-64 lg:w-96">
            <div className={`flex items-center bg-[#171717] border rounded-full px-4 py-2 transition-colors ${isSearchFocused ? 'border-gray-400' : 'border-[#262626]'}`}>
              <button onClick={() => document.getElementById('global-search')?.focus()} className="outline-none">
                <Search className="w-4 h-4 text-gray-500 mr-2 hover:text-white transition-colors" />
              </button>
              <input 
                id="global-search"
                type="text" 
                placeholder="Search by client name, ID, or matter..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500" 
              />
              {searchQuery && <X className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.trim().length > 0 && (() => {
                const suggestions = initialIntakes.filter(i =>
                  i.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  i.type.toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, 5);
                if (suggestions.length === 0) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full mt-2 left-0 right-0 bg-[#0A0A0A] border border-[#262626] rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-3 py-2 border-b border-[#1A1A1A]">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Suggestions</p>
                    </div>
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onMouseDown={() => {
                          setSearchQuery(s.client);
                          setSelectedIntake(s);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#171717] transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                          {s.client.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{s.client}</p>
                          <p className="text-xs text-gray-500">{s.id} &bull; {s.type}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          s.status === 'Onboarded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>{s.status}</span>
                      </button>
                    ))}
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-xs font-semibold text-emerald-500 hidden sm:inline-block">System Connected</span>
            </div>
            <button onClick={() => showToast("No new notifications")} className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative">
              <div 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 border border-[#262626] flex items-center justify-center font-bold text-xs text-white cursor-pointer hover:border-gray-400 transition-colors"
              >
                AL
              </div>
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-48 bg-[#0A0A0A] border border-[#262626] rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-[#262626]">
                      <p className="text-sm text-white font-semibold">Antigravity Legal</p>
                      <p className="text-xs text-gray-500">Admin Account</p>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { setIsProfileDropdownOpen(false); setActiveTab('Settings'); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Account Settings
                      </button>
                      <button onClick={() => { setIsProfileDropdownOpen(false); setIsSignOutModalOpen(true); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 mt-1">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'Dashboard' && <motion.div key="dash"><>{renderDashboard()}</></motion.div>}
            {activeTab === 'Intakes' && <motion.div key="int"><>{renderIntakes()}</></motion.div>}
            {activeTab === 'Analytics' && <motion.div key="ana"><>{renderAnalytics()}</></motion.div>}
            {activeTab === 'Settings' && <motion.div key="set"><>{renderSettings()}</></motion.div>}
          </AnimatePresence>
        </div>
      </main>

      {/* MODALS */}
      {selectedIntake && (
        <ModalOverlay onClose={() => setSelectedIntake(null)}>
          <div className="bg-[#0A0A0A] flex flex-col">
            <div className="p-6 border-b border-[#262626] flex justify-between items-start bg-[#050505]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">{selectedIntake.client}</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${selectedIntake.status === 'Onboarded' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                    {selectedIntake.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">ID: {selectedIntake.id} • {selectedIntake.time}</p>
              </div>
              <button onClick={() => setSelectedIntake(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#121212] border border-[#262626] p-4 rounded-xl">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><User className="w-3 h-3"/> Contact</h3>
                  <p className="text-sm text-gray-200 mb-1">{selectedIntake.client}</p>
                  <p className="text-xs text-blue-400 flex items-center gap-1.5"><Mail className="w-3 h-3"/> {selectedIntake.email}</p>
                </div>
                <div className="bg-[#121212] border border-[#262626] p-4 rounded-xl">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><BrainCircuit className="w-3 h-3"/> AI Analysis</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Category</span>
                    <span className="text-xs font-medium text-gray-200 bg-[#262626] px-2 py-0.5 rounded">{selectedIntake.type}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">Confidence</span><span className="text-gray-200 font-mono">{(selectedIntake.aiConfidence * 100).toFixed(0)}%</span></div>
                    <div className="h-1 bg-[#262626] rounded-full w-full overflow-hidden">
                      <div className={`h-full ${selectedIntake.aiConfidence > 0.8 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${selectedIntake.aiConfidence * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#121212] border border-[#262626] p-4 rounded-xl">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><FileCheck className="w-3 h-3"/> Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedIntake.desc}</p>
              </div>
              <div className="pt-2 flex justify-end gap-3 flex-wrap">
                <button onClick={() => setSelectedIntake(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#1A1A1A] transition-colors">Close</button>
                <button 
                  onClick={() => { showToast("Opening Google Sheets log..."); window.open(SHEETS_URL, '_blank'); }}
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-[#262626] text-gray-300 hover:text-white hover:bg-[#1A1A1A] transition-colors"
                >
                  <FileText className="w-4 h-4 text-emerald-400" /> View in Sheets
                </button>
                <button 
                  onClick={() => { showToast("Opening Google Drive..."); window.open(selectedIntake.driveUrl, '_blank'); }}
                  className="neo-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  Open Drive Folder <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {isSignOutModalOpen && (
        <ModalOverlay onClose={() => setIsSignOutModalOpen(false)}>
          <div className="bg-[#0A0A0A] p-6 text-center max-w-sm mx-auto">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Sign Out</h2>
            <p className="text-sm text-gray-400 mb-6">Are you sure you want to log out of the secure intake dashboard?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setIsSignOutModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#1A1A1A] w-full">Cancel</button>
              <button onClick={() => { setIsSignOutModalOpen(false); showToast("Signed out successfully"); }} className="neo-btn px-4 py-2 rounded-lg text-sm w-full bg-red-500 text-white hover:bg-red-600 border-none">Sign Out</button>
            </div>
          </div>
        </ModalOverlay>
      )}

    </motion.div>
  );
}

export default App;
