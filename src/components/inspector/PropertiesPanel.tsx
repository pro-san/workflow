import React from 'react';
import {
  Sliders,
  Type,
  Palette,
  Maximize,
  Sparkles,
  Link2,
  Trash2,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';
import {
  AnchorPoint,
  ArrowType,
  CanvasConnector,
  CanvasNode,
  ConnectorLineStyle,
  DiagramProject,
} from '../../types/workflow';

interface PropertiesPanelProps {
  project: DiagramProject;
  selectedNodeIds: string[];
  selectedConnectorIds: string[];
  onUpdateNodes: (updatedNodes: CanvasNode[]) => void;
  onUpdateConnectors: (updatedConnectors: CanvasConnector[]) => void;
  onDeleteSelected: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  project,
  selectedNodeIds,
  selectedConnectorIds,
  onUpdateNodes,
  onUpdateConnectors,
  onDeleteSelected,
}) => {
  const selectedNodes = project.nodes.filter((n) => selectedNodeIds.includes(n.id));
  const selectedConnectors = project.connectors.filter((c) => selectedConnectorIds.includes(c.id));

  const hasSelectedNode = selectedNodes.length > 0;
  const hasSelectedConnector = selectedConnectors.length > 0;

  const firstNode = selectedNodes[0];
  const firstConnector = selectedConnectors[0];

  const handleNodeChange = (key: keyof CanvasNode, value: any) => {
    const updated = project.nodes.map((n) => {
      if (selectedNodeIds.includes(n.id)) {
        return { ...n, [key]: value };
      }
      return n;
    });
    onUpdateNodes(updated);
  };

  const handleConnectorChange = (key: keyof CanvasConnector, value: any) => {
    const updated = project.connectors.map((c) => {
      if (selectedConnectorIds.includes(c.id)) {
        return { ...c, [key]: value };
      }
      return c;
    });
    onUpdateConnectors(updated);
  };

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-full text-slate-200 select-none text-xs">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Inspector
          </h2>
        </div>
        {(hasSelectedNode || hasSelectedConnector) && (
          <button
            onClick={onDeleteSelected}
            className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
            title="Delete Selected"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Shape Properties Mode */}
        {hasSelectedNode && firstNode && (
          <>
            {/* Label & Text Section */}
            <div className="space-y-2 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold mb-1">
                <Type className="w-3.5 h-3.5" />
                <span>Text & Formatting</span>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Label Text</label>
                <textarea
                  value={firstNode.label}
                  onChange={(e) => handleNodeChange('label', e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Font Size</label>
                  <input
                    type="number"
                    value={firstNode.fontSize}
                    onChange={(e) => handleNodeChange('fontSize', parseInt(e.target.value, 10) || 12)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Text Color</label>
                  <input
                    type="color"
                    value={firstNode.textColor}
                    onChange={(e) => handleNodeChange('textColor', e.target.value)}
                    className="w-full h-7 bg-slate-800 border border-slate-700 rounded p-0.5 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Geometry Section */}
            <div className="space-y-2 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold mb-1">
                <Maximize className="w-3.5 h-3.5" />
                <span>Dimensions & Position</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">X Position</label>
                  <input
                    type="number"
                    value={Math.round(firstNode.x)}
                    onChange={(e) => handleNodeChange('x', parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Y Position</label>
                  <input
                    type="number"
                    value={Math.round(firstNode.y)}
                    onChange={(e) => handleNodeChange('y', parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Width</label>
                  <input
                    type="number"
                    value={Math.round(firstNode.width)}
                    onChange={(e) => handleNodeChange('width', parseInt(e.target.value, 10) || 20)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Height</label>
                  <input
                    type="number"
                    value={Math.round(firstNode.height)}
                    onChange={(e) => handleNodeChange('height', parseInt(e.target.value, 10) || 20)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Fill & Styling Section */}
            <div className="space-y-2 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold mb-1">
                <Palette className="w-3.5 h-3.5" />
                <span>Fill & Border Styling</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Fill Color</label>
                  <input
                    type="color"
                    value={firstNode.fill}
                    onChange={(e) => handleNodeChange('fill', e.target.value)}
                    className="w-full h-7 bg-slate-800 border border-slate-700 rounded p-0.5 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Border Color</label>
                  <input
                    type="color"
                    value={firstNode.stroke}
                    onChange={(e) => handleNodeChange('stroke', e.target.value)}
                    className="w-full h-7 bg-slate-800 border border-slate-700 rounded p-0.5 cursor-pointer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Border Width</label>
                  <input
                    type="number"
                    value={firstNode.strokeWidth}
                    onChange={(e) => handleNodeChange('strokeWidth', parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Border Style</label>
                  <select
                    value={firstNode.strokeStyle}
                    onChange={(e) => handleNodeChange('strokeStyle', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Connector Properties Mode */}
        {hasSelectedConnector && firstConnector && (
          <div className="space-y-3 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
              <Link2 className="w-3.5 h-3.5" />
              <span>Connector Properties</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Line Label</label>
              <input
                type="text"
                value={firstConnector.label}
                onChange={(e) => handleConnectorChange('label', e.target.value)}
                placeholder="e.g. Yes / Approved"
                className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Routing Style</label>
              <select
                value={firstConnector.lineStyle}
                onChange={(e) => handleConnectorChange('lineStyle', e.target.value as ConnectorLineStyle)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-200"
              >
                <option value="orthogonal">Orthogonal (Elbow Steps)</option>
                <option value="curved">Curved (Bezier)</option>
                <option value="straight">Straight Direct</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Line Color</label>
                <input
                  type="color"
                  value={firstConnector.stroke}
                  onChange={(e) => handleConnectorChange('stroke', e.target.value)}
                  className="w-full h-7 bg-slate-800 border border-slate-700 rounded p-0.5 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Line Width</label>
                <input
                  type="number"
                  value={firstConnector.strokeWidth}
                  onChange={(e) => handleConnectorChange('strokeWidth', parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                />
              </div>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={firstConnector.animated}
                onChange={(e) => handleConnectorChange('animated', e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0"
              />
              <div className="flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Animated Flow Effect</span>
              </div>
            </label>
          </div>
        )}

        {/* Global Canvas Overview Mode */}
        {!hasSelectedNode && !hasSelectedConnector && (
          <div className="space-y-3">
            <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-800">
              <h3 className="font-semibold text-slate-200 mb-2">Diagram Overview</h3>
              <p className="text-slate-400 text-xs mb-3">
                Select any shape or line on the canvas to inspect and edit its properties.
              </p>
              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Total Shapes:</span>
                  <span className="font-mono text-slate-200">{project.nodes.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Connectors:</span>
                  <span className="font-mono text-slate-200">{project.connectors.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Diagram Type:</span>
                  <span className="font-mono text-indigo-400">{project.type}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
