import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Layers } from 'lucide-react';
import { CanvasLayer } from '../../types/workflow';

interface LayerManagerProps {
  layers: CanvasLayer[];
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  onAddLayer: () => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
}

export const LayerManager: React.FC<LayerManagerProps> = ({
  layers,
  activeLayerId,
  setActiveLayerId,
  onAddLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
}) => {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200 select-none">
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Layers ({layers.length})
          </h2>
        </div>
        <button
          onClick={onAddLayer}
          className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          title="Add New Layer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {layers.map((layer) => {
          const isActive = layer.id === activeLayerId;
          return (
            <div
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer text-xs ${
                isActive
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="font-medium truncate">{layer.name}</span>
                {isActive && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 font-mono">
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onToggleVisibility(layer.id)}
                  className="p-1 hover:text-white text-slate-400"
                  title="Toggle Visibility"
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                </button>
                <button
                  onClick={() => onToggleLock(layer.id)}
                  className="p-1 hover:text-white text-slate-400"
                  title="Toggle Lock"
                >
                  {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                {layers.length > 1 && (
                  <button
                    onClick={() => onDeleteLayer(layer.id)}
                    className="p-1 hover:text-red-400 text-slate-500"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
