
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, Target, CheckCircle, Search, ExternalLink, Globe, Zap, Cpu, 
  Terminal, Activity, Radar, Layers, Binary, Compass, 
  Library, AlertTriangle, Youtube, MonitorPlay, ShieldCheck, Clock, 
  LayoutDashboard, Sparkles, TrendingUp, DollarSign, Briefcase, Share2, PlayCircle, SignalHigh, SignalMedium, SignalLow, Key
} from 'lucide-react';
import { analyzeResume } from './services/geminiService';
import { hasAiStudioKeySelector, hasSelectedAiStudioApiKey, openAiStudioKeySelector } from './services/geminiConfig';
import { CareerAnalysis, CareerRole, ClarityModule } from './types';
import ChatBot from './components/ChatBot';
import ProgressDashboard from './components/ProgressDashboard';

const IsometricCubeLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} text-amber-500/80`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
      <path d="M50 20 L75 35 L50 50 L25 35 Z" />
      <path d="M42 46 L25 37.5 L25 62.5 L42 71" />
      <path d="M58 46 L75 37.5 L75 62.5 L58 71" />
    </g>
    <text x="76" y="28" fill="currentColor" fontSize="24" fontWeight="900" fontFamily="Rajdhani">3</text>
  </svg>
);

const MobileSignalTower = ({ score }: { score: number }) => {
  const bars = [20, 40, 60, 80, 100];
  return (
    <div className="flex items-end gap-[2px] h-5 mb-1">
      {bars.map((threshold, i) => (
        <div 
          key={i} 
          className={`w-1 rounded-t-[1px] transition-all duration-700 ${i === 0 ? 'h-1.5' : i === 1 ? 'h-2.5' : i === 2 ? 'h-3.5' : i === 3 ? 'h-4.5' : 'h-5.5'} ${score >= threshold ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-800'}`}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState<string>(CareerRole.DATA_SCIENTIST);
  const [loading, setLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [matchScoreDisplay, setMatchScoreDisplay] = useState(0);
  const [readinessScoreDisplay, setReadinessScoreDisplay] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [preferFree, setPreferFree] = useState(true);
  
  const INITIAL_MODULES: ClarityModule[] = [
    { id: 'self', title: 'Audit Profile', description: 'Deep-scanning professional dossier & skill matrix.', status: 'in-progress', category: 'Self-Assessment' },
    { id: 'market', title: 'Market Pulse', description: 'Grounding data against 2025 hiring vectors.', status: 'locked', category: 'Market Research' },
    { id: 'decision', title: 'Strategic Pivot', description: 'Synthesizing alignment and opportunity paths.', status: 'locked', category: 'Decision Making' },
    { id: 'implementation', title: 'Execution 30', description: 'Initializing tactical 30-day deployment.', status: 'locked', category: 'Implementation' }
  ];
  const [modules, setModules] = useState<ClarityModule[]>(INITIAL_MODULES);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Proactive Key Check on Launch
  useEffect(() => {
    const checkAuth = async () => {
      if (hasAiStudioKeySelector()) {
        const hasKey = await hasSelectedAiStudioApiKey();
        if (!hasKey) {
          setIsAuthError(true);
          setError("Neural Link Standby: Authorization required.");
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (analysis) {
      setMatchScoreDisplay(0);
      setReadinessScoreDisplay(0);
      const timer = setTimeout(() => {
        setMatchScoreDisplay(analysis.matchScore);
        setReadinessScoreDisplay(analysis.readinessScore);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [analysis]);

  const allResources = useMemo(() => {
    if (!analysis) return [];
    return analysis.actionPlan.flatMap(week => week.resources || []);
  }, [analysis]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError("Protocol Error: Dossier must be in .PDF format.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setIsAuthError(false);
    }
  };

  const handleOpenKeySelector = async () => {
    const opened = await openAiStudioKeySelector();
    if (opened) {
      setError(null);
      setIsAuthError(false);
    } else {
      setError("Security Protocol: Set VITE_GEMINI_API_KEY in your .env file or hosting environment.");
    }
  };

  const runAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setIsAuthError(false);
    setAnalysis(null);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;
      const result = await analyzeResume(base64, file.type, role, preferFree);
      setLoading(false);
      setIsSynthesizing(true);
      setTimeout(() => {
        setAnalysis(result);
        setIsSynthesizing(false);
        setModules(prev => [
          { ...prev[0], status: 'completed' },
          { ...prev[1], status: 'in-progress' },
          { ...prev[2], status: 'locked' },
          { ...prev[3], status: 'locked' }
        ]);
      }, 1500);
    } catch (err: any) {
      console.error("Audit Failure:", err);
      const msg = err.message || "";
      if (msg.includes("AUTHORIZATION_REQUIRED")) {
        setError(
          msg.includes("Missing Gemini API key")
            ? "Security Protocol: Set VITE_GEMINI_API_KEY in your .env file or hosting environment."
            : "Security Protocol: Select a valid API Key from a PAID project."
        );
        setIsAuthError(true);
      } else {
        setError(msg || "Sync Failure: Intelligence link timed out.");
      }
      setLoading(false);
      setIsSynthesizing(false);
    }
  };

  const filteredGroups = useMemo(() => {
    const core = [CareerRole.DATA_SCIENTIST, CareerRole.SOFTWARE_ENGINEER, CareerRole.BUSINESS_ANALYST];
    const allRoles = Object.values(CareerRole) as string[];
    const groups = [
      { label: "Core Vectors", roles: core as string[] },
      { label: "Global Specializations", roles: allRoles.filter(v => !core.includes(v as any)) }
    ];
    return groups.map(group => ({
      ...group,
      roles: group.roles.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(group => group.roles.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-black text-slate-100 font-google selection:bg-amber-500 selection:text-black">
      <nav className="h-28 border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-[100] flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-6 group cursor-pointer">
          <IsometricCubeLogo className="w-20 h-20 transition-transform duration-500 group-hover:rotate-12" />
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-widest text-white leading-none glitch" data-text="CAREER CLARITY CORE">
              CAREER CLARITY <span className="text-amber-500">CORE</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500/60">Intelligence Status</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Search Engaged</span>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-amber-500/40" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 shadow-2xl lg:sticky lg:top-36 relative overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2 relative z-10">
              <Terminal className="w-3 h-3" /> Command Terminal
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="relative" ref={searchContainerRef}>
                <label className="text-[9px] font-black uppercase tracking-widest text-amber-500/60 mb-2 block">Target Vector</label>
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-left flex items-center justify-between hover:border-amber-500/40 transition-all"
                >
                  <span className="truncate uppercase">{role}</span>
                  <Radar className={`w-4 h-4 transition-transform ${isSearchOpen ? 'rotate-180 text-amber-500' : 'text-slate-600'}`} />
                </button>
                
                {isSearchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/10 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95">
                    <input 
                      type="text" 
                      placeholder="Filter roles..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#111] border border-white/5 rounded-lg py-2 px-3 text-[10px] text-white focus:outline-none mb-2"
                    />
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredGroups.map(group => (
                        <div key={group.label} className="mb-4">
                          <div className="px-3 text-[8px] font-black text-amber-500 uppercase opacity-40 mb-1">{group.label}</div>
                          {group.roles.map(r => (
                            <div 
                              key={r} 
                              onClick={() => { setRole(r); setIsSearchOpen(false); }}
                              className={`px-3 py-2 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${role === r ? 'bg-amber-500 text-black' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
                            >
                              {r}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-amber-500/60 mb-2 block">Dossier Injection</label>
                <label className="w-full border-2 border-dashed border-white/5 rounded-xl p-8 bg-white/[0.01] flex flex-col items-center justify-center cursor-pointer hover:bg-amber-500/[0.03] hover:border-amber-500/30 transition-all group">
                  <input type="file" onChange={handleFileChange} className="hidden" accept="application/pdf" />
                  <Upload className="w-8 h-8 text-slate-700 group-hover:text-amber-500 mb-3 transition-colors" />
                  <p className="text-[10px] font-black uppercase text-slate-500 group-hover:text-white text-center max-w-[120px]">
                    {file ? file.name : "Inject PDF Protocol"}
                  </p>
                </label>
              </div>

              <div className="flex bg-black p-1 rounded-xl border border-white/10">
                 <button onClick={() => setPreferFree(true)} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${preferFree ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white'}`}>Global OSINT Vectors</button>
                 <button onClick={() => setPreferFree(false)} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${!preferFree ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white'}`}>Strategic Courseware</button>
              </div>

              {error && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-[9px] text-red-400 font-bold uppercase flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                  {isAuthError && (
                    <button 
                      onClick={handleOpenKeySelector}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.2em] py-3 rounded-xl text-[9px] flex items-center justify-center gap-2 transition-all active:scale-95 animate-pulse"
                    >
                      <Key className="w-3 h-3 text-amber-500" />
                      Initialize API Key
                    </button>
                  )}
                </div>
              )}

              <button 
                onClick={runAnalysis} 
                disabled={!file || loading || isSynthesizing} 
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-[#111] disabled:text-slate-800 text-black font-black uppercase tracking-[0.3em] py-4 rounded-xl shadow-xl text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all overflow-hidden relative group shimmer-loop"
              >
                {loading || isSynthesizing ? <Cpu className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                <span>{loading ? 'AUDITING...' : isSynthesizing ? 'SYNTHESIZING...' : 'Execute Synergy Audit'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {isSynthesizing ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center border border-white/10 rounded-3xl bg-black shadow-2xl p-6 md:p-12 text-center animate-pulse relative overflow-hidden">
               <Binary className="w-12 h-12 text-amber-500 mb-6" />
               <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-2">Neural Linkage</h3>
               <p className="text-[9px] text-amber-500 font-black uppercase tracking-[0.5em]">Scanning 2025 Global Vectors via Grounding...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#080808] rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl overflow-hidden relative">
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <LayoutDashboard className="w-5 h-5 text-amber-500" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Clarity Deployment Matrix</h2>
                </div>
                <div className="relative z-10">
                  <ProgressDashboard modules={modules} readinessScore={readinessScoreDisplay} />
                </div>
              </div>

              {/* MARKET INTELLIGENCE & POTENTIAL INCOME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#080808] rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp className="w-24 h-24" />
                   </div>
                   <div className="flex items-center gap-2 mb-6 relative z-10">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Market Intelligence</span>
                   </div>
                   <div className="space-y-4 relative z-10">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 block mb-1">Potential Salary Range</span>
                        <div className="flex items-baseline gap-2">
                           <span className="text-3xl font-black salary-text-shine">{analysis.marketInsights.salaryRange.min}</span>
                           <span className="text-slate-500 font-bold">-</span>
                           <span className="text-3xl font-black salary-text-shine">{analysis.marketInsights.salaryRange.max}</span>
                           <span className="text-amber-500 font-black text-xs uppercase ml-1">{analysis.marketInsights.salaryRange.currency}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-center">
                           <span className="text-[7px] font-black uppercase tracking-widest text-slate-700 block">Demand Intensity</span>
                           <span className="text-xs font-bold text-emerald-500">{analysis.marketInsights.demandIntensity}% High</span>
                        </div>
                        <div className="text-center">
                           <span className="text-[7px] font-black uppercase tracking-widest text-slate-700 block">Sentiment Vector</span>
                           <span className="text-xs font-bold text-amber-500">{analysis.marketInsights.marketSentiment}</span>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-[#080808] rounded-3xl p-8 border border-white/10 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden">
                   <div className="flex items-baseline gap-1 relative z-10">
                    <span className="text-[70px] md:text-[80px] font-black text-white leading-none tracking-tighter">{matchScoreDisplay}</span>
                    <div className="flex flex-col items-center ml-2">
                       <MobileSignalTower score={matchScoreDisplay} />
                       <span className="text-[18px] text-slate-400 font-black leading-none">% Match</span>
                    </div>
                  </div>
                  <div className="px-5 py-2 mt-4 bg-amber-500 text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg relative z-10">{analysis.badge}</div>
                  <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest mt-2 relative z-10">Skills-to-Market Alignment</span>
                </div>
              </div>

              {/* INTELLIGENCE CURATION SECTION */}
              <div className="bg-[#080808] rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl overflow-hidden relative">
                <div className="flex items-center gap-2 mb-10 relative z-10">
                   <Library className="w-5 h-5 text-amber-500" />
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Intelligence Curation (Resume & Prep)</span>
                </div>
                <div className="grid grid-cols-1 gap-4 relative z-10">
                  {allResources.length > 0 ? allResources.map((res, ridx) => (
                    <a 
                      key={ridx} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#111] border border-white/5 rounded-2xl hover:border-amber-500/30 transition-all gap-4 shadow-lg hover:shadow-amber-500/5"
                    >
                      <div className="flex items-start gap-5">
                        <div className="p-4 bg-red-600/10 rounded-xl group-hover:bg-red-600/20 transition-colors shrink-0">
                          <Youtube className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h6 className="text-[12px] font-black text-white uppercase group-hover:text-amber-500 transition-colors tracking-wide">{res.name}</h6>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[9px] font-black text-amber-500/60 uppercase">{res.skillToAcquire}</span>
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                            <p className="text-[10px] text-slate-500 font-bold italic leading-tight">"{res.rationale}"</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-5">
                         <div className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-slate-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{res.estimatedTime}</span>
                         </div>
                         <div className="p-2 bg-white/[0.03] rounded-lg group-hover:bg-white/[0.08] transition-all">
                            <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
                         </div>
                      </div>
                    </a>
                  )) : (
                    <div className="py-12 text-center text-slate-600 font-black uppercase tracking-widest text-[9px] border border-dashed border-white/5 rounded-2xl">
                       Synthesizing resource links...
                    </div>
                  )}
                </div>
              </div>

              <ChatBot analysis={analysis} />
            </div>
          ) : (
            <div className="min-h-[500px] flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl bg-white/[0.01] text-center p-8 md:p-12 group relative overflow-hidden">
               <Target className="w-12 h-12 md:w-16 md:h-16 text-slate-700 group-hover:text-amber-500 transition-colors mb-8 relative z-10" />
               <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 text-slate-200 relative z-10">Terminal Standby</h3>
               <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] max-w-sm leading-relaxed relative z-10">Intelligence module ready. Powered by Gemini 3 Pro and Google Search Grounding for real-time 2025 accuracy.</p>
               {isAuthError && (
                  <button 
                    onClick={handleOpenKeySelector}
                    className="mt-6 px-8 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative z-10"
                  >
                    <Key className="w-4 h-4" /> Re-Authorize Neural Link
                  </button>
               )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
