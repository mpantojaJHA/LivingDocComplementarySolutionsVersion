import * as React from 'react';
const { useState, useCallback, useEffect } = React;
import { 
  FileText, 
  Plus, 
  LayoutGrid, 
  X, 
  Maximize2, 
  Minimize2, 
  Search, 
  Upload,
  Layers,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
  Settings,
  Filter,
  Tag,
  Globe,
  GitBranch,
  GripVertical,
  Lock,
  Folder,
  ChevronRight,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Briefcase,
  ExternalLink,
  MoveHorizontal,
  User,
  AlertTriangle,
  ShieldCheck,
  Zap,
  HelpCircle,
  MousePointer2,
  FolderTree,
  Layout,
  Moon,
  Rocket,
  FlaskConical,
  RotateCcw,
  ListRestart,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';
import { LivingDocReport } from '@/src/types';

import { storageService, ReportMetadata, AppSettings } from '@/src/services/storageService';

const DOMAIN_ICONS: Record<string, string> = {
  "Allocations": "💰",
  "ALM": "🏦",
  "CECL": "📉",
  "CustomerPricing": "🏷️",
  "CustomerProfitability": "📈",
  "Forecasting": "🔮",
  "HomePageWidgets": "🧩",
  "LiquidityRisk": "💧",
  "Notifications": "🔔",
  "Reconciliation Summary": "🧾",
  "Reporting": "📊",
  "Daily Dashboard": "📅"
};

const LICENSE_DOMAINS = [
  "Allocations", 
  "ALM", 
  "CECL", 
  "CustomerPricing", 
  "CustomerProfitability", 
  "Daily Dashboard",
  "Forecasting", 
  "HomePageWidgets", 
  "LiquidityRisk", 
  "Notifications", 
  "Reconciliation Summary", 
  "Reporting"
];

interface SortableReportItemProps {
  report: LivingDocReport;
  activeReportIds: string[];
  toggleReportActive: (id: string) => void;
  removeReport: (id: string) => void;
  searchQuery: string;
  isLocked?: boolean;
  onUpdate: (id: string, updates: Partial<LivingDocReport>) => void;
  key?: React.Key;
}

function SortableReportItem({ report, activeReportIds, toggleReportActive, removeReport, searchQuery, isLocked, onUpdate }: SortableReportItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: report.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleReportActive(report.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleReportActive(report.id); }}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group relative border cursor-pointer select-none pr-10",
                activeReportIds.includes(report.id) 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-indigo-950/50 border-indigo-500" 
                  : report.reviewStatus === 'investigate'
                  ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 shadow-sm hover:shadow-md hover:bg-rose-100/50 dark:hover:bg-rose-900/30"
                  : report.reviewStatus === 'good'
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 shadow-sm hover:shadow-md hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30"
                  : report.reviewStatus === 'flaky'
                  ? "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/50 shadow-sm hover:shadow-md hover:bg-yellow-100/50 dark:hover:bg-yellow-900/30"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-transparent shadow-sm hover:shadow-md bg-white dark:bg-neutral-900 hover:border-neutral-200 dark:hover:border-neutral-800"
              )}
            >
              <div 
                {...attributes} 
                {...listeners}
                className="absolute left-1 top-1/2 -translate-y-1/2 p-1 text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <GripVertical size={14} />
              </div>

              <div className={cn(
                "mt-1 p-1.5 rounded-lg shrink-0 ml-2",
                activeReportIds.includes(report.id) ? "bg-indigo-500" : 
                report.status === 'passed' ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50" :
                report.status === 'failed' ? "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50" :
                "bg-neutral-200 dark:bg-neutral-800"
              )}>
                {report.status === 'passed' ? <CheckCircle2 size={16} /> : 
                 report.status === 'failed' ? <AlertCircle size={16} /> :
                 <FileText size={16} />}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                   <p className="text-sm font-semibold truncate leading-tight">
                     {report.name
                       .replace(/\.html?$/i, '')
                       .replace(/[-_]?LivingDoc/i, '')
                       .replace(/[-_]?Living Doc/i, '')
                       .replace(/[-_]+/g, ' ')
                       .trim()}
                   </p>
                   {report.reviewStatus === 'investigate' && (
                     <AlertTriangle 
                       size={12} 
                       className={cn("shrink-0", activeReportIds.includes(report.id) ? "text-rose-200" : "text-rose-500")} 
                     />
                   )}
                   {report.reviewStatus === 'good' && (
                     <ShieldCheck 
                       size={12} 
                       className={cn("shrink-0", activeReportIds.includes(report.id) ? "text-emerald-200" : "text-emerald-500")} 
                     />
                   )}
                   {report.reviewStatus === 'flaky' && (
                     <Zap 
                       size={12} 
                       className={cn("shrink-0", activeReportIds.includes(report.id) ? "text-yellow-200" : "text-yellow-400")} 
                     />
                   )}
                   {report.status !== 'unknown' && !activeReportIds.includes(report.id) && (
                     <div className={cn(
                       "w-1.5 h-1.5 rounded-full shrink-0",
                       report.status === 'passed' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                     )} />
                   )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                   <Badge 
                     variant="secondary" 
                     className={cn(
                       "text-[8px] h-3.5 px-1 py-0 leading-none font-bold uppercase",
                       activeReportIds.includes(report.id) ? "bg-indigo-400 text-white" : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                     )}
                   >
                     {report.environment}
                   </Badge>
                  {report.licenseDomain && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[8px] h-3.5 px-1 py-0 leading-none font-bold uppercase",
                        activeReportIds.includes(report.id) ? "border-yellow-400 bg-yellow-400 text-white" : "border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400"
                      )}
                    >
                      {report.licenseDomain}
                    </Badge>
                  )}
                   {report.version && (
                     <Badge 
                       variant="outline" 
                       className={cn(
                         "text-[8px] h-3.5 px-1 py-0 leading-none font-medium truncate max-w-[80px]",
                         activeReportIds.includes(report.id) ? "border-indigo-400 text-white" : "border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500"
                       )}
                     >
                       {report.version}
                     </Badge>
                   )}
                   <span className={cn(
                     "text-[9px] uppercase tracking-wider font-medium ml-auto whitespace-nowrap",
                     activeReportIds.includes(report.id) ? "text-indigo-200" : "text-neutral-400"
                   )}>
                     {report.addedAt.toLocaleDateString()} {report.addedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
                {searchQuery && report.textContent?.toLowerCase().includes(searchQuery.toLowerCase()) && !report.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                  <p className={cn(
                    "text-[9px] italic mt-1 line-clamp-1",
                    activeReportIds.includes(report.id) ? "text-indigo-200" : "text-neutral-400"
                  )}>
                     Content match...
                  </p>
                )}
              </div>
              {!isLocked && (
                <button 
                  onClick={(e) => { e.stopPropagation(); removeReport(report.id); }}
                  className={cn(
                    "absolute top-3 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                    activeReportIds.includes(report.id) ? "hover:bg-indigo-500 text-indigo-200 hover:text-white" : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => toggleReportActive(report.id)}>
             <ExternalLink className="mr-2 h-4 w-4" />
             <span>{activeReportIds.includes(report.id) ? "Remove from Workspace" : "Open in Workspace"}</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Globe className="mr-2 h-4 w-4" />
              <span>Change Environment</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {['DevNightly', 'Regression'].map(env => (
                <ContextMenuItem 
                  key={env} 
                  onClick={() => onUpdate(report.id, { environment: env })}
                  className={cn(report.environment === env && "bg-neutral-100 font-bold")}
                >
                  {env === 'DevNightly' ? '🌙 ' : env === 'Regression' ? '🧪 ' : '🚀 '}
                  {env}
                  {report.environment === env && <CheckCircle2 size={12} className="ml-auto text-indigo-600" />}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>License Domain</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={() => onUpdate(report.id, { licenseDomain: undefined })}>
                None
              </ContextMenuItem>
              <ContextMenuSeparator />
              {LICENSE_DOMAINS.map(domain => (
                <ContextMenuItem key={domain} onClick={() => onUpdate(report.id, { licenseDomain: domain, folder: domain })}>
                  <span className="mr-2 text-xs">{DOMAIN_ICONS[domain]}</span>
                  <span>{domain}</span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
           <ContextMenuSeparator />
           <ContextMenuSub>
            <ContextMenuSubTrigger>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              <span>Review Status</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem 
                onClick={() => onUpdate(report.id, { reviewStatus: 'investigate' })}
                className="text-rose-600 focus:text-rose-600 font-medium"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span>Needs Investigation</span>
                {report.reviewStatus === 'investigate' && <CheckCircle2 size={12} className="ml-auto" />}
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => onUpdate(report.id, { reviewStatus: 'good' })}
                className="text-emerald-600 focus:text-emerald-600 font-medium"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Good to Go</span>
                {report.reviewStatus === 'good' && <CheckCircle2 size={12} className="ml-auto" />}
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => onUpdate(report.id, { reviewStatus: 'flaky' })}
                className="text-yellow-600 focus:text-yellow-600 font-medium"
              >
                <Zap className="mr-2 h-4 w-4" />
                <span>Flaky failure - OK</span>
                {report.reviewStatus === 'flaky' && <CheckCircle2 size={12} className="ml-auto" />}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onUpdate(report.id, { reviewStatus: 'none' })}>
                <span>Clear Status</span>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          {!isLocked && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem 
                onClick={() => removeReport(report.id)} 
                className="text-rose-600 focus:text-rose-600"
              >
                <X className="mr-2 h-4 w-4" />
                <span>Delete Report</span>
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

function DroppableFolder({ folderName, isExpanded, onToggle, onDrop, reportCount }: { 
  folderName: string, 
  isExpanded: boolean, 
  onToggle: () => void, 
  onDrop: (files: FileList) => void,
  reportCount: number
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder:${folderName}`,
  });

  return (
    <button
      ref={setNodeRef}
      onClick={onToggle}
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.setAttribute('data-drag-over', 'true'); }}
      onDragLeave={(e) => e.currentTarget.removeAttribute('data-drag-over')}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.removeAttribute('data-drag-over');
        if (e.dataTransfer.files.length > 0) onDrop(e.dataTransfer.files);
      }}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-50 rounded-lg text-neutral-500 hover:text-neutral-900 transition-all group",
        "data-[drag-over=true]:bg-indigo-50 data-[drag-over=true]:ring-2 data-[drag-over=true]:ring-indigo-200 data-[drag-over=true]:text-indigo-700",
        isOver && "bg-indigo-50 ring-2 ring-indigo-200 text-indigo-700"
      )}
    >
      <div className="flex-1 flex items-center gap-2 pointer-events-none">
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Folder size={14} className={cn(
          "transition-colors",
          isExpanded ? "text-indigo-500 fill-indigo-100 dark:fill-indigo-900/30" : "text-neutral-400 dark:text-neutral-600"
        )} />
        <span className="text-[11px] font-bold uppercase tracking-wider">{folderName}</span>
        <span className="ml-auto text-[9px] font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full text-neutral-400 dark:text-neutral-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
          {reportCount}
        </span>
      </div>
    </button>
  );
}

function DroppableDomainTab({ domain, active, onSelect, onDropFiles }: {
  domain: string,
  active: boolean,
  onSelect: () => void,
  onDropFiles: (files: FileList) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `domain:${domain}`,
  });

  return (
    <div ref={setNodeRef} className="h-full">
      <TabsTrigger 
        value={domain} 
        onClick={onSelect}
        className={cn(
          "px-3 h-7 text-[10px] rounded-full border border-neutral-100 dark:border-neutral-800 transition-colors flex items-center gap-1.5",
          "data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-600",
          isOver && "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-300 dark:ring-indigo-700 border-indigo-300 dark:border-indigo-700"
        )}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) onDropFiles(e.dataTransfer.files);
        }}
      >
        <span className="text-xs">{DOMAIN_ICONS[domain]}</span>
        {domain}
      </TabsTrigger>
    </div>
  );
}

function EnvironmentStatusGraphic({ env, domain, releaseName, versionName }: { env: string, domain: string, releaseName?: string, versionName?: string }) {
  const envInfo = {
    'DevNightly': { icon: <Moon size={64} />, color: 'text-indigo-600', border: 'border-indigo-100', bg: 'bg-indigo-50', bgDark: 'dark:bg-indigo-900/10', label: 'Development Nightly' },
    'Regression': { icon: <FlaskConical size={64} />, color: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50', bgDark: 'dark:bg-emerald-900/10', label: 'Regression Suite' },
    'Production': { icon: <Rocket size={64} />, color: 'text-rose-600', border: 'border-rose-100', bg: 'bg-rose-50', bgDark: 'dark:bg-rose-900/10', label: 'Production Environment' },
    'All': { icon: <Globe size={64} />, color: 'text-blue-600', border: 'border-blue-100', bg: 'bg-blue-50', bgDark: 'dark:bg-blue-900/10', label: 'Consolidated View' }
  };

  const info = envInfo[env as keyof typeof envInfo] || envInfo['All'];

  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-10 px-4 md:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
           "w-full h-full min-h-[500px] flex flex-col items-center justify-center p-12 relative border-4 rounded-[40px] shadow-2xl transition-all",
           "bg-white dark:bg-neutral-900/40",
           info.border,
           "dark:border-neutral-800"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/50 to-transparent dark:from-neutral-900/20 dark:to-transparent rounded-[36px] pointer-events-none" />
        
        <div className={cn(
          "w-36 h-36 rounded-[36px] flex items-center justify-center mb-10 shadow-lg relative z-10",
          info.bg, info.bgDark, info.color
        )}>
           <div className="absolute inset-0 rounded-[36px] bg-white opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
           {info.icon}
        </div>
        
        <h2 className="text-6xl font-black text-neutral-900 dark:text-neutral-100 mb-6 tracking-tighter relative z-10 leading-tight">
          Viewing <br/>
          <span className={cn("italic serif", info.color)}>{info.label}</span>
          {env === 'Regression' && releaseName && (
            <div className="text-2xl mt-4 text-neutral-500 font-normal tracking-normal normal-case">
              Release: <span className="font-bold text-neutral-900 dark:text-neutral-100">{releaseName}</span>
            </div>
          )}
          {env === 'DevNightly' && versionName && (
            <div className="text-2xl mt-4 text-neutral-500 font-normal tracking-normal normal-case">
              Sprint: <span className="font-bold text-neutral-900 dark:text-neutral-100">{versionName}</span>
            </div>
          )}
        </h2>
        
        <p className="text-xl text-neutral-500 dark:text-neutral-400 mb-12 max-w-lg mx-auto font-medium leading-relaxed relative z-10">
          {domain === 'All' 
            ? `You're currently exploring all domains within the ${env} environment. Select a folder to narrow down your analysis.`
            : `System filtered: Showing only reports from the ${domain} domain in ${env}.`
          }
        </p>

        <div className="flex gap-4 items-center px-8 py-4 bg-neutral-100/80 dark:bg-neutral-800/80 rounded-3xl text-sm font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 backdrop-blur-sm relative z-10 border border-neutral-200 dark:border-neutral-700">
           <Layout size={18} className={info.color} />
           <span>Use the sidebar to explore your LivingDoc catalog</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [reports, setReports] = useState<LivingDocReport[]>([]);
  const [activeReportIds, setActiveReportIds] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [maximizedReportId, setMaximizedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<string>('All');
  const [batchEnv, setBatchEnv] = useState<string>('DevNightly');
  const [batchVersion, setBatchVersion] = useState<string>('');
  const [batchFolder, setBatchFolder] = useState<string>('');
  const [batchLicenseDomain, setBatchLicenseDomain] = useState<string>('');
  const [regressionReleaseName, setRegressionReleaseName] = useState<string>('');
  const [isLibraryLocked, setIsLibraryLocked] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [allowUploads, setAllowUploads] = useState<boolean>(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<LivingDocReport | null>(null);
  const [conflictQueue, setConflictQueue] = useState<{
    file: File;
    existingId: string;
    uploadParams: {
      status: 'passed' | 'failed' | 'unknown';
      textContent: string;
      uploadEnv: string;
      version: string;
      uploadFolder: string | undefined;
      uploadDomain: string | undefined;
    }
  }[]>([]);

  // Load persistence data
  useEffect(() => {
    const loadData = async () => {
      const metadata = storageService.getReportsMetadata();
      const settings = storageService.getSettings();

      if (settings) {
        setIsLibraryLocked(settings.isLibraryLocked);
        setSelectedEnv(settings.selectedEnv);
        setRegressionReleaseName(settings.regressionReleaseName || '');
        setSelectedDomain(settings.selectedDomain);
        setBatchEnv(settings.batchEnv);
        setBatchVersion(settings.batchVersion);
        setBatchFolder(settings.batchFolder);
        setBatchLicenseDomain(settings.batchLicenseDomain);
        setAllowUploads(settings.allowUploads ?? true);
      }

      if (metadata.length > 0) {
        const loadedReports: LivingDocReport[] = [];
        for (const r of metadata) {
          const content = await storageService.getReportContent(r.id);
          let url = '';
          if (content) {
            url = URL.createObjectURL(new Blob([content], { type: 'text/html' }));
          }
          loadedReports.push({
            ...r,
            addedAt: new Date(r.addedAt),
            url
          });
        }
        setReports(loadedReports);
      }
      setIsInitialLoad(false);
    };

    loadData();
  }, []);

  // Save settings when they change (skip initial load to avoid overwriting)
  useEffect(() => {
    if (isInitialLoad) return;
    
    storageService.saveSettings({
      isLibraryLocked,
      selectedEnv,
      regressionReleaseName,
      selectedDomain,
      batchEnv,
      batchVersion,
      batchFolder,
      batchLicenseDomain,
      allowUploads
    });
  }, [isLibraryLocked, expandedFolders, selectedEnv, regressionReleaseName, selectedDomain, batchEnv, batchVersion, batchFolder, batchLicenseDomain, allowUploads, isInitialLoad]);

  // Sync reports to storage service (for metadata updates)
  useEffect(() => {
    if (isInitialLoad || reports.length === 0) return;
    
    // We only update metadata via this hook for simpler state management
    // Binary is handled separately in handleFileUpload
    const metadata: ReportMetadata[] = reports.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      addedAt: r.addedAt.toISOString(),
      status: r.status,
      environment: r.environment,
      version: r.version,
      folder: r.folder,
      licenseDomain: r.licenseDomain,
      textContent: r.textContent,
      reviewStatus: r.reviewStatus
    }));
    
    // This is a bit heavy-handed, but works for local storage metadata
    localStorage.setItem('livingdoc_reports_metadata', JSON.stringify(metadata));
  }, [reports, isInitialLoad]);

  // Dark mode detection to match machine settings
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateDarkMode = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateDarkMode(darkModeQuery);
    darkModeQuery.addEventListener('change', updateDarkMode);
    
    return () => darkModeQuery.removeEventListener('change', updateDarkMode);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileUpload = useCallback((files: FileList | null, overrideEnv?: string, overrideFolder?: string, overrideDomain?: string) => {
    if (!files || !allowUploads) return;
    
    Array.from(files).forEach(async (file) => {
      const fileName = file.name.toLowerCase();
      const validExtension = fileName.endsWith('.html') || fileName.endsWith('.mht') || fileName.endsWith('.mhtml');
      const startsWithLivingDoc = file.name.startsWith('LivingDoc');
      
      if (validExtension && startsWithLivingDoc) {
        // Basic parser to detect status and index content
        const arrayBuffer = await file.arrayBuffer();
        const content = new TextDecoder().decode(arrayBuffer.slice(0, 1000000));
        let status: 'passed' | 'failed' | 'unknown' = 'unknown';
        
        if (content.includes('\"Passed\":0') && content.includes('\"Failed\":0')) {
           status = 'unknown';
        } else if (content.includes('\"Failed\":0') || content.includes('failed: 0')) {
           status = 'passed';
        } else if (content.includes('\"Failed\":') || content.includes('failed:')) {
           const match = content.match(/\"Failed\":(\d+)/);
           if (match && parseInt(match[1]) > 0) status = 'failed';
        }

        // Strip HTML for search index
        const textContent = content.replace(/<[^>]*>?/gm, ' ').slice(0, 100000);

        const uploadEnv = overrideEnv || (selectedEnv === 'All' ? batchEnv : selectedEnv);
        const uploadDomain = overrideDomain || (selectedDomain !== 'All' ? selectedDomain : batchLicenseDomain);
        
        let uploadFolder = '';
        if (overrideFolder !== undefined) {
          uploadFolder = overrideFolder;
        } else if (uploadDomain && uploadDomain !== 'None') {
          uploadFolder = uploadDomain;
        } else {
          uploadFolder = batchFolder;
        }

        const uploadParams = {
          status,
          textContent,
          uploadEnv,
          version: batchVersion,
          uploadFolder: uploadFolder || undefined,
          uploadDomain: uploadDomain !== 'None' ? (uploadDomain || undefined) : undefined
        };

        // Check for conflict
        const existing = reports.find(r => r.name === file.name && r.environment === uploadEnv);
        
        if (existing) {
          setConflictQueue(prev => [...prev, {
            file,
            existingId: existing.id,
            uploadParams
          }]);
          return;
        }

        const id = crypto.randomUUID();
        const url = URL.createObjectURL(file);
        
        // Save to IndexedDB and LocalStorage
        await storageService.saveReport({
          id,
          name: file.name,
          type: file.name.split('.').pop() || 'html',
          addedAt: new Date().toISOString(),
          status,
          textContent,
          environment: uploadEnv,
          version: batchVersion,
          folder: uploadFolder || undefined,
          licenseDomain: uploadDomain !== 'None' ? (uploadDomain || undefined) : undefined
        }, arrayBuffer);

        const newReport: LivingDocReport = {
          id,
          name: file.name,
          url,
          type: file.name.split('.').pop() || 'html',
          addedAt: new Date(),
          status,
          textContent,
          environment: uploadEnv,
          version: batchVersion,
          folder: uploadFolder || undefined,
          licenseDomain: uploadDomain !== 'None' ? (uploadDomain || undefined) : undefined
        };

        setReports(prev => [...prev, newReport]);
      }
    });
  }, [batchEnv, batchVersion, batchFolder, batchLicenseDomain, selectedEnv, selectedDomain, reports, allowUploads]);
  
  const resolveConflict = async (replace: boolean) => {
    if (conflictQueue.length === 0) return;
    
    const { file, existingId, uploadParams } = conflictQueue[0];
    
    if (replace) {
      removeReport(existingId);
      
      const id = crypto.randomUUID();
      const arrayBuffer = await file.arrayBuffer();
      const url = URL.createObjectURL(file);
      
      await storageService.saveReport({
        id,
        name: file.name,
        type: file.name.split('.').pop() || 'html',
        addedAt: new Date().toISOString(),
        status: uploadParams.status,
        textContent: uploadParams.textContent,
        environment: uploadParams.uploadEnv,
        version: uploadParams.version,
        folder: uploadParams.uploadFolder,
        licenseDomain: uploadParams.uploadDomain
      }, arrayBuffer);

      const newReport: LivingDocReport = {
        id,
        name: file.name,
        url,
        type: file.name.split('.').pop() || 'html',
        addedAt: new Date(),
        status: uploadParams.status,
        textContent: uploadParams.textContent,
        environment: uploadParams.uploadEnv,
        version: uploadParams.version,
        folder: uploadParams.uploadFolder,
        licenseDomain: uploadParams.uploadDomain
      };

      setReports(prev => [...prev, newReport]);
    }
    
    setConflictQueue(prev => prev.slice(1));
  };

  const onDragOver = (e: React.DragEvent) => {
    if (!allowUploads) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if we've actually left the window/container
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const toggleReportActive = (id: string) => {
    setActiveReportIds(prev => 
      prev.includes(id) 
        ? prev.filter(rid => rid !== id) 
        : [...prev, id]
    );
  };

  const updateReport = useCallback((id: string, updates: Partial<LivingDocReport>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const removeReport = (id: string) => {
    setReports(prev => {
      const report = prev.find(r => r.id === id);
      if (report) URL.revokeObjectURL(report.url);
      return prev.filter(r => r.id !== id);
    });
    setActiveReportIds(prev => prev.filter(rid => rid !== id));
    if (maximizedReportId === id) setMaximizedReportId(null);
    storageService.deleteReport(id);
  };

  const confirmDeleteReport = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      setReportToDelete(report);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.textContent && r.textContent.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesEnv = selectedEnv === 'All' || r.environment === selectedEnv;
    const matchesDomain = selectedDomain === 'All' || r.licenseDomain === selectedDomain;
    
    return matchesSearch && matchesEnv && matchesDomain;
  });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle dropping onto a container (Folder or Domain)
    if (overId.startsWith('folder:')) {
      const folder = overId.split(':')[1];
      const targetFolder = folder === 'Uncategorized' ? undefined : folder;
      updateReport(activeId, { folder: targetFolder });
    } else if (overId.startsWith('domain:')) {
      const domain = overId.split(':')[1];
      updateReport(activeId, { licenseDomain: domain, folder: domain });
    } else if (active.id !== over.id) {
      setReports((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        
        // If they are in different folders/domains, we might want to sync them?
        // For now, just allow reordering within the same visual group or moving to new index
        const activeReport = items[oldIndex];
        const overReport = items[newIndex];
        
        if (activeReport && overReport && activeReport.folder !== overReport.folder) {
           activeReport.folder = overReport.folder;
        }

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, [updateReport]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    folders.forEach(f => next[f] = true);
    setExpandedFolders(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    folders.forEach(f => next[f] = false);
    setExpandedFolders(next);
  };

  // Group reports by folder for rendering
  const folders = [...new Set(filteredReports.map(r => r.folder || 'Uncategorized'))].sort();
  
  return (
    <TooltipProvider>
      <div 
        className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden font-sans text-foreground transition-colors duration-300"
        onDragOver={onDragOver}
      >
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          className="w-80 h-full border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col shadow-xl z-20 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                  <ClipboardCheck size={24} />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5 translate-y-0.5">
                    <h1 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">Complementary Solutions</h1>
                    {isLibraryLocked && <Lock size={11} className="text-yellow-500 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">Financial Performance Suite</p>
                  <p className="text-[9px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1">LivingDoc Explorer</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Dialog>
                  <DialogTrigger render={
                    <Button variant="ghost" size="icon-sm" className="text-neutral-400 hover:text-indigo-600">
                      <Settings size={18} />
                    </Button>
                  } />
                <DialogContent className="max-w-md max-h-[85vh] p-0 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
                  <DialogHeader className="px-6 pt-6 pb-2 shrink-0 border-b border-neutral-100 dark:border-neutral-800">
                    <DialogTitle>App Settings</DialogTitle>
                    <DialogDescription>
                      Configure your environment viewing and upload preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 custom-scrollbar">
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                         <Label htmlFor="batchEnv" className="text-xs font-bold uppercase tracking-wider text-neutral-500">Default Environment</Label>
                         <Select value={batchEnv} onValueChange={setBatchEnv}>
                            <SelectTrigger id="batchEnv" className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:ring-indigo-500">
                               <SelectValue placeholder="Select Environment" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="DevNightly">DevNightly</SelectItem>
                               <SelectItem value="Regression">Regression</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="grid gap-2">
                         <Label htmlFor="batchVersion" className="text-xs font-bold uppercase tracking-wider text-neutral-500">Version / Sprint</Label>
                         <Input 
                           id="batchVersion" 
                           placeholder="e.g. v2.4.0" 
                           value={batchVersion} 
                           onChange={(e) => setBatchVersion(e.target.value)} 
                           className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:ring-indigo-500"
                         />
                      </div>
                      <div className="grid gap-2">
                         <Label htmlFor="regressionRelease" className="text-xs font-bold uppercase tracking-wider text-neutral-500">Regression Release Name</Label>
                         <Input 
                           id="regressionRelease" 
                           placeholder="e.g. April 2024 Release" 
                           value={regressionReleaseName} 
                           onChange={(e) => setRegressionReleaseName(e.target.value)} 
                           className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:ring-indigo-500"
                         />
                         <p className="text-[10px] text-neutral-400 italic">This label will be displayed when viewing the Regression tab.</p>
                      </div>
                      <div className="grid gap-2">
                         <Label htmlFor="batchFolder" className="text-xs font-bold uppercase tracking-wider text-neutral-500">Target Folder (Optional)</Label>
                         <Input 
                           id="batchFolder" 
                           placeholder="e.g. Forecasting, User Management" 
                           value={batchFolder} 
                           onChange={(e) => setBatchFolder(e.target.value)} 
                           className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:ring-indigo-500"
                         />
                      </div>
                      <div className="grid gap-2">
                         <Label htmlFor="batchDomain" className="text-xs font-bold uppercase tracking-wider text-neutral-500">License Domain (Optional)</Label>
                         <Select value={batchLicenseDomain} onValueChange={setBatchLicenseDomain}>
                            <SelectTrigger id="batchDomain" className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:ring-indigo-500">
                               <SelectValue placeholder="Select Domain" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="None">None</SelectItem>
                               {LICENSE_DOMAINS.map(domain => (
                                 <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mt-2">
                         <div className="space-y-1">
                            <Label htmlFor="lockLibrary" className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Lock Library</Label>
                            <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/60 leading-tight pr-4">
                              Prevent reports from being removed from the library.
                            </p>
                         </div>
                         <Switch 
                           id="lockLibrary" 
                           checked={isLibraryLocked} 
                           onCheckedChange={setIsLibraryLocked} 
                         />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 mt-1">
                         <div className="space-y-1">
                            <Label htmlFor="allowUploads" className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Upload Mode</Label>
                            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 leading-tight pr-4">
                              Enable or disable file dragging and the upload button in the workspace.
                            </p>
                         </div>
                         <Switch 
                           id="allowUploads" 
                           checked={allowUploads} 
                           onCheckedChange={setAllowUploads} 
                         />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Search name or content..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 border-transparent rounded-lg text-sm focus:bg-white dark:focus:bg-neutral-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs 
              value={selectedEnv} 
              onValueChange={(val) => {
                setSelectedEnv(val);
                if (val !== 'All') setBatchEnv(val);
              }} 
              className="mb-0"
            >
               <TabsList className="grid grid-cols-3 bg-neutral-100 dark:bg-neutral-800 h-9 p-1">
                 <TabsTrigger 
                   value="All" 
                   className="text-[10px] flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm"
                 >
                   🌍 All
                 </TabsTrigger>
                 <TabsTrigger 
                   value="DevNightly" 
                   className="text-[10px] transition-colors flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm data-[drag-over=true]:bg-indigo-50 dark:data-[drag-over=true]:bg-indigo-900/40"
                   onDragOver={(e) => { e.preventDefault(); e.currentTarget.setAttribute('data-drag-over', 'true'); }}
                   onDragLeave={(e) => e.currentTarget.removeAttribute('data-drag-over')}
                   onDrop={(e) => {
                     e.preventDefault();
                     e.currentTarget.removeAttribute('data-drag-over');
                     setSelectedEnv('DevNightly');
                     setBatchEnv('DevNightly');
                     handleFileUpload(e.dataTransfer.files, 'DevNightly');
                   }}
                 >
                   DevNightly
                 </TabsTrigger>
                 <TabsTrigger 
                   value="Regression" 
                   className="text-[10px] transition-colors flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm data-[drag-over=true]:bg-indigo-50 dark:data-[drag-over=true]:bg-indigo-900/40"
                   onDragOver={(e) => { e.preventDefault(); e.currentTarget.setAttribute('data-drag-over', 'true'); }}
                   onDragLeave={(e) => e.currentTarget.removeAttribute('data-drag-over')}
                   onDrop={(e) => {
                     e.preventDefault();
                     e.currentTarget.removeAttribute('data-drag-over');
                     setSelectedEnv('Regression');
                     setBatchEnv('Regression');
                     handleFileUpload(e.dataTransfer.files, 'Regression');
                   }}
                 >
                   Regr
                 </TabsTrigger>
               </TabsList>
            </Tabs>

            <input 
              id="fileInput"
              type="file" 
              multiple 
              accept=".html,.mht,.mhtml" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>

          <Separator className="bg-neutral-100 dark:bg-neutral-800" />

          {folders.length > 0 && filteredReports.length > 0 && (
            <div className="px-4 py-2 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Reports ({folders.length} {folders.length === 1 ? 'Folder' : 'Folders'})</span>
                {selectedEnv === 'Regression' && regressionReleaseName && (
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight truncate max-w-[180px]">
                    Release: {regressionReleaseName}
                  </span>
                )}
                {selectedEnv === 'DevNightly' && batchVersion && (
                  <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight truncate max-w-[180px]">
                    Sprint: {batchVersion}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger render={
                    <Button variant="ghost" size="icon-sm" className="h-5 w-5 text-neutral-400 hover:text-indigo-600" onClick={expandAll}>
                      <ChevronsUpDown size={12} />
                    </Button>
                  } />
                  <TooltipContent side="top">Expand All</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={
                    <Button variant="ghost" size="icon-sm" className="h-5 w-5 text-neutral-400 hover:text-indigo-600" onClick={collapseAll}>
                      <ChevronsDownUp size={12} />
                    </Button>
                  } />
                  <TooltipContent side="top">Collapse All</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 min-h-0 px-4 py-4">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-4">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-10 opacity-60">
                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-neutral-200">
                      <Plus className="text-neutral-300" size={24} />
                    </div>
                    <p className="text-sm font-semibold text-neutral-600">No matching reports</p>
                    <p className="text-[10px] text-neutral-400 mt-1 max-w-[150px] mx-auto italic">
                      Drag files onto a Domain, Environment, or Folder to categorise them!
                    </p>
                  </div>
                ) : (
                  folders.map((folderName: string) => {
                    const folderReports = filteredReports.filter(r => (r.folder || 'Uncategorized') === folderName);
                    const isExpanded = !!expandedFolders[folderName]; // Default to collapsed

                    return (
                      <div key={folderName} className="space-y-1">
                        <DroppableFolder 
                          folderName={folderName}
                          isExpanded={isExpanded}
                          onToggle={() => toggleFolder(folderName)}
                          onDrop={(files) => handleFileUpload(files, undefined, folderName === 'Uncategorized' ? '' : folderName)}
                          reportCount={folderReports.length}
                        />
                        
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-2 pt-1 pl-4 border-l border-neutral-100 ml-3">
                                <SortableContext 
                                  items={folderReports.map(r => r.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {folderReports.map((report: LivingDocReport) => (
                                    <SortableReportItem 
                                      key={report.id} 
                                      report={report} 
                                      activeReportIds={activeReportIds}
                                      toggleReportActive={toggleReportActive}
                                      removeReport={confirmDeleteReport}
                                      onUpdate={updateReport}
                                      searchQuery={searchQuery}
                                      isLocked={isLibraryLocked}
                                    />
                                  ))}
                                </SortableContext>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </DndContext>
          </ScrollArea>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 relative bg-neutral-100/50 dark:bg-neutral-900/50 flex flex-col min-w-0" onDrop={onDrop}>
          <AnimatePresence>
            {isDragOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragLeave={() => setIsDragOver(false)}
                className="absolute inset-0 z-50 bg-indigo-600/10 backdrop-blur-[2px] flex items-center justify-center p-8 pointer-events-none"
              >
                <div className="w-full h-full border-4 border-dashed border-indigo-500 rounded-3xl flex flex-col items-center justify-center bg-white/80 dark:bg-neutral-900/80 shadow-2xl scale-95 animate-in zoom-in-95 duration-200">
                  <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-200 dark:shadow-none">
                    <Upload size={32} className="animate-bounce" />
                  </div>
                  <h3 className="text-3xl font-black text-neutral-900 dark:text-neutral-100 mb-2 italic serif">Drop to Upload</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium text-sm">Ready to process your LivingDoc reports</p>
                  <div className="mt-8 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 rounded-full text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                    Target: {selectedEnv === 'All' ? batchEnv : selectedEnv}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-30" />
          {/* Top Bar */}
          <header className="h-16 px-8 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-white dark:bg-neutral-900 px-3 py-1 font-mono text-[10px] tracking-tighter">
                {activeReportIds.length} ACTIVE / {reports.length} TOTAL
              </Badge>
              {activeReportIds.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-neutral-500 hover:text-indigo-600"
                  onClick={() => setActiveReportIds([])}
                >
                  Clear Workspace
                </Button>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-neutral-400" />
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Workspace</span>
                
                <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                  <DialogTrigger render={
                    <button className="ml-1 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-indigo-600 transition-colors cursor-pointer border-none outline-none bg-transparent">
                      <HelpCircle size={16} />
                    </button>
                  } />
                  <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
                    <DialogHeader className="p-8 bg-indigo-600 text-white shrink-0 space-y-2">
                      <DialogTitle className="text-3xl font-black italic serif">How can we help?</DialogTitle>
                      <DialogDescription className="text-indigo-100 opacity-80 border-none p-0">Quick guide to mastering your LivingDoc Explorer</DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 min-h-0 overflow-y-auto border-y border-neutral-100 dark:border-neutral-800">
                       <div className="p-8 grid gap-8">
                          <section className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Upload size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Uploading Files</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                   Drag and drop <span className="font-bold text-indigo-600">LivingDoc</span> files anywhere on the workspace. <span className="font-bold italic text-indigo-600">Important:</span> Only files starting with the name <span className="font-bold text-neutral-900 dark:text-white underline">"LivingDoc"</span> are currently accepted for processing.
                                </p>
                             </div>
                          </section>

                          <section className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <FolderTree size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Categorizing & Reordering</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                   Reports are grouped into folders based on their <span className="font-bold text-indigo-600 italic">License Domain</span>. To reorder reports or move them between folders, simply drag and drop them within the sidebar tree.
                                </p>
                             </div>
                          </section>

                          <section className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <ClipboardCheck size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Managing Status</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                   Status (Passed/Failed) is auto-detected. <span className="font-bold">Right-click</span> any report to manually flag it for <span className="text-rose-500 font-bold">Investigation</span>, mark it as <span className="text-emerald-500 font-bold">Good</span>, or tag it as a <span className="text-yellow-600 font-bold">Flaky Failure</span> (Yellow) to help with review workflows.
                                </p>
                             </div>
                          </section>

                          <section className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <RotateCcw size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Correction: Environments & Folders</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                   Mistakes happen! <span className="font-bold">Right-click</span> a report and select "Change Environment" or "License Domain" to update its metadata. You can also drop files directly onto specific <span className="font-bold text-indigo-600">Environment Tabs</span> at the top of the sidebar to auto-tag them during upload.
                                </p>
                             </div>
                          </section>

                          <section className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                <Trash2 size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Deleting & Safety</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                   To delete a report, use the <span className="font-bold text-rose-500">X</span> button or context menu. A confirmation dialog will ensure you don't lose data accidentally. Note: Folder trees start <span className="italic font-bold">collapsed</span> on fresh starts to keep your library tidy.
                                </p>
                             </div>
                          </section>

                          <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                             <div className="flex items-center gap-2 mb-2">
                                <Zap size={16} className="text-indigo-600" />
                                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Pro Tip</h4>
                             </div>
                             <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Click a report name once to add it to your grid. Click it again to remove it. You can have multiple reports open side-by-side for easy comparison!
                             </p>
                          </div>
                       </div>
                    </div>
                    
                    <DialogFooter className="p-6 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
                       <Button 
                          variant="default" 
                          className="bg-indigo-600 hover:bg-indigo-700 w-full rounded-xl py-6 text-lg"
                          onClick={() => setIsHelpOpen(false)}
                        >
                          Got it, thanks!
                       </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
              
              <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-200/50 dark:border-neutral-800">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <User size={14} />
                </div>
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Welcome, <span className="font-bold text-neutral-900 dark:text-neutral-100">mpantoja</span>
                </span>
              </div>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <div className="p-8 h-full min-h-[calc(100vh-64px)]">
              {activeReportIds.length === 0 ? (
                allowUploads ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-10 px-4 md:px-8">
                     <div 
                       onClick={() => document.getElementById('fileInput')?.click()}
                       className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-12 group relative border-4 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[40px] cursor-pointer transition-all hover:border-indigo-500 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 hover:shadow-[0_0_50px_-12px_rgba(79,70,229,0.1)] active:scale-[0.99]"
                     >
                       <div className="absolute inset-0 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.01] rounded-[36px]" />
                       
                       <div className="w-32 h-32 bg-indigo-600 dark:bg-indigo-600 rounded-[32px] flex items-center justify-center text-white mb-10 shadow-2xl shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3 rotate-0">
                          <Upload size={56} strokeWidth={2.5} />
                       </div>
                       
                       <h2 className="text-5xl font-black text-neutral-900 dark:text-neutral-100 mb-6 tracking-tight">
                         <span className="italic serif">Drop</span> your reports here
                       </h2>
                       
                       <p className="text-xl text-neutral-500 dark:text-neutral-400 mb-12 max-w-md mx-auto font-medium leading-relaxed">
                         Drag your <span className="text-indigo-600 font-bold">LivingDoc</span> files directly into this box to instantly process and view them.
                       </p>
                       
                       <div className="flex flex-col items-center gap-6">
                          <div className="flex items-center gap-4 text-neutral-300 dark:text-neutral-700">
                             <div className="h-px w-12 bg-current" />
                             <span className="text-sm font-bold uppercase tracking-widest text-neutral-400">or</span>
                             <div className="h-px w-12 bg-current" />
                          </div>

                          <Button 
                             size="lg"
                             className="bg-indigo-600 hover:bg-indigo-700 text-white gap-3 px-10 py-8 rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                             onClick={(e) => {
                               e.stopPropagation();
                               document.getElementById('fileInput')?.click();
                             }}
                          >
                             <Plus size={24} strokeWidth={3} />
                             <span className="text-xl font-bold">Choose Files</span>
                          </Button>
                       </div>
                     </div>
                  </div>
                ) : (
                  <EnvironmentStatusGraphic 
                    env={selectedEnv} 
                    domain={selectedDomain} 
                    releaseName={selectedEnv === 'Regression' ? regressionReleaseName : undefined}
                    versionName={selectedEnv === 'DevNightly' ? batchVersion : undefined}
                  />
                )
              ) : (
                <div className={cn(
                  "grid gap-6 h-full transition-all duration-500 p-8",
                  activeReportIds.length === 1 ? "grid-cols-1" : 
                  activeReportIds.length === 2 ? "grid-cols-2" : 
                  activeReportIds.length <= 4 ? "grid-cols-2 md:grid-cols-2" : 
                  "grid-cols-2 lg:grid-cols-3"
                )}>
                  <AnimatePresence mode="popLayout">
                    {activeReportIds.map(id => {
                      const report = reports.find(r => r.id === id);
                      if (!report) return null;
                      
                      const isMaximized = maximizedReportId === id;
                      
                      return (
                        <motion.div
                          key={id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            zIndex: isMaximized ? 50 : 1,
                            position: isMaximized ? 'fixed' : 'relative',
                            top: isMaximized ? 0 : 'auto',
                            left: isMaximized ? 0 : 'auto',
                            width: isMaximized ? '100vw' : '100%',
                            height: isMaximized ? '100vh' : 'auto'
                          }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          className={cn(
                            "flex flex-col group",
                            !isMaximized && "aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-white bg-white",
                            isMaximized && "bg-white p-0"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-between px-4 h-12 shrink-0 select-none",
                            isMaximized ? "bg-indigo-600 text-white" : "bg-neutral-50/50 border-b border-neutral-100 group-hover:bg-neutral-100/50 transition-colors"
                          )}>
                            <div className="flex items-center gap-2 overflow-hidden max-w-[70%]">
                              <FileText size={14} className={isMaximized ? "text-indigo-200" : "text-indigo-600"} />
                              <span className="text-xs font-bold truncate tracking-tight">{report.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger render={
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setMaximizedReportId(isMaximized ? null : id); }}
                                    className={cn(
                                      "p-1.5 rounded-lg transition-colors cursor-pointer border-none outline-none bg-transparent",
                                      isMaximized ? "bg-white/20 hover:bg-white/30 text-white" : "hover:bg-white bg-white/0 text-neutral-500 hover:text-indigo-600"
                                    )}
                                  >
                                    {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                  </button>
                                } />
                                <TooltipContent side="bottom">{isMaximized ? 'Minimize' : 'Maximize'}</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger render={
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleReportActive(id); }}
                                    className={cn(
                                      "p-1.5 rounded-lg transition-colors cursor-pointer border-none outline-none bg-transparent",
                                      isMaximized ? "bg-white/20 hover:bg-white/30 text-white" : "hover:bg-white bg-white/0 text-neutral-500 hover:text-red-500"
                                    )}
                                  >
                                    <X size={14} />
                                  </button>
                                } />
                                <TooltipContent side="bottom">Remove from Grid</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="flex-1 bg-neutral-200/20 relative overflow-hidden">
                            <iframe 
                              src={report.url} 
                              className="w-[100%] h-[100%] border-none absolute inset-0"
                              title={report.name}
                            />
                            {/* Overlay to allow clicking the card without browser interactions unless active */}
                            {!isMaximized && (
                               <div className="absolute inset-0 z-10 pointer-events-none group-hover:bg-indigo-600/5 transition-colors" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </ScrollArea>
        </main>

        {/* Global Drop Zone Overlay */}
        <AnimatePresence>
          {isDragOver && allowUploads && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-indigo-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-10 select-none"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
            >
              <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center mb-8 animate-bounce">
                <Upload size={64} />
              </div>
              <h2 className="text-4xl font-black mb-4">Release to Upload</h2>
              <p className="text-indigo-100 text-lg max-w-sm text-center">
                We'll only accept files starting with <span className="font-bold text-white uppercase tracking-wider">LivingDoc</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Replacement Confirmation Dialog */}
        <Dialog open={conflictQueue.length > 0} onOpenChange={(open) => !open && resolveConflict(false)}>
           <DialogContent className="max-w-md">
              <DialogHeader>
                 <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
                    <AlertTriangle size={24} />
                 </div>
                 <DialogTitle className="text-xl font-bold">Replace existing file?</DialogTitle>
                 <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                    A report named <span className="font-bold text-neutral-900 dark:text-neutral-100 italic">"{conflictQueue[0]?.file.name}"</span> already exists in the 
                    <span className="font-bold text-indigo-600 dark:text-indigo-400"> {conflictQueue[0]?.uploadParams.uploadEnv}</span> environment. 
                    Do you want to replace it?
                 </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0 mt-6">
                 <Button 
                   variant="outline" 
                   onClick={() => resolveConflict(false)}
                   className="flex-1"
                 >
                    Cancel
                 </Button>
                 <Button 
                   variant="default" 
                   onClick={() => resolveConflict(true)}
                   className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                 >
                    Yes, Replace
                 </Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

        {/* Delete Report Confirmation Dialog */}
        <Dialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
           <DialogContent className="max-w-md">
              <DialogHeader>
                 <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                    <Trash2 size={24} />
                 </div>
                 <DialogTitle className="text-xl font-bold">Delete Report?</DialogTitle>
                 <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                    Are you sure you want to delete the <span className="font-bold text-neutral-900 dark:text-neutral-100 italic">"{reportToDelete?.name}"</span> report? This action cannot be undone.
                 </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0 mt-6">
                 <Button 
                   variant="outline" 
                   onClick={() => setReportToDelete(null)}
                   className="flex-1"
                 >
                    Cancel
                 </Button>
                 <Button 
                   variant="destructive" 
                   onClick={() => {
                     if (reportToDelete) removeReport(reportToDelete.id);
                     setReportToDelete(null);
                   }}
                   className="flex-1"
                 >
                    Delete
                 </Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
