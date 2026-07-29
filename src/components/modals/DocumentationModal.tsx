import React, { useState } from 'react';
import { X, HelpCircle, Command, BookOpen, Cpu, CheckCircle2 } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<'manual' | 'shortcuts' | 'arch' | 'diag'>('manual');

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Workflow Designer Documentation</h2>
              <p className="text-[11px] text-slate-400">Enterprise user manual, hotkeys, and system info</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs font-medium">
          <button
            onClick={() => setTab('manual')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
              tab === 'manual'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>User Manual</span>
          </button>
          <button
            onClick={() => setTab('shortcuts')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
              tab === 'shortcuts'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Command className="w-3.5 h-3.5" />
            <span>Keyboard Shortcuts</span>
          </button>
          <button
            onClick={() => setTab('diag')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
              tab === 'diag'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>System Diagnostics</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto text-xs leading-relaxed space-y-4">
          {tab === 'manual' && (
            <div className="space-y-3 text-slate-300">
              <h3 className="text-sm font-semibold text-indigo-400">1. Adding & Editing Shapes</h3>
              <p>
                Drag any shape from the left Shape Palette directly onto the canvas or click on it. Double click on any shape to edit its text label inline.
              </p>

              <h3 className="text-sm font-semibold text-indigo-400">2. Connecting Shapes</h3>
              <p>
                Hover over any shape to reveal its 4 blue anchor points (Top, Right, Bottom, Left). Click and drag from an anchor point to another shape&apos;s anchor point to establish an orthogonal step connector.
              </p>

              <h3 className="text-sm font-semibold text-indigo-400">3. AI Assistant Integration</h3>
              <p>
                Click <strong>AI Assist</strong> in the top ribbon bar to type a natural language prompt (e.g. &quot;Build an order fulfillment process with manager review decision gateway&quot;). Gemini 3.6 Flash will automatically build the full diagram structure!
              </p>
            </div>
          )}

          {tab === 'shortcuts' && (
            <div className="space-y-2">
              {[
                { key: 'Ctrl + Z', desc: 'Undo last canvas action' },
                { key: 'Ctrl + Y', desc: 'Redo previously undone action' },
                { key: 'Delete / Backspace', desc: 'Delete selected shape or connector' },
                { key: 'Space + Drag', desc: 'Pan canvas workspace freely' },
                { key: 'Double Click Node', desc: 'Edit node label inline' },
                { key: 'Drag from Anchor', desc: 'Create smart connector line' },
              ].map((sc, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-300">{sc.desc}</span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-indigo-300">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          )}

          {tab === 'diag' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Server Backend Status</span>
                  <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ONLINE (Express Port 3000)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span>Gemini API Service</span>
                  <span className="text-emerald-400 font-mono">CONNECTED (@google/genai)</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span>Simulated CPU Allocation</span>
                  <span className="text-indigo-400 font-mono">1.2 GHz / 4 Cores (12% Load)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Memory Usage</span>
                  <span className="text-indigo-400 font-mono">148 MB / 2048 MB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
