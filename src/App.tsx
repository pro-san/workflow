import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTool,
  AutoLayoutAlgorithm,
  CanvasConnector,
  CanvasLayer,
  CanvasNode,
  DiagramProject,
  StickyComment,
  ThemeName,
} from './types/workflow';
import { PREBUILT_TEMPLATES } from './data/templates';
import { RibbonBar } from './components/ribbon/RibbonBar';
import { ShapeLibrary } from './components/sidebar/ShapeLibrary';
import { LayerManager } from './components/sidebar/LayerManager';
import { StickyCommentsPanel } from './components/sidebar/StickyCommentsPanel';
import { GlobalSearchPanel } from './components/sidebar/GlobalSearchPanel';
import { PropertiesPanel } from './components/inspector/PropertiesPanel';
import { WorkflowCanvas, FocusTarget } from './components/canvas/WorkflowCanvas';
import { MiniMap } from './components/canvas/MiniMap';
import { DashboardView } from './components/dashboard/DashboardView';
import { AiAssistantModal } from './components/modals/AiAssistantModal';
import { TemplateManagerModal } from './components/modals/TemplateManagerModal';
import { PluginManagerModal } from './components/modals/PluginManagerModal';
import { ExportModal } from './components/modals/ExportModal';
import { DocumentationModal } from './components/modals/DocumentationModal';
import { applyAutoLayout } from './utils/autolayout';
import { NodeStyleTemplate } from './utils/templateStorage';
import { LayoutGrid, Layers, FolderOpen, MessageSquare, Search } from 'lucide-react';

