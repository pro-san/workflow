import React, { useState } from 'react';
import { X, FolderOpen, Tag, ArrowRight, Check } from 'lucide-react';
import { PREBUILT_TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/templates';
import { DiagramProject } from '../../types/workflow';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DiagramProject) => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = PREBUILT_TEMPLATES.filter((t) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'bpmn') return t.type === 'BPMN';
    if (selectedCategory === 'flowchart') return t.type === 'Flowchart';
    if (selectedCategory === 'uml') return t.type === 'UML';
    if (selectedCategory === 'cloud') return t.type === 'Cloud Architecture';
    return true;
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Enterprise Templates Gallery</h2>
              <p className="text-[11px] text-slate-400">Pre-built industry standard process flows</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 p-3 bg-slate-950/30 border-b border-slate-800 overflow-x-auto text-xs">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-5 flex-1 overflow-y-auto grid grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    {template.type}
                  </span>
                  <span className="text-[11px] text-slate-500">{template.nodes.length} Nodes</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors mb-1">
                  {template.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all shadow"
                >
                  <span>Load</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
