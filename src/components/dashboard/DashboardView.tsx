import React from 'react';
import {
  LayoutGrid,
  Plus,
  FolderOpen,
  Sparkles,
  FileText,
  Clock,
  Cpu,
  HardDrive,
  BarChart3,
  ArrowRight,
  Star,
} from 'lucide-react';
import { PREBUILT_TEMPLATES } from '../../data/templates';
import { DiagramProject } from '../../types/workflow';

interface DashboardViewProps {
  onNewDiagram: () => void;
  onOpenTemplatesModal: () => void;
  onOpenAiModal: () => void;
  onLoadProject: (project: DiagramProject) => void;
  savedProjects: DiagramProject[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNewDiagram,
  onOpenTemplatesModal,
  onOpenAiModal,
  onLoadProject,
  savedProjects,
}) => {
  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 overflow-y-auto select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Enterprise Workflow Suite</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Workflow Designer Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">
              Design, model, and automate enterprise process diagrams with AI Assistance
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onNewDiagram}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Blank Diagram</span>
            </button>
            <button
              onClick={onOpenAiModal}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate with AI</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics Bar */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Total Diagrams</span>
              <span className="text-2xl font-bold text-white font-mono">{savedProjects.length}</span>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Active Templates</span>
              <span className="text-2xl font-bold text-white font-mono">{PREBUILT_TEMPLATES.length}</span>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">CPU Telemetry</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">12%</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Memory Allocation</span>
              <span className="text-2xl font-bold text-purple-400 font-mono">148 MB</span>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Featured Templates Quick Pick */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">Featured Enterprise Templates</h2>
            <button
              onClick={onOpenTemplatesModal}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View All Templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {PREBUILT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => onLoadProject(template)}
                className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      {template.type}
                    </span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors mb-1">
                    {template.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{template.nodes.length} Nodes</span>
                  <span className="group-hover:text-indigo-400 flex items-center space-x-1">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