export default function App() {
  // Current active project
  const [project, setProject] = useState<DiagramProject>(PREBUILT_TEMPLATES[0]);
  const [savedProjects, setSavedProjects] = useState<DiagramProject[]>(PREBUILT_TEMPLATES);

  // View state: 'canvas' | 'dashboard'
  const [currentView, setCurrentView] = useState<'canvas' | 'dashboard'>('canvas');

  // Left sidebar tab: 'palette' | 'search' | 'layers' | 'comments'
  const [leftSidebarTab, setLeftSidebarTab] = useState<'palette' | 'search' | 'layers' | 'comments'>('palette');
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);

  // Canvas Viewport State
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [theme, setTheme] = useState<ThemeName>('dark_studio');

  // Selection & Layer State
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedConnectorIds, setSelectedConnectorIds] = useState<string[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer_1');

  // History Undo / Redo Stack
  const [history, setHistory] = useState<DiagramProject[]>([PREBUILT_TEMPLATES[0]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Modals state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<'generate' | 'explain' | 'validate'>('generate');
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [pluginsModalOpen, setPluginsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);

  // Record history snapshot
  const recordHistory = useCallback(() => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, JSON.parse(JSON.stringify(project))];
    });
    setHistoryIndex((i) => i + 1);
  }, [historyIndex, project]);

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setProject(JSON.parse(JSON.stringify(prev)));
      setHistoryIndex((i) => i - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setProject(JSON.parse(JSON.stringify(next)));
      setHistoryIndex((i) => i + 1);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setLeftSidebarTab('search');
        return;
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedNodeIds, selectedConnectorIds]);

  // Handle Add Shape
  const handleAddShape = (shapeType: any) => {
    const newNode: CanvasNode = {
      id: `node_${Date.now()}`,
      type: shapeType,
      category: 'basic',
      label: shapeType.replace(/_/g, ' ').toUpperCase(),
      x: 300,
      y: 200,
      width: 120,
      height: 70,
      rotation: 0,
      fill: '#4f46e5',
      fillType: 'solid',
      stroke: '#3730a3',
      strokeWidth: 2,
      strokeStyle: 'solid',
      cornerRadius: 10,
      opacity: 1,
      shadow: true,
      glow: false,
      fontFamily: 'Inter',
      fontSize: 13,
      fontWeight: 'medium',
      textColor: '#ffffff',
      textAlign: 'center',
      layerId: project.layers[0]?.id || 'layer_default',
      locked: false,
      hidden: false,
    };

    setProject((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setSelectedNodeIds([newNode.id]);
    recordHistory();
  };

  // Handle Add Node with Custom Template
  const handleAddNodeWithTemplate = (template: NodeStyleTemplate) => {
    const newNode: CanvasNode = {
      id: `node_${Date.now()}`,
      type: template.shapeType,
      category: template.category,
      label: template.name.toUpperCase(),
      x: 320 + Math.random() * 40,
      y: 220 + Math.random() * 40,
      width: template.width,
      height: template.height,
      rotation: 0,
      fill: template.fill,
      fillType: template.fillType,
      gradientColor: template.gradientColor,
      stroke: template.stroke,
      strokeWidth: template.strokeWidth,
      strokeStyle: template.strokeStyle,
      cornerRadius: template.cornerRadius,
      opacity: template.opacity,
      shadow: template.shadow,
      glow: template.glow,
      fontFamily: template.fontFamily,
      fontSize: template.fontSize,
      fontWeight: template.fontWeight,
      textColor: template.textColor,
      textAlign: template.textAlign,
      layerId: activeLayerId || project.layers[0]?.id || 'layer_default',
      locked: false,
      hidden: false,
    };

    setProject((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setSelectedNodeIds([newNode.id]);
    recordHistory();
  };

  // Handle Apply Template Style to Selected Nodes
  const handleApplyTemplateToSelected = (template: NodeStyleTemplate) => {
    if (selectedNodeIds.length === 0) return;
    setProject((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => {
        if (selectedNodeIds.includes(node.id)) {
          return {
            ...node,
            fill: template.fill,
            fillType: template.fillType,
            gradientColor: template.gradientColor,
            stroke: template.stroke,
            strokeWidth: template.strokeWidth,
            strokeStyle: template.strokeStyle,
            cornerRadius: template.cornerRadius,
            opacity: template.opacity,
            shadow: template.shadow,
            glow: template.glow,
            fontFamily: template.fontFamily,
            fontSize: template.fontSize,
            fontWeight: template.fontWeight,
            textColor: template.textColor,
            textAlign: template.textAlign,
          };
        }
        return node;
      }),
    }));
    recordHistory();
  };

  // Handle Align Nodes
  const handleAlignNodes = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedNodeIds.length < 2) return;
    const selectedNodes = project.nodes.filter((n) => selectedNodeIds.includes(n.id));

    let targetVal = 0;
    if (alignment === 'left') targetVal = Math.min(...selectedNodes.map((n) => n.x));
    if (alignment === 'top') targetVal = Math.min(...selectedNodes.map((n) => n.y));

    setProject((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        if (selectedNodeIds.includes(n.id)) {
          if (alignment === 'left') return { ...n, x: targetVal };
          if (alignment === 'top') return { ...n, y: targetVal };
        }
        return n;
      }),
    }));
    recordHistory();
  };

  // Handle Delete Selected
  const handleDeleteSelected = () => {
    setProject((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => !selectedNodeIds.includes(n.id)),
      connectors: prev.connectors.filter(
        (c) =>
          !selectedConnectorIds.includes(c.id) &&
          !selectedNodeIds.includes(c.fromNodeId) &&
          !selectedNodeIds.includes(c.toNodeId)
      ),
    }));
    setSelectedNodeIds([]);
    setSelectedConnectorIds([]);
    recordHistory();
  };

  // Handle Duplicate Layer
  const handleDuplicateLayer = (targetLayerId: string) => {
    const targetLayer = project.layers.find((l) => l.id === targetLayerId);
    if (!targetLayer) return;

    const newLayerId = `layer_${Date.now()}`;
    const newLayer: CanvasLayer = {
      ...targetLayer,
      id: newLayerId,
      name: `${targetLayer.name} (Copy)`,
    };

    // Find all nodes associated with this layer and duplicate them
    const nodesOnLayer = project.nodes.filter((n) => n.layerId === targetLayerId);
    const nodeIdMap = new Map<string, string>();

    const duplicatedNodes: CanvasNode[] = nodesOnLayer.map((node, index) => {
      const newNodeId = `node_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
      nodeIdMap.set(node.id, newNodeId);
      return {
        ...node,
        id: newNodeId,
        layerId: newLayerId,
        x: node.x + 30,
        y: node.y + 30,
        label: node.label ? `${node.label} (Copy)` : node.label,
      };
    });

    // Duplicate any connectors between nodes on this layer
    const duplicatedConnectors: CanvasConnector[] = [];
    project.connectors.forEach((conn) => {
      const newFrom = nodeIdMap.get(conn.fromNodeId);
      const newTo = nodeIdMap.get(conn.toNodeId);
      if (newFrom && newTo) {
        duplicatedConnectors.push({
          ...conn,
          id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fromNodeId: newFrom,
          toNodeId: newTo,
        });
      }
    });

    setProject((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      nodes: [...prev.nodes, ...duplicatedNodes],
      connectors: [...prev.connectors, ...duplicatedConnectors],
    }));

    setActiveLayerId(newLayerId);
    if (duplicatedNodes.length > 0) {
      setSelectedNodeIds(duplicatedNodes.map((n) => n.id));
    }
    recordHistory();
  };

  // Handle Auto Layout
  const handleApplyAutoLayout = (algo: AutoLayoutAlgorithm) => {
    const updatedNodes = applyAutoLayout(project.nodes, project.connectors, algo);
    setProject((prev) => ({ ...prev, nodes: updatedNodes }));
    recordHistory();
  };

  // Handle Add Sticky Comment
  const handleAddStickyComment = (targetNodeId?: string) => {
    const targetNode = targetNodeId ? project.nodes.find((n) => n.id === targetNodeId) : undefined;
    const newComment: StickyComment = {
      id: `comment_${Date.now()}`,
      author: 'Current User',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      content: 'New feedback note... @Sarah Jenkins',
      color: '#fef08a',
      x: targetNode ? targetNode.x + targetNode.width + 30 : 250,
      y: targetNode ? targetNode.y : 200,
      width: 180,
      height: 140,
      targetNodeId: targetNodeId,
      resolved: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setProject((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
    }));
    setLeftSidebarTab('comments');
    recordHistory();
  };

  // New Blank Diagram
  const handleNewDiagram = () => {
    const newPrj: DiagramProject = {
      id: `prj_${Date.now()}`,
      title: 'Untitled Process Diagram',
      description: 'Enterprise workflow draft',
      type: 'BPMN',
      nodes: [],
      connectors: [],
      layers: [{ id: 'layer_1', name: 'Main Layer', visible: true, locked: false, opacity: 1 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['New'],
      favorite: false,
    };
    setProject(newPrj);
    setSavedProjects((prev) => [newPrj, ...prev]);
    setCurrentView('canvas');
    recordHistory();
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Ribbon Navigation Header */}
      <RibbonBar
        project={project}
        setProject={setProject}
        zoom={zoom}
        setZoom={setZoom}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        showRulers={showRulers}
        setShowRulers={setShowRulers}
        showMiniMap={showMiniMap}
        setShowMiniMap={setShowMiniMap}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        undo={undo}
        redo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onNewDiagram={handleNewDiagram}
        onOpenExportModal={() => setExportModalOpen(true)}
        onOpenTemplatesModal={() => setTemplatesModalOpen(true)}
        onOpenPluginsModal={() => setPluginsModalOpen(true)}
        onOpenAiModal={(tab = 'generate') => {
          setAiModalTab(tab);
          setAiModalOpen(true);
        }}
        onOpenDocModal={() => setDocModalOpen(true)}
        onApplyAutoLayout={handleApplyAutoLayout}
        theme={theme}
        setTheme={setTheme}
        selectedNodeIds={selectedNodeIds}
        onAlignNodes={handleAlignNodes}
        onDeleteSelected={handleDeleteSelected}
        onAddStickyComment={handleAddStickyComment}
      />

      {/* Main Container Layout */}
      {currentView === 'dashboard' ? (
        <DashboardView
          onNewDiagram={handleNewDiagram}
          onOpenTemplatesModal={() => setTemplatesModalOpen(true)}
          onOpenAiModal={() => {
            setAiModalTab('generate');
            setAiModalOpen(true);
          }}
          onLoadProject={(prj) => {
            setProject(prj);
            setCurrentView('canvas');
          }}
          savedProjects={savedProjects}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Vertical Icon Bar */}
          <div className="w-12 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 space-y-3 z-10">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Return to Dashboard"
            >
              <LayoutGrid className="w-5 h-5 text-indigo-400" />
            </button>
            <div className="w-6 h-px bg-slate-800" />
            <button
              onClick={() => setLeftSidebarTab('palette')}
              className={`p-2 rounded-lg transition-colors ${
                leftSidebarTab === 'palette'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Shape Palette"
            >
              <FolderOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLeftSidebarTab('search')}
              className={`p-2 rounded-lg transition-colors ${
                leftSidebarTab === 'search'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Global Search (⌘F / Ctrl+F)"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLeftSidebarTab('layers')}
              className={`p-2 rounded-lg transition-colors ${
                leftSidebarTab === 'layers'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Layer Manager"
            >
              <Layers className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLeftSidebarTab('comments')}
              className={`p-2 rounded-lg transition-colors ${
                leftSidebarTab === 'comments'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Sticky Notes & Feedback"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>

          {/* Left Sidebar Content */}
          {leftSidebarTab === 'palette' && (
            <ShapeLibrary
              onAddShape={handleAddShape}
              selectedNodes={project.nodes.filter((n) => selectedNodeIds.includes(n.id))}
              onAddNodeWithTemplate={handleAddNodeWithTemplate}
              onApplyTemplateToSelected={handleApplyTemplateToSelected}
            />
          )}
          {leftSidebarTab === 'search' && (
            <GlobalSearchPanel
              project={project}
              onSelectNode={(nodeId) => {
                setSelectedNodeIds([nodeId]);
                setSelectedConnectorIds([]);
              }}
              onSelectConnector={(connectorId) => {
                setSelectedConnectorIds([connectorId]);
                setSelectedNodeIds([]);
              }}
              onFocusItem={(target) => {
                setFocusTarget(target);
              }}
            />
          )}
          {leftSidebarTab === 'layers' && (
            <LayerManager
              layers={project.layers}
              activeLayerId={activeLayerId || project.layers[0]?.id || 'layer_1'}
              setActiveLayerId={setActiveLayerId}
              onAddLayer={() => {
                const newLayer: CanvasLayer = {
                  id: `layer_${Date.now()}`,
                  name: `Layer ${project.layers.length + 1}`,
                  visible: true,
                  locked: false,
                  opacity: 1,
                };
                setProject((prev) => ({ ...prev, layers: [...prev.layers, newLayer] }));
                setActiveLayerId(newLayer.id);
                recordHistory();
              }}
              onToggleVisibility={(id) => {
                setProject((prev) => ({
                  ...prev,
                  layers: prev.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
                }));
                recordHistory();
              }}
              onToggleLock={(id) => {
                setProject((prev) => ({
                  ...prev,
                  layers: prev.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
                }));
                recordHistory();
              }}
              onUpdateOpacity={(id, opacity) => {
                setProject((prev) => ({
                  ...prev,
                  layers: prev.layers.map((l) => (l.id === id ? { ...l, opacity } : l)),
                }));
              }}
              onUpdateColor={(id, color) => {
                setProject((prev) => ({
                  ...prev,
                  layers: prev.layers.map((l) => (l.id === id ? { ...l, color } : l)),
                }));
                recordHistory();
              }}
              onDuplicateLayer={handleDuplicateLayer}
              onDeleteLayer={(id) => {
                setProject((prev) => ({
                  ...prev,
                  layers: prev.layers.filter((l) => l.id !== id),
                }));
                recordHistory();
              }}
            />
          )}
          {leftSidebarTab === 'comments' && (
            <StickyCommentsPanel
              project={project}
              onUpdateComments={(updatedComments) => {
                setProject((prev) => ({ ...prev, comments: updatedComments }));
                recordHistory();
              }}
              onAddStickyComment={handleAddStickyComment}
              onSelectNode={(nodeId) => {
                setSelectedNodeIds([nodeId]);
              }}
            />
          )}

          {/* Central Interactive Canvas */}
          <WorkflowCanvas
            project={project}
            setProject={setProject}
            zoom={zoom}
            setZoom={setZoom}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            showRulers={showRulers}
            activeTool={activeTool}
            selectedNodeIds={selectedNodeIds}
            setSelectedNodeIds={setSelectedNodeIds}
            selectedConnectorIds={selectedConnectorIds}
            setSelectedConnectorIds={setSelectedConnectorIds}
            theme={theme}
            onRecordHistory={recordHistory}
            focusTarget={focusTarget}
          />

          {/* MiniMap Overlay */}
          {showMiniMap && (
            <MiniMap
              nodes={project.nodes}
              connectors={project.connectors}
              zoom={zoom}
              panX={100}
              panY={100}
            />
          )}

          {/* Right Inspector Panel */}
          <PropertiesPanel
            project={project}
            selectedNodeIds={selectedNodeIds}
            selectedConnectorIds={selectedConnectorIds}
            onUpdateNodes={(updatedNodes) => {
              setProject((prev) => ({ ...prev, nodes: updatedNodes }));
              recordHistory();
            }}
            onUpdateConnectors={(updatedConnectors) => {
              setProject((prev) => ({ ...prev, connectors: updatedConnectors }));
              recordHistory();
            }}
            onDeleteSelected={handleDeleteSelected}
          />
        </div>
      )}

      {/* Modals */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        project={project}
        setProject={setProject}
        initialTab={aiModalTab}
        onRecordHistory={recordHistory}
      />

      <TemplateManagerModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onSelectTemplate={(tpl) => {
          setProject(tpl);
          recordHistory();
        }}
      />

      <PluginManagerModal
        isOpen={pluginsModalOpen}
        onClose={() => setPluginsModalOpen(false)}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        project={project}
      />

      <DocumentationModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
      />
    </div>
  );
}
