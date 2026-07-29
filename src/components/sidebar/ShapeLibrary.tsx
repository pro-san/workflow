import React, { useState } from 'react';
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
} from 'lucide-react';
import { SHAPE_CATALOG, ShapeDefinition } from '../../data/shapeDefinitions';
import { ShapeCategory, ShapeType } from '../../types/workflow';

interface ShapeLibraryProps {
  onAddShape: (type: ShapeType) => void;
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

export const ShapeLibrary: React.FC<ShapeLibraryProps> = ({ onAddShape }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

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

  const filteredShapes = SHAPE_CATALOG.filter(
    (shape) =>
      shape.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shape.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200 select-none">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Shape Palette
        </h2>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search shapes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800 text-xs text-slate-200 rounded border border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Accordion Shape Groups */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
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
