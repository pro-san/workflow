import React, { useState, useEffect } from 'react';
import {
  Search,
  Square,
  Circle,
  Diamond,
  Triangle,
  PlayCircle,
  StopCircle,
  UserCheck,
  Cpu,
  Code,
  GitFork,
  GitMerge,
  FileText,
  Database,
  Cloud,
  User,
  Layers,
  CircleEllipsis,
  Type,
  StickyNote,
  BoxSelect,
  Hexagon,
  ChevronDown,
  ChevronRight,
  Bookmark,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Paintbrush,
} from 'lucide-react';
import { SHAPE_CATALOG } from '../../data/shapeDefinitions';
import { ShapeCategory, ShapeType, CanvasNode } from '../../types/workflow';
import {
  NodeStyleTemplate,
  BUILT_IN_TEMPLATES,
  loadUserTemplates,
  saveUserTemplates,
  createTemplateFromNode,
} from '../../utils/templateStorage';

interface ShapeLibraryProps {
  onAddShape: (type: ShapeType) => void;
  selectedNodes?: CanvasNode[];
  onAddNodeWithTemplate?: (template: NodeStyleTemplate) => void;
  onApplyTemplateToSelected?: (template: NodeStyleTemplate) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Square,
  BoxSelect,
  Circle,
  Diamond,
  Triangle,
  Hexagon,
  PlayCircle,
  StopCircle,
  UserCheck,
  Cpu,
  Code,
  GitFork,
  GitMerge,
  FileText,
  Database,
  Cloud,
  User,
  Layers,
  CircleEllipsis,
  Type,
  StickyNote,
};

