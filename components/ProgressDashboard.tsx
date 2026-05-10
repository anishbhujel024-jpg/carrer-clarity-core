
import React, { useMemo } from 'react';
import { CheckCircle2, Lock, ArrowRight, Activity, Zap, Crosshair, ChevronRight, BarChart3, Database, ShieldAlert } from 'lucide-react';
import { ClarityModule, ModuleStatus } from '../types';

interface ProgressDashboardProps {
  modules: ClarityModule[];
  readinessScore?: number; // Prop to show actual professional readiness (experience-based)
  onModuleClick?: (id: string) => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ modules, readinessScore, onModuleClick }) => {
  // Logic for the module completion progress (internal system status)
  const systemProgress = useMemo(() => {
    const total = modules.length;
    const completed = modules.filter(m => m.status === 'completed').length;
    const inProgress = modules.filter(m => m.status === 'in-progress').length;
    return Math.round(((completed * 1 + inProgress * 0.5) / total) * 100);
  }, [modules]);

  // If readinessScore is provided (after analysis), we prioritize showing the professional readiness
  const displayScore = readinessScore !== undefined ? readinessScore : systemProgress;

  const nextStep = useMemo(() => {
    const current = modules.find(m => m.status === 'in-progress');
    if (current) return { text: `EXECUTE: ${current.title}`, desc: current.description };
    const upcoming = modules.find(m => m.status === 'locked');
    if (upcoming) return { text: `INITIALIZE: ${upcoming.title}`, desc: upcoming.description };
    return { text: "MISSION COMPLETE", desc: "Clarity synthesis achieved. Your professional vector is locked." };
  }, [modules]);

  const getStatusIcon = (status: ModuleStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'in-progress': return <Activity className="w-4 h-4 text-[#FFC107] animate-pulse" />;
      default: return <Lock className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes sweep {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .data-sweep {
          animation: sweep 4s linear infinite;
        }
        .font-mono-tech {
          font-family: 'Rajdhani', monospace;
          letter-spacing: -0.02em;
        }
        .digital-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.1), 0 0 2px rgba(255, 255, 255, 0.2);
        }
        .tech-num {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          letter-spacing: -0.05em;
        }
      `}</style>

      {/* MISSION CONTROL CONSOLE */}
      <div className="bg-[#050505] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative group">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="flex items-center justify-between px-6 py-2 bg-white/[0.02] border-b border-white/5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#FFC107] animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Status: ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-700">Audit Sub-Process 01</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
          
          {/* COLUMN 1: TELEMETRY (SHOWING PROFESSIONAL READINESS) */}
          <div className="lg:col-span-3 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col items-center justify-center bg-black/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-600">Readiness Vector</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
              </div>
              
              <div className="flex items-baseline gap-1 select-none relative">
                <span className="text-6xl md:text-8xl font-bold text-white tech-num leading-none digital-glow">
                  {displayScore}
                </span>
                <span className="text-xl md:text-2xl font-bold text-[#FFC107] tech-num opacity-80 tracking-tighter">%</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full mt-4">
                <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-500">Exp. Maturity</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: TACTICAL BRIEFING */}
          <div className="lg:col-span-6 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
              <Crosshair className="w-32 h-32 text-white" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-[#FFC107]" />
                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#FFC107]">Strategic Command</h3>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none uppercase italic border-l-4 border-[#FFC107] pl-4">
                  {nextStep.text}
                </h2>
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl relative">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC107]/20 to-transparent data-sweep" />
                  <p className="text-[11px] md:text-[12px] text-slate-400 italic leading-relaxed">
                    "{nextStep.desc}"
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-white/5">
              <button 
                onClick={() => onModuleClick?.('implementation')}
                className="w-full sm:w-auto px-10 py-3.5 bg-[#FFC107] text-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#FFD54F] hover:shadow-[0_0_30px_rgba(255,193,7,0.3)] transition-all active:scale-95 group/btn"
              >
                Launch Primary Vector <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
              </button>
              <div className="hidden sm:flex items-center gap-6 px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                 <div className="flex items-center gap-3">
                    <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">
                       Risk Profile<br/><span className="text-emerald-500">LOW VULN</span>
                    </div>
                 </div>
                 <div className="w-[1px] h-6 bg-white/10" />
                 <div className="flex items-center gap-3">
                    <Database className="w-3.5 h-3.5 text-slate-600" />
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">
                       Auth Level<br/><span className="text-white">TIER 1</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: SUB-SYSTEM STATUS */}
          <div className="lg:col-span-3 p-6 md:p-8 bg-white/[0.01] border-t lg:border-t-0 lg:border-l border-white/5">
            <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-3 h-3" /> System Components
            </h4>
            <div className="space-y-3">
              {modules.map(module => (
                <div 
                  key={module.id} 
                  onClick={() => onModuleClick?.(module.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/[0.03] ${
                    module.status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/5' :
                    module.status === 'in-progress' ? 'border-[#FFC107]/20 bg-[#FFC107]/5' :
                    'border-white/5 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      module.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                      module.status === 'in-progress' ? 'bg-[#FFC107] animate-pulse shadow-[0_0_8px_#FFC107]' :
                      'bg-slate-800'
                    }`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${module.status === 'locked' ? 'text-slate-700' : 'text-white'}`}>
                      {module.id.slice(0, 4)}
                    </span>
                  </div>
                  {getStatusIcon(module.status)}
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
               <span className="text-[7px] font-black uppercase text-slate-700 tracking-[0.2em]">Deployment Seq.</span>
               <div className="flex gap-0.5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-3 h-1 rounded-full ${i <= (systemProgress/25) ? 'bg-[#FFC107]' : 'bg-white/10'}`} />
                  ))}
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* DETAILED VECTOR MODULES (BOTTOM CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((module) => (
          <div 
            key={module.id}
            onClick={() => onModuleClick?.(module.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden active:scale-95 ${
              module.status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/[0.02] opacity-100 hover:border-emerald-500/60' :
              module.status === 'in-progress' ? 'border-[#FFC107] bg-[#FFC107]/[0.05] shadow-[0_0_15px_rgba(255,193,7,0.1)] opacity-100' :
              'border-white/5 bg-white/[0.01] opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500'
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  module.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                  module.status === 'in-progress' ? 'bg-[#FFC107]/20 text-[#FFC107] animate-pulse' : 
                  'bg-white/5 text-slate-700'
                }`}>
                  {module.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                   module.status === 'in-progress' ? <Activity className="w-5 h-5" /> : 
                   <Lock className="w-5 h-5" />}
                </div>
                <ChevronRight className={`w-4 h-4 transition-all ${module.status === 'locked' ? 'text-slate-800' : 'text-slate-600 group-hover:translate-x-1 group-hover:text-white'}`} />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-[12px] font-black uppercase tracking-widest text-white group-hover:text-[#FFC107] transition-colors">{module.title}</h4>
                <p className="text-[9px] text-slate-500 font-bold leading-relaxed line-clamp-2">{module.description}</p>
              </div>

              <div className="mt-4 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ${
                   module.status === 'completed' ? 'w-full bg-emerald-500' :
                   module.status === 'in-progress' ? 'w-1/2 bg-[#FFC107]' : 'w-0'
                 }`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressDashboard;
