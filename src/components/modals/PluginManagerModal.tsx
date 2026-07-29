import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, ShieldCheck, Power } from 'lucide-react';
import { PluginDefinition } from '../../types/workflow';

interface PluginManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PluginManagerModal: React.FC<PluginManagerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [plugins, setPlugins] = useState<PluginDefinition[]>([
    {
      id: 'plugin_1',
      name: 'Process Cost & SLA Calculator',
      version: '1.4.0',
      description: 'Calculates monetary cost, cycle time, and bottleneck metrics across BPMN tasks.',
      author: 'Workflow Enterprise Core',
      enabled: true,
      category: 'Analytics',
    },
    {
      id: 'plugin_2',
      name: 'Automated BPMN 2.0 Linter',
      version: '2.1.0',
      description: 'Real-time warning indicators for orphan nodes and unmatched gateway splits.',
      author: 'OMG Process Group',
      enabled: true,
      category: 'Validation',
    },
    {
      id: 'plugin_3',
      name: 'Swagger / OpenAPI Spec Generator',
      version: '1.0.2',
      description: 'Exports workflow endpoints directly to OpenAPI 3.0 REST specification JSON.',
      author: 'DevOps Tools',
      enabled: false,
      category: 'Export',
    },
    {
      id: 'plugin_4',
      name: 'Auto-Smart Layout Optimizer',
      version: '3.0.0',
      description: 'Uses graph-force routing to eliminate line crossings automatically.',
      author: 'Graphviz Labs',
      enabled: true,
      category: 'Automation',
    },
  ]);

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Plugin Marketplace & Manager</h2>
              <p className="text-[11px] text-slate-400">Extend workflow capabilities with custom plugins</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plugin List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between"
            >
              <div className="space-y-1 pr-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-semibold text-slate-100">{plugin.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">v{plugin.version}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-indigo-400 rounded">
                    {plugin.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{plugin.description}</p>
                <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>By {plugin.author}</span>
                </div>
              </div>

              <button
                onClick={() => togglePlugin(plugin.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  plugin.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{plugin.enabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
