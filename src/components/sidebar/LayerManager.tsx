import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Layers, Sliders, Copy } from 'lucide-react';
import { CanvasLayer } from '../../types/workflow';

interface LayerManagerProps {
  layers: CanvasLayer[];
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  onAddLayer: () => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateOpacity: (id: string, opacity: number) => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
}

export const LayerManager: React.FC<LayerManagerProps> = ({
  layers,
  activeLayerId,
  setActiveLayerId,
  onAddLayer,
  onToggleVisibility,
  onToggleLock,
  onUpdateOpacity,
  onDuplicateLayer,
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

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {layers.map((layer) => {
          const isActive = layer.id === activeLayerId;
          const currentOpacity = typeof layer.opacity === 'number' ? layer.opacity : 1;
          const opacityPercent = Math.round(currentOpacity * 100);

          return (
            <div
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer text-xs space-y-2 ${
                isActive
                  ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-200 shadow-sm'
                  : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate">
                  <span className="font-semibold truncate">{layer.name}</span>
                  {isActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-mono font-bold">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleVisibility(layer.id)}
                    className="p-1 hover:text-white text-slate-400 transition-colors"
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5 text-indigo-300" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  <button
                    onClick={() => onToggleLock(layer.id)}
                    className="p-1 hover:text-white text-slate-400 transition-colors"
                    title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {layer.locked ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  <button
                    onClick={() => onDuplicateLayer(layer.id)}
                    className="p-1 hover:text-indigo-300 text-slate-400 transition-colors"
                    title="Duplicate Layer and Shapes"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {layers.length > 1 && (
                    <button
                      onClick={() => onDeleteLayer(layer.id)}
                      className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                      title="Delete Layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Opacity Control Slider */}
              <div
                className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-[11px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-1 text-slate-400 w-16 flex-shrink-0">
                  <Sliders className="w-3 h-3 text-indigo-400/80" />
                  <span className="text-[10px] font-medium">Opacity</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentOpacity}
                  onChange={(e) => onUpdateOpacity(layer.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all border border-slate-700/50"
                  title={`Adjust ${layer.name} opacity: ${opacityPercent}%`}
                />
                <span className="text-[10px] font-mono text-slate-300 w-8 text-right flex-shrink-0 font-semibold">
                  {opacityPercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

