import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  BarChart3,
  Calendar,
  Globe,
  PieChart
} from 'lucide-react';
import { LivingDocReport } from '@/src/types';
import { cn } from '@/lib/utils';

interface DashboardViewProps {
  reports: LivingDocReport[];
  onClose: () => void;
  onSelectEnvironment: (env: string) => void;
}

export function DashboardView({ reports, onClose, onSelectEnvironment }: DashboardViewProps) {
  const stats = useMemo(() => {
    const environments: Record<string, {
      total: number;
      passed: number;
      failed: number;
      flaky: number;
    }> = {};

    reports.forEach(report => {
      const env = report.environment || 'Uncategorized';
      if (!environments[env]) {
        environments[env] = {
          total: 0,
          passed: 0,
          failed: 0,
          flaky: 0,
        };
      }

      environments[env].total++;
      if (report.status === 'failed' || report.reviewStatus === 'investigate') environments[env].failed++;
      else if (report.reviewStatus === 'flaky') environments[env].flaky++;
      else if (report.status === 'passed' || report.reviewStatus === 'good') environments[env].passed++;
    });

    return environments;
  }, [reports]);

  const totalStats = useMemo(() => {
    return Object.values(stats).reduce((acc, curr) => ({
      total: acc.total + curr.total,
      passed: acc.passed + curr.passed,
      failed: acc.failed + curr.failed,
      flaky: acc.flaky + curr.flaky,
    }), { total: 0, passed: 0, failed: 0, flaky: 0 });
  }, [stats]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex-1 overflow-y-auto p-12 bg-neutral-50/50 dark:bg-neutral-900/50 relative"
    >
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                System Overview
              </div>
              <div className="h-px w-12 bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
            <h2 className="text-5xl font-black text-neutral-900 dark:text-neutral-100 tracking-tighter serif italic leading-none">
              Health Dashboard
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-white dark:bg-neutral-950 p-4 rounded-3xl border border-neutral-200/60 dark:border-neutral-800 shadow-sm min-w-[400px]">
             <div className="flex flex-col items-center justify-center p-2 border-r border-neutral-100 dark:border-neutral-800">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Pass Rate</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500 tabular-nums">
                  {totalStats.total > 0 ? Math.round((totalStats.passed / totalStats.total) * 100) : 0}%
                </span>
             </div>
             <div className="flex flex-col items-center justify-center p-2 border-r border-neutral-100 dark:border-neutral-800">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Failed</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-500 tabular-nums">{totalStats.failed}</span>
             </div>
             <div className="flex flex-col items-center justify-center p-2">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Flaky</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-500 tabular-nums">{totalStats.flaky}</span>
             </div>
          </div>
        </div>

        {/* Environment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(stats).map(([env, data]) => {
            const passPercentage = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
            const failPercentage = data.total > 0 ? Math.round((data.failed / data.total) * 100) : 0;
            const flakyPercentage = data.total > 0 ? Math.round((data.flaky / data.total) * 100) : 0;

            return (
              <motion.div 
                key={env}
                whileHover={{ y: -5 }}
                className="group relative bg-white dark:bg-neutral-950 rounded-[2.5rem] border border-neutral-200/60 dark:border-neutral-800 p-8 shadow-xl shadow-neutral-200/20 dark:shadow-none hover:border-indigo-500/50 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
                      env === 'Regression' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                      env === 'UAT' ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" :
                      "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    )}>
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight leading-none mb-1">
                        {env}
                      </h3>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Environment Cluster
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSelectEnvironment(env)}
                    className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-neutral-800 transition-all border border-neutral-100 dark:border-neutral-800"
                  >
                    <TrendingUp size={16} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Progress Bar Container */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                      <span className="text-neutral-400">Environment Stability</span>
                      <span className={cn(
                        passPercentage > 90 ? "text-emerald-500" : 
                        passPercentage > 75 ? "text-amber-500" : "text-rose-500"
                      )}>{passPercentage}% Healthy</span>
                    </div>
                    <div className="h-6 w-full bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden flex p-1 gap-1">
                      {data.passed > 0 && (
                        <div 
                          className="h-full bg-emerald-500 dark:bg-emerald-600 rounded-lg transition-all duration-1000" 
                          style={{ width: `${passPercentage}%` }} 
                        />
                      )}
                      {data.flaky > 0 && (
                        <div 
                          className="h-full bg-amber-500 dark:bg-amber-600 rounded-lg transition-all duration-1000" 
                          style={{ width: `${flakyPercentage}%` }} 
                        />
                      )}
                      {data.failed > 0 && (
                        <div 
                          className="h-full bg-rose-500 dark:bg-rose-600 rounded-lg transition-all duration-1000" 
                          style={{ width: `${failPercentage}%` }} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/60 dark:text-emerald-400/60">Passed</span>
                      </div>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{data.passed}</span>
                    </div>
                    <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100/50 dark:border-rose-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-rose-600 dark:text-rose-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-900/60 dark:text-rose-400/60">Failed</span>
                      </div>
                      <span className="text-lg font-black text-rose-700 dark:text-rose-400 tabular-nums">{data.failed}</span>
                    </div>
                    <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PieChart size={14} className="text-amber-600 dark:text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900/60 dark:text-amber-400/60">Flaky</span>
                      </div>
                      <span className="text-lg font-black text-amber-700 dark:text-amber-400 tabular-nums">{data.flaky}</span>
                    </div>
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-indigo-600 dark:text-indigo-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-900/60 dark:text-indigo-400/60">Total</span>
                      </div>
                      <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 tabular-nums">{data.total}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  {data.failed > 0 ? (
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">
                      <TrendingDown size={14} />
                      {data.failed} Issues Need Attention
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                      <CheckCircle2 size={14} />
                      Zero Issues Reported
                    </div>
                  )}
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/10 transition-colors duration-700" />
              <div className="relative z-10">
                <BarChart3 size={40} className="mb-6 opacity-80" />
                <h3 className="text-3xl font-black tracking-tight mb-3 italic serif">Detailed Analysis</h3>
                <p className="text-indigo-100/70 font-medium mb-8 leading-relaxed max-w-sm">
                  View granular breakdown of failed tests and flaky signals across all environments to prioritize manual fixes.
                </p>
                <button 
                  onClick={onClose}
                  className="px-6 py-3 bg-white text-indigo-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-neutral-100 transition-colors"
                >
                  Return to Workspace
                </button>
              </div>
           </div>
           
           <div className="bg-white dark:bg-neutral-950 rounded-[3rem] p-10 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between group">
              <div>
                <PieChart size={40} className="text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight mb-3 italic serif">Documentation Coverage</h3>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-sm">
                  Your team has uploaded <span className="font-bold text-neutral-900 dark:text-white">{reports.length}</span> LivingDoc reports across <span className="font-bold text-neutral-900 dark:text-white">{Object.keys(stats).length}</span> environment clusters.
                </p>
              </div>
              <div className="flex gap-4 mt-12">
                 <div className="flex-1 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl">
                    <span className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Growth</span>
                    <span className="text-xl font-black text-neutral-900 dark:text-neutral-100">+12% WoW</span>
                 </div>
                 <div className="flex-1 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl">
                    <span className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Avg Score</span>
                    <span className="text-xl font-black text-neutral-900 dark:text-neutral-100">8.4 / 10</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
