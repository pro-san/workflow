import React, { useState } from 'react';
import {
  FileText,
  Save,
  Download,
  FolderOpen,
  Printer,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Sparkles,
  HelpCircle,
  LayoutGrid,
  Layers,
  Lock,
  Unlock,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalSpaceAround as AlignTop,
  Plus,
  Palette,
  CheckCircle2,
  FileCode,
  Sliders,
  Share2,
} from 'lucide-react';
import { ActiveTool, AutoLayoutAlgorithm, DiagramProject, ThemeName } from '../../types/workflow';

interface RibbonBarProps {
  project: DiagramProject;
  setProject: React.Dispatch<React.SetStateAction<DiagramProject>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  snapToGrid: boolean;
  setSnapToGrid: React.Dispatch<React.SetStateAction<boolean>>;
  showRulers: boolean;
  setShowRulers: React.Dispatch<React.SetStateAction<boolean>>;
  showMiniMap: boolean;
  setShowMiniMap: React.Dispatch<React.SetStateAction<boolean>>;
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onNewDiagram: () => void;
  onOpenExportModal: () => void;
  onOpenTemplatesModal: () => void;
  onOpenPluginsModal: () => void;
  onOpenAiModal: (tab?: 'generate' | 'explain' | 'validate') => void;
  onOpenDocModal: () => void;
  onApplyAutoLayout: (algo: AutoLayoutAlgorithm) => void;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  selectedNodeIds: string[];
  onAlignNodes: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDeleteSelected: () => void;
}

