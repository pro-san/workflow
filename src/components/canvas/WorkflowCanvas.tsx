import React, { useRef, useState, useEffect } from 'react';
import {
  ActiveTool,
  AnchorPoint,
  CanvasConnector,
  CanvasNode,
  DiagramProject,
  StickyComment,
  ThemeName,
} from '../../types/workflow';
import {
  generateConnectorPath,
  getConnectorMidpoint,
  getNodeAnchorPos,
  snapValue,
} from '../../utils/geometry';
import { StickyCommentNote } from './StickyCommentNote';

interface WorkflowCanvasProps {
  project: DiagramProject;
  setProject: React.Dispatch<React.SetStateAction<DiagramProject>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  activeTool: ActiveTool;
  selectedNodeIds: string[];
  setSelectedNodeIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedConnectorIds: string[];
  setSelectedConnectorIds: React.Dispatch<React.SetStateAction<string[]>>;
  theme: ThemeName;
  onRecordHistory: () => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  project,
  setProject,
  zoom,
  setZoom,
  showGrid,
  snapToGrid,
  showRulers,
  activeTool,
  selectedNodeIds,
  setSelectedNodeIds,
  selectedConnectorIds,
  setSelectedConnectorIds,
  theme,
  onRecordHistory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 100, y: 100 });

  // Interaction State
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Comment Dragging State
  const [draggingCommentId, setDraggingCommentId] = useState<string | null>(null);
  const [commentDragOffset, setCommentDragOffset] = useState({ x: 0, y: 0 });

  const handleStartCommentDrag = (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    const canvasPt = screenToCanvas(e.clientX, e.clientY);
    const comment = (project.comments || []).find((c) => c.id === commentId);
    if (comment) {
      setDraggingCommentId(commentId);
      setCommentDragOffset({
        x: canvasPt.x - comment.x,
        y: canvasPt.y - comment.y,
      });
    }
  };

  // Connector drawing
  const [connectingSource, setConnectingSource] = useState<{
    nodeId: string;
    anchor: AnchorPoint;
  } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });

  // Inline Editing
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Hovered node
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Theme styling mapping
  const getThemeBg = () => {
    switch (theme) {
      case 'light_enterprise':
        return 'bg-slate-100';
      case 'blueprint':
        return 'bg-[#0f2744]';
      case 'cyberpunk':
        return 'bg-[#090d16]';
      case 'warm_sunset':
        return 'bg-[#1c1917]';
      case 'dark_studio':
      default:
        return 'bg-slate-950';
    }
  };

  const getGridColor = () => {
    switch (theme) {
      case 'light_enterprise':
        return '#cbd5e1';
      case 'blueprint':
        return 'rgba(56, 189, 248, 0.2)';
      case 'cyberpunk':
        return 'rgba(236, 72, 153, 0.2)';
      default:
        return 'rgba(255, 255, 255, 0.08)';
    }
  };

  // Convert client pixel to canvas SVG coordinates
  const screenToCanvas = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  };

  // Wheel zoom & pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((z) => Math.min(3, Math.max(0.2, z * zoomFactor)));
    } else {
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || activeTool === 'pan' || e.spaceKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setSelectedNodeIds([]);
      setSelectedConnectorIds([]);
      setEditingNodeId(null);
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPt = screenToCanvas(e.clientX, e.clientY);
    setMouseCanvasPos(canvasPt);

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    if (draggingNodeId) {
      const newX = snapValue(canvasPt.x - dragOffset.x, 20, snapToGrid);
      const newY = snapValue(canvasPt.y - dragOffset.y, 20, snapToGrid);

      setProject((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n)),
      }));
    }

    if (draggingCommentId) {
      const newX = snapValue(canvasPt.x - commentDragOffset.x, 10, snapToGrid);
      const newY = snapValue(canvasPt.y - commentDragOffset.y, 10, snapToGrid);

      setProject((prev) => ({
        ...prev,
        comments: (prev.comments || []).map((c) =>
          c.id === draggingCommentId ? { ...c, x: newX, y: newY } : c
        ),
      }));
    }
  };

  // Canvas Mouse Up
  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (draggingNodeId) {
      setDraggingNodeId(null);
      onRecordHistory();
    }
    if (draggingCommentId) {
      setDraggingCommentId(null);
      onRecordHistory();
    }
    if (connectingSource) setConnectingSource(null);
  };

  // Drag & drop shape from palette onto canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const shapeType = e.dataTransfer.getData('shapeType');
    if (!shapeType) return;

    const pt = screenToCanvas(e.clientX, e.clientY);
    const newNode: CanvasNode = {
      id: `node_${Date.now()}`,
      type: shapeType as any,
      category: 'basic',
      label: shapeType.replace(/_/g, ' ').toUpperCase(),
      x: snapValue(pt.x - 60, 20, snapToGrid),
      y: snapValue(pt.y - 35, 20, snapToGrid),
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
    onRecordHistory();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Connect anchor mouse down
  const handleAnchorMouseDown = (e: React.MouseEvent, nodeId: string, anchor: AnchorPoint) => {
    e.stopPropagation();
    setConnectingSource({ nodeId, anchor });
  };

  // Connect anchor mouse up
  const handleAnchorMouseUp = (e: React.MouseEvent, targetNodeId: string, targetAnchor: AnchorPoint) => {
    e.stopPropagation();
    if (connectingSource && connectingSource.nodeId !== targetNodeId) {
      const newConnector: CanvasConnector = {
        id: `conn_${Date.now()}`,
        fromNodeId: connectingSource.nodeId,
        fromAnchor: connectingSource.anchor,
        toNodeId: targetNodeId,
        toAnchor: targetAnchor,
        label: '',
        lineStyle: 'orthogonal',
        stroke: '#6366f1',
        strokeWidth: 2,
        strokeStyle: 'solid',
        startArrow: 'none',
        endArrow: 'arrow',
        animated: false,
        jumpLines: false,
        fontSize: 12,
        textColor: '#cbd5e1',
      };

      setProject((prev) => ({ ...prev, connectors: [...prev.connectors, newConnector] }));
      onRecordHistory();
    }
    setConnectingSource(null);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`relative flex-1 h-full overflow-hidden select-none ${getThemeBg()} ${
        isPanning ? 'cursor-grabbing' : activeTool === 'pan' ? 'cursor-grab' : 'cursor-default'
      }`}
    >
      {/* Rulers */}
      {showRulers && (
        <>
          <div className="absolute top-0 left-0 right-0 h-5 bg-slate-900/90 border-b border-slate-800 z-10 flex items-center overflow-hidden font-mono text-[9px] text-slate-500">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-20 border-r border-slate-800 px-1">
                {i * 100}
              </div>
            ))}
          </div>
          <div className="absolute top-0 left-0 bottom-0 w-5 bg-slate-900/90 border-r border-slate-800 z-10 flex flex-col font-mono text-[9px] text-slate-500">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 h-20 border-b border-slate-800 py-1 px-0.5">
                {i * 100}
              </div>
            ))}
          </div>
        </>
      )}

      {/* SVG Canvas Workspace */}
      <svg
        className="w-full h-full absolute inset-0 pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          {/* Grid Pattern */}
          {showGrid && (
            <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke={getGridColor()}
                strokeWidth="1"
              />
            </pattern>
          )}

          {/* Arrowhead Markers */}
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
          </marker>
          <marker id="filled_arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
          </marker>
        </defs>

        {/* Grid Background */}
        {showGrid && <rect width="50000" height="50000" x="-10000" y="-10000" fill="url(#grid-pattern)" />}

        {/* Connectors Layer */}
        {project.connectors.map((conn) => {
          const fromNode = project.nodes.find((n) => n.id === conn.fromNodeId);
          const toNode = project.nodes.find((n) => n.id === conn.toNodeId);
          if (!fromNode || !toNode) return null;

          const fromLayer = project.layers.find((l) => l.id === fromNode.layerId) || project.layers[0];
          if (fromLayer && !fromLayer.visible) return null;

          const connLayerOpacity = fromLayer && typeof fromLayer.opacity === 'number' ? fromLayer.opacity : 1;
          const startPt = getNodeAnchorPos(fromNode, conn.fromAnchor);
          const endPt = getNodeAnchorPos(toNode, conn.toAnchor);
          const pathD = generateConnectorPath(startPt, endPt, conn.fromAnchor, conn.toAnchor, conn.lineStyle);
          const midPt = getConnectorMidpoint(startPt, endPt);
          const isSelected = selectedConnectorIds.includes(conn.id);

          return (
            <g
              key={conn.id}
              opacity={connLayerOpacity}
              onClick={(e) => { e.stopPropagation(); setSelectedConnectorIds([conn.id]); setSelectedNodeIds([]); }}
            >
              <path
                d={pathD}
                fill="none"
                stroke={isSelected ? '#38bdf8' : conn.stroke}
                strokeWidth={isSelected ? conn.strokeWidth + 2 : conn.strokeWidth}
                strokeDasharray={conn.animated ? '6,6' : conn.strokeStyle === 'dashed' ? '5,5' : 'none'}
                markerEnd={conn.endArrow === 'arrow' ? 'url(#arrow)' : undefined}
                className="cursor-pointer hover:stroke-sky-400 transition-colors"
              />
              {/* Connector Label */}
              {conn.label && (
                <g transform={`translate(${midPt.x}, ${midPt.y})`}>
                  <rect
                    x="-35"
                    y="-10"
                    width="70"
                    height="20"
                    rx="4"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={conn.textColor || '#e2e8f0'}
                    fontSize={conn.fontSize || 11}
                    className="font-medium"
                  >
                    {conn.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Active Connecting Drag Line */}
        {connectingSource && (
          <path
            d={`M ${getNodeAnchorPos(project.nodes.find((n) => n.id === connectingSource.nodeId)!, connectingSource.anchor).x} ${
              getNodeAnchorPos(project.nodes.find((n) => n.id === connectingSource.nodeId)!, connectingSource.anchor).y
            } L ${mouseCanvasPos.x} ${mouseCanvasPos.y}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
        )}

        {/* Nodes Layer */}
        {project.nodes.map((node) => {
          const nodeLayer = project.layers.find((l) => l.id === node.layerId) || project.layers[0];
          if (node.hidden || (nodeLayer && !nodeLayer.visible)) return null;

          const layerOpacity = nodeLayer && typeof nodeLayer.opacity === 'number' ? nodeLayer.opacity : 1;
          const nodeOpacity = typeof node.opacity === 'number' ? node.opacity : 1;
          const effectiveOpacity = layerOpacity * nodeOpacity;

          const isSelected = selectedNodeIds.includes(node.id);
          const isHovered = hoveredNodeId === node.id;

          return (
            <g
              key={node.id}
              opacity={effectiveOpacity}
              transform={`translate(${node.x}, ${node.y}) rotate(${node.rotation}, ${node.width / 2}, ${node.height / 2})`}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedNodeIds([node.id]);
                setSelectedConnectorIds([]);
                setDraggingNodeId(node.id);
                const pt = screenToCanvas(e.clientX, e.clientY);
                setDragOffset({ x: pt.x - node.x, y: pt.y - node.y });
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingNodeId(node.id);
              }}
              className="cursor-move"
            >
              {/* Shape Render Switch */}
              {node.type === 'circle' || node.type === 'start_event' || node.type === 'end_event' ? (
                <circle
                  cx={node.width / 2}
                  cy={node.height / 2}
                  r={Math.min(node.width, node.height) / 2}
                  fill={node.fill}
                  stroke={isSelected ? '#38bdf8' : node.stroke}
                  strokeWidth={isSelected ? node.strokeWidth + 2 : node.strokeWidth}
                />
              ) : node.type === 'diamond' || node.type === 'decision' || node.type === 'gateway_exclusive' ? (
                <polygon
                  points={`${node.width / 2},0 ${node.width},${node.height / 2} ${node.width / 2},${node.height} 0,${node.height / 2}`}
                  fill={node.fill}
                  stroke={isSelected ? '#38bdf8' : node.stroke}
                  strokeWidth={isSelected ? node.strokeWidth + 2 : node.strokeWidth}
                />
              ) : node.type === 'triangle' ? (
                <polygon
                  points={`${node.width / 2},0 ${node.width},${node.height} 0,${node.height}`}
                  fill={node.fill}
                  stroke={isSelected ? '#38bdf8' : node.stroke}
                  strokeWidth={isSelected ? node.strokeWidth + 2 : node.strokeWidth}
                />
              ) : (
                <rect
                  width={node.width}
                  height={node.height}
                  rx={node.type === 'rounded_rectangle' || node.type === 'user_task' || node.type === 'service_task' ? 12 : node.cornerRadius || 6}
                  fill={node.fill}
                  stroke={isSelected ? '#38bdf8' : node.stroke}
                  strokeWidth={isSelected ? node.strokeWidth + 2 : node.strokeWidth}
                />
              )}

              {/* Node Label Text */}
              {editingNodeId === node.id ? (
                <foreignObject x="5" y="5" width={node.width - 10} height={node.height - 10}>
                  <input
                    type="text"
                    value={node.label}
                    autoFocus
                    onChange={(e) => {
                      const val = e.target.value;
                      setProject((prev) => ({
                        ...prev,
                        nodes: prev.nodes.map((n) => (n.id === node.id ? { ...n, label: val } : n)),
                      }));
                    }}
                    onBlur={() => setEditingNodeId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingNodeId(null);
                    }}
                    className="w-full h-full bg-slate-900/90 text-white text-xs text-center border border-indigo-500 rounded px-1 focus:outline-none"
                  />
                </foreignObject>
              ) : (
                <text
                  x={node.width / 2}
                  y={node.height / 2 + 4}
                  textAnchor="middle"
                  fill={node.textColor || '#ffffff'}
                  fontSize={node.fontSize || 13}
                  fontWeight={node.fontWeight || 'medium'}
                  fontFamily={node.fontFamily || 'Inter'}
                  className="pointer-events-none select-none"
                >
                  {node.label}
                </text>
              )}

              {/* Anchor Connection Points (Shown when hovered or selected) */}
              {(isHovered || isSelected) && (
                <>
                  {[
                    { anchor: 'top' as AnchorPoint, cx: node.width / 2, cy: 0 },
                    { anchor: 'right' as AnchorPoint, cx: node.width, cy: node.height / 2 },
                    { anchor: 'bottom' as AnchorPoint, cx: node.width / 2, cy: node.height },
                    { anchor: 'left' as AnchorPoint, cx: 0, cy: node.height / 2 },
                  ].map((pt) => (
                    <circle
                      key={pt.anchor}
                      cx={pt.cx}
                      cy={pt.cy}
                      r="5"
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      onMouseDown={(e) => handleAnchorMouseDown(e, node.id, pt.anchor)}
                      onMouseUp={(e) => handleAnchorMouseUp(e, node.id, pt.anchor)}
                      className="cursor-crosshair hover:scale-150 transition-transform"
                    />
                  ))}
                </>
              )}
            </g>
          );
        })}

        {/* Target Node Connection Lines for Sticky Notes */}
        {(project.comments || []).map((comment) => {
          if (!comment.targetNodeId) return null;
          const targetNode = project.nodes.find((n) => n.id === comment.targetNodeId);
          if (!targetNode) return null;

          const commentCenterX = comment.x + (comment.width || 180) / 2;
          const commentCenterY = comment.y + (comment.height || 130) / 2;
          const nodeCenterX = targetNode.x + targetNode.width / 2;
          const nodeCenterY = targetNode.y + targetNode.height / 2;

          return (
            <line
              key={`comment_link_${comment.id}`}
              x1={commentCenterX}
              y1={commentCenterY}
              x2={nodeCenterX}
              y2={nodeCenterY}
              stroke={comment.color || '#fef08a'}
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.8"
              className="pointer-events-none"
            />
          );
        })}

        {/* Sticky Notes Render Layer */}
        {(project.comments || []).map((comment) => {
          const targetNode = project.nodes.find((n) => n.id === comment.targetNodeId);
          return (
            <StickyCommentNote
              key={comment.id}
              comment={comment}
              targetNodeLabel={targetNode?.label}
              zoom={zoom}
              onUpdate={(updated) => {
                setProject((prev) => ({
                  ...prev,
                  comments: (prev.comments || []).map((c) => (c.id === updated.id ? updated : c)),
                }));
                onRecordHistory();
              }}
              onDelete={(id) => {
                setProject((prev) => ({
                  ...prev,
                  comments: (prev.comments || []).filter((c) => c.id !== id),
                }));
                onRecordHistory();
              }}
              onStartDrag={handleStartCommentDrag}
            />
          );
        })}
      </svg>
    </div>
  );
};