export const ShapeLibrary: React.FC<ShapeLibraryProps> = ({
  onAddShape,
  selectedNodes = [],
  onAddNodeWithTemplate,
  onApplyTemplateToSelected,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  
  // Custom Node Style Templates State
  const [userTemplates, setUserTemplates] = useState<NodeStyleTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Load custom templates on mount
  useEffect(() => {
    setUserTemplates(loadUserTemplates());
  }, []);

  const categories: { id: ShapeCategory; label: string }[] = [
    { id: 'bpmn', label: 'BPMN 2.0 Process' },
    { id: 'flowchart', label: 'Flowchart' },
    { id: 'basic', label: 'Basic Shapes' },
    { id: 'uml', label: 'UML Elements' },
    { id: 'cloud', label: 'Cloud & Infrastructure' },
    { id: 'widget', label: 'Widgets & Annotations' },
  ];

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null;

  // Handle Save Selected Node Style as Template
  const handleSaveCurrentNodeStyle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    const templateName = newTemplateName.trim() || `${selectedNode.label || 'Node'} Style`;
    const newTemplate = createTemplateFromNode(selectedNode, templateName);

    const updated = [newTemplate, ...userTemplates];
    setUserTemplates(updated);
    saveUserTemplates(updated);
    setNewTemplateName('');

    setSaveSuccessMsg(`Saved "${templateName}"!`);
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  // Handle Delete Custom Template
  const handleDeleteTemplate = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = userTemplates.filter((t) => t.id !== id);
    setUserTemplates(updated);
    saveUserTemplates(updated);
  };

  const allTemplates = [...userTemplates, ...BUILT_IN_TEMPLATES];

  const filteredShapes = SHAPE_CATALOG.filter(
    (shape) =>
      shape.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shape.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = allTemplates.filter(
    (tpl) =>
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.shapeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200 select-none">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Shape Palette & Templates
        </h2>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search shapes & style templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800 text-xs text-slate-200 rounded border border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Save Selected Node Style Card */}
      <div className="p-2.5 border-b border-slate-800 bg-indigo-950/20">
        {selectedNode ? (
          <form onSubmit={handleSaveCurrentNodeStyle} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
              <div className="flex items-center space-x-1.5">
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save Custom Style</span>
              </div>
              <span className="text-[10px] bg-indigo-900/60 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-700/40 truncate max-w-[90px]">
                {selectedNode.label || selectedNode.type}
              </span>
            </div>

            {/* Swatch Preview of Selected Node */}
            <div className="flex items-center space-x-2 bg-slate-950/60 p-1.5 rounded border border-indigo-900/40 text-[10px] text-slate-300">
              <div
                className="w-5 h-5 rounded border shrink-0"
                style={{
                  backgroundColor: selectedNode.fill,
                  borderColor: selectedNode.stroke,
                  borderWidth: `${Math.min(selectedNode.strokeWidth, 3)}px`,
                }}
              />
              <div className="truncate flex-1">
                <span className="text-slate-400">Fill: </span>
                <span className="font-mono text-slate-200">{selectedNode.fill}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                placeholder="Template name..."
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1 shrink-0"
                title="Save style template"
              >
                <Plus className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
                <Check className="w-3 h-3" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
          </form>
        ) : (
          <div className="flex items-start space-x-2 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Select a node on canvas to save its custom colors, stroke & font as a reusable template.
            </p>
          </div>
        )}
      </div>

      {/* Accordion Shape Groups & Style Templates */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* REUSABLE STYLE TEMPLATES CATEGORY */}
        <div className="bg-slate-950/40 rounded-lg border border-indigo-900/50 overflow-hidden">
          <button
            onClick={() => toggleCategory('custom_templates')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-950/30 transition-colors"
          >
            <div className="flex items-center space-x-1.5">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              <span>Saved Style Templates ({filteredTemplates.length})</span>
            </div>
            {collapsedCategories['custom_templates'] ? (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {!collapsedCategories['custom_templates'] && (
            <div className="p-2 space-y-2 border-t border-indigo-900/30">
              {filteredTemplates.length === 0 ? (
                <div className="text-[11px] text-slate-500 text-center py-3 italic">
                  No saved templates found.
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group p-2 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-lg transition-all flex flex-col space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        {/* Swatch Preview Box */}
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center shrink-0 shadow-sm border"
                          style={{
                            backgroundColor: template.fill,
                            borderColor: template.stroke,
                            borderWidth: `${Math.min(template.strokeWidth, 2)}px`,
                            boxShadow: template.glow ? `0 0 8px ${template.stroke}` : undefined,
                          }}
                        >
                          <Paintbrush
                            className="w-3 h-3"
                            style={{ color: template.textColor || '#ffffff' }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white flex items-center space-x-1">
                            <span className="truncate">{template.name}</span>
                            {template.isBuiltIn && (
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded shrink-0">
                                Preset
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center space-x-1.5">
                            <span className="capitalize">{template.shapeType.replace(/_/g, ' ')}</span>
                            <span>•</span>
                            <span className="font-mono">{template.fill}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Custom Template */}
                      {!template.isBuiltIn && (
                        <button
                          onClick={(e) => handleDeleteTemplate(template.id, template.name, e)}
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center space-x-1 pt-1 border-t border-slate-800/40 text-[10px]">
                      <button
                        onClick={() => onAddNodeWithTemplate && onAddNodeWithTemplate(template)}
                        className="flex-1 py-1 px-1.5 bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700/60 hover:border-indigo-500/40 rounded transition-colors flex items-center justify-center space-x-1"
                        title="Add a new node using this template style"
                      >
                        <Plus className="w-3 h-3 text-indigo-400" />
                        <span>Add Node</span>
                      </button>

                      {selectedNodes.length > 0 && (
                        <button
                          onClick={() =>
                            onApplyTemplateToSelected && onApplyTemplateToSelected(template)
                          }
                          className="flex-1 py-1 px-1.5 bg-indigo-900/40 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-700/50 rounded transition-colors flex items-center justify-center space-x-1 font-medium"
                          title="Apply this template style to currently selected node(s)"
                        >
                          <Paintbrush className="w-3 h-3 text-indigo-300" />
                          <span>Apply Style</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* STANDARD SHAPE CATEGORIES */}
        {categories.map((cat) => {
          const categoryShapes = filteredShapes.filter((s) => s.category === cat.id);
          if (categoryShapes.length === 0) return null;

          const isCollapsed = collapsedCategories[cat.id];

          return (
            <div key={cat.id} className="bg-slate-950/30 rounded-lg border border-slate-800/80 overflow-hidden">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <span>{cat.label}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {!isCollapsed && (
                <div className="p-2 grid grid-cols-2 gap-2 border-t border-slate-800/50">
                  {categoryShapes.map((shape) => {
                    const Icon = ICON_MAP[shape.iconName] || Square;
                    return (
                      <button
                        key={shape.type}
                        onClick={() => onAddShape(shape.type)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('shapeType', shape.type);
                        }}
                        className="flex flex-col items-center justify-center p-2.5 bg-slate-800/60 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-slate-700/50 rounded-lg transition-all group cursor-grab active:cursor-grabbing text-center"
                        title={shape.description}
                      >
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-md mb-1.5 transition-transform group-hover:scale-110"
                          style={{ color: shape.defaultFill }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-medium text-slate-300 group-hover:text-white line-clamp-1">
                          {shape.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