export const RibbonBar: React.FC<RibbonBarProps> = ({
  project,
  setProject,
  zoom,
  setZoom,
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid,
  showRulers,
  setShowRulers,
  showMiniMap,
  setShowMiniMap,
  activeTool,
  setActiveTool,
  undo,
  redo,
  canUndo,
  canRedo,
  onNewDiagram,
  onOpenExportModal,
  onOpenTemplatesModal,
  onOpenPluginsModal,
  onOpenAiModal,
  onOpenDocModal,
  onApplyAutoLayout,
  theme,
  setTheme,
  selectedNodeIds,
  onAlignNodes,
  onDeleteSelected,
}) => {
  const [activeTab, setActiveTab] = useState<
    'file' | 'edit' | 'view' | 'insert' | 'arrange' | 'tools' | 'ai' | 'help'
  >('file');

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-200 select-none shadow-md">
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={project.title}
                onChange={(e) => setProject({ ...project, title: e.target.value })}
                className="bg-transparent text-sm font-semibold text-slate-100 hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5"
              />
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                {project.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 px-1">Enterprise Workflow Studio v3.2</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenAiModal('generate')}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assist</span>
          </button>
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Ribbon Tabs Navigation Header */}
      <div className="flex items-center px-3 bg-slate-900 border-b border-slate-800 text-xs">
        {[
          { id: 'file', label: 'File' },
          { id: 'edit', label: 'Edit' },
          { id: 'view', label: 'View' },
          { id: 'insert', label: 'Insert' },
          { id: 'arrange', label: 'Arrange' },
          { id: 'tools', label: 'Tools' },
          { id: 'ai', label: 'AI Assistant', icon: Sparkles },
          { id: 'help', label: 'Help' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1 px-3 py-2 font-medium border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 text-purple-400" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ribbon Action Toolbar Panel */}
      <div className="p-2.5 bg-slate-900/95 flex items-center space-x-4 overflow-x-auto text-xs min-h-[60px]">
        {activeTab === 'file' && (
          <>
            <div className="flex items-center space-x-1 pr-3 border-r border-slate-800">
              <button
                onClick={onNewDiagram}
                className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="New Diagram"
              >
                <Plus className="w-4 h-4 text-emerald-400 mb-0.5" />
                <span>New</span>
              </button>
              <button
                onClick={onOpenTemplatesModal}
                className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Templates Gallery"
              >
                <FolderOpen className="w-4 h-4 text-sky-400 mb-0.5" />
                <span>Templates</span>
              </button>
            </div>
            <div className="flex items-center space-x-1 pr-3 border-r border-slate-800">
              <button
                onClick={onOpenExportModal}
                className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Export Diagram"
              >
                <Download className="w-4 h-4 text-indigo-400 mb-0.5" />
                <span>Export As...</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Print Diagram"
              >
                <Printer className="w-4 h-4 text-purple-400 mb-0.5" />
                <span>Print</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'edit' && (
          <>
            <div className="flex items-center space-x-1 pr-3 border-r border-slate-800">
              <button
                disabled={!canUndo}
                onClick={undo}
                className={`flex flex-col items-center justify-center p-1.5 rounded ${
                  canUndo ? 'hover:bg-slate-800 text-slate-200' : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4 mb-0.5" />
                <span>Undo</span>
              </button>
              <button
                disabled={!canRedo}
                onClick={redo}
                className={`flex flex-col items-center justify-center p-1.5 rounded ${
                  canRedo ? 'hover:bg-slate-800 text-slate-200' : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4 mb-0.5" />
                <span>Redo</span>
              </button>
            </div>

            <div className="flex items-center space-x-1 pr-3 border-r border-slate-800">
              <button
                onClick={onDeleteSelected}
                disabled={selectedNodeIds.length === 0}
                className={`flex flex-col items-center justify-center p-1.5 rounded ${
                  selectedNodeIds.length > 0
                    ? 'hover:bg-red-500/20 text-red-400'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4 mb-0.5" />
                <span>Delete</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'view' && (
          <>
            <div className="flex items-center space-x-1 pr-3 border-r border-slate-800">
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-12 text-center text-slate-400">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white text-xs font-mono"
                title="Reset Zoom 100%"
              >
                100%
              </button>
            </div>

            <div className="flex items-center space-x-2 pr-3 border-r border-slate-800">
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0"
                />
                <span>Grid</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0"
                />
                <span>Snap Grid</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showRulers}
                  onChange={(e) => setShowRulers(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0"
                />
                <span>Rulers</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showMiniMap}
                  onChange={(e) => setShowMiniMap(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0"
                />
                <span>MiniMap</span>
              </label>
            </div>

            <div className="flex items-center space-x-1">
              <Palette className="w-4 h-4 text-purple-400 mr-1" />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeName)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="dark_studio">Dark Studio</option>
                <option value="light_enterprise">Light Enterprise</option>
                <option value="blueprint">Architectural Blueprint</option>
                <option value="cyberpunk">Cyber Neon</option>
                <option value="warm_sunset">Warm Sunset</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'arrange' && (
          <>
            <div className="flex items-center space-x-1 pr-3 border-r border-slate-800">
              <span className="text-slate-400 mr-2 text-[11px]">Align Nodes:</span>
              <button
                onClick={() => onAlignNodes('left')}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAlignNodes('center')}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAlignNodes('right')}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAlignNodes('top')}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
                title="Align Top"
              >
                <AlignTop className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {activeTab === 'tools' && (
          <>
            <div className="flex items-center space-x-1 pr-3 border-r border-slate-800">
              <span className="text-slate-400 mr-2 text-[11px]">Auto Layout:</span>
              <button
                onClick={() => onApplyAutoLayout('horizontal_tree')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
              >
                Horizontal Tree
              </button>
              <button
                onClick={() => onApplyAutoLayout('vertical_tree')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
              >
                Vertical Tree
              </button>
              <button
                onClick={() => onApplyAutoLayout('circular')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
              >
                Circular
              </button>
              <button
                onClick={() => onApplyAutoLayout('organic')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
              >
                Organic
              </button>
            </div>

            <button
              onClick={onOpenPluginsModal}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
            >
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Plugin Manager</span>
            </button>
          </>
        )}

        {activeTab === 'ai' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenAiModal('generate')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded font-medium shadow-sm hover:from-indigo-500 hover:to-purple-500"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Workflow from Text Prompt</span>
            </button>
            <button
              onClick={() => onOpenAiModal('explain')}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Generate Executive Summary</span>
            </button>
            <button
              onClick={() => onOpenAiModal('validate')}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Audit BPMN / Flowchart</span>
            </button>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenDocModal}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>User Manual & Shortcuts</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
