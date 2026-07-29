import React, { useState, useEffect, useRef } from 'react';
import {
  DiagramProject,
  CanvasNode,
  CanvasConnector,
  StickyComment,
} from '../../types/workflow';
import {
  Search,
  X,
  Square,
  Cable,
  MessageSquare,
  Crosshair,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  Tag,
  User,
  Zap,
} from 'lucide-react';

interface FocusTarget {
  id: string;
  type: 'node' | 'connector' | 'comment';
  x?: number;
  y?: number;
  timestamp: number;
}

interface GlobalSearchPanelProps {
  project: DiagramProject;
  onSelectNode: (nodeId: string) => void;
  onSelectConnector: (connectorId: string) => void;
  onFocusItem: (target: FocusTarget) => void;
  initialQuery?: string;
}

type CategoryFilter = 'all' | 'nodes' | 'connectors' | 'comments';

export const GlobalSearchPanel: React.FC<GlobalSearchPanelProps> = ({
  project,
  onSelectNode,
  onSelectConnector,
  onFocusItem,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Map nodes by ID for fast lookup of connector endpoints and comment targets
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, CanvasNode>();
    project.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [project.nodes]);

  const q = query.trim().toLowerCase();

  // 1. Filter Nodes
  const matchedNodes = React.useMemo(() => {
    if (!q) return project.nodes;
    return project.nodes.filter((node) => {
      const labelMatch = node.label.toLowerCase().includes(q);
      const typeMatch = node.type.toLowerCase().includes(q);
      const categoryMatch = node.category.toLowerCase().includes(q);
      const idMatch = node.id.toLowerCase().includes(q);
      return labelMatch || typeMatch || categoryMatch || idMatch;
    });
  }, [project.nodes, q]);

  // 2. Filter Connectors
  const matchedConnectors = React.useMemo(() => {
    if (!q) return project.connectors;
    return project.connectors.filter((conn) => {
      const sourceNode = nodeMap.get(conn.fromNodeId);
      const targetNode = nodeMap.get(conn.toNodeId);
      const sourceLabel = sourceNode?.label || conn.fromNodeId;
      const targetLabel = targetNode?.label || conn.toNodeId;

      const labelMatch = conn.label ? conn.label.toLowerCase().includes(q) : false;
      const sourceMatch = sourceLabel.toLowerCase().includes(q);
      const targetMatch = targetLabel.toLowerCase().includes(q);
      const lineStyleMatch = conn.lineStyle ? conn.lineStyle.toLowerCase().includes(q) : false;
      const idMatch = conn.id.toLowerCase().includes(q);

      return labelMatch || sourceMatch || targetMatch || lineStyleMatch || idMatch;
    });
  }, [project.connectors, nodeMap, q]);

  // 3. Filter Sticky Comments
  const comments = project.comments || [];
  const matchedComments = React.useMemo(() => {
    if (!q) return comments;
    return comments.filter((comment) => {
      const contentMatch = comment.content.toLowerCase().includes(q);
      const authorMatch = comment.author.toLowerCase().includes(q);
      const targetNode = comment.targetNodeId ? nodeMap.get(comment.targetNodeId) : null;
      const nodeLabelMatch = targetNode ? targetNode.label.toLowerCase().includes(q) : false;
      const replyMatch = comment.replies?.some(
        (r) => r.content.toLowerCase().includes(q) || r.author.toLowerCase().includes(q)
      );

      return contentMatch || authorMatch || nodeLabelMatch || replyMatch;
    });
  }, [comments, nodeMap, q]);

  const totalResultsCount =
    matchedNodes.length + matchedConnectors.length + matchedComments.length;

  // Helper to render text with highlighted matching substrings
  const renderHighlighted = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + searchTerm.length);
    const after = text.substring(index + searchTerm.length);

    return (
      <>
        {before}
        <span className="bg-amber-500/30 text-amber-200 font-semibold px-0.5 rounded">
          {match}
        </span>
        {after}
      </>
    );
  };

  // Node Click Action
  const handleNodeClick = (node: CanvasNode) => {
    onSelectNode(node.id);
    onFocusItem({
      id: node.id,
      type: 'node',
      x: node.x + node.width / 2,
      y: node.y + node.height / 2,
      timestamp: Date.now(),
    });
  };

  // Connector Click Action
  const handleConnectorClick = (conn: CanvasConnector) => {
    onSelectConnector(conn.id);
    const sourceNode = nodeMap.get(conn.fromNodeId);
    const targetNode = nodeMap.get(conn.toNodeId);

    let x = 0;
    let y = 0;
    if (sourceNode && targetNode) {
      x = (sourceNode.x + targetNode.x) / 2;
      y = (sourceNode.y + targetNode.y) / 2;
    } else if (sourceNode) {
      x = sourceNode.x;
      y = sourceNode.y;
    }

    onFocusItem({
      id: conn.id,
      type: 'connector',
      x,
      y,
      timestamp: Date.now(),
    });
  };

  // Comment Click Action
  const handleCommentClick = (comment: StickyComment) => {
    onFocusItem({
      id: comment.id,
      type: 'comment',
      x: comment.x + 100,
      y: comment.y + 60,
      timestamp: Date.now(),
    });

    if (comment.targetNodeId) {
      onSelectNode(comment.targetNodeId);
    }
  };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10 select-none">
      {/* Search Header & Input */}
      <div className="p-3 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Global Search</h3>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono">
            ⌘F
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes, lines, notes..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 p-0.5 rounded-full hover:bg-slate-800 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center space-x-1 pt-1 overflow-x-auto no-scrollbar text-[11px]">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap flex items-center space-x-1 ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] opacity-75">({totalResultsCount})</span>
          </button>
          <button
            onClick={() => setActiveCategory('nodes')}
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap flex items-center space-x-1 ${
              activeCategory === 'nodes'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Nodes</span>
            <span className="text-[10px] opacity-75">({matchedNodes.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('connectors')}
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap flex items-center space-x-1 ${
              activeCategory === 'connectors'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Lines</span>
            <span className="text-[10px] opacity-75">({matchedConnectors.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('comments')}
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap flex items-center space-x-1 ${
              activeCategory === 'comments'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Notes</span>
            <span className="text-[10px] opacity-75">({matchedComments.length})</span>
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {totalResultsCount === 0 && (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-300">No matching elements</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto">
              No nodes, connectors, or notes matched &quot;{query}&quot;.
            </p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                Clear search query
              </button>
            )}
          </div>
        )}

        {/* NODES SECTION */}
        {(activeCategory === 'all' || activeCategory === 'nodes') && matchedNodes.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center space-x-1 text-indigo-400">
                <Square className="w-3 h-3" />
                <span>Nodes ({matchedNodes.length})</span>
              </div>
            </div>

            <div className="space-y-1">
              {matchedNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className="group p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-white shrink-0 shadow-sm text-[10px] font-bold"
                      style={{ backgroundColor: node.fill || '#4f46e5' }}
                    >
                      <Square className="w-3.5 h-3.5 opacity-90" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                        {renderHighlighted(node.label || 'Untitled Node', q)}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <span className="capitalize">{node.type.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono text-[9px] truncate">
                          {node.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(node);
                    }}
                    className="p-1 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    title="Center on canvas"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONNECTORS SECTION */}
        {(activeCategory === 'all' || activeCategory === 'connectors') &&
          matchedConnectors.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center space-x-1 text-emerald-400">
                  <Cable className="w-3 h-3" />
                  <span>Connectors / Lines ({matchedConnectors.length})</span>
                </div>
              </div>

              <div className="space-y-1">
                {matchedConnectors.map((conn) => {
                  const sourceNode = nodeMap.get(conn.fromNodeId);
                  const targetNode = nodeMap.get(conn.toNodeId);
                  const sourceLabel = sourceNode?.label || conn.fromNodeId;
                  const targetLabel = targetNode?.label || conn.toNodeId;

                  return (
                    <div
                      key={conn.id}
                      onClick={() => handleConnectorClick(conn)}
                      className="group p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Cable className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white flex items-center space-x-1">
                            {conn.label ? (
                              <span>{renderHighlighted(conn.label, q)}</span>
                            ) : (
                              <span className="text-slate-400 italic font-normal text-[11px]">
                                Unlabeled Line
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({conn.lineStyle || 'line'})
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5 min-w-0">
                            <span className="truncate max-w-[80px]">
                              {renderHighlighted(sourceLabel, q)}
                            </span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[80px]">
                              {renderHighlighted(targetLabel, q)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectorClick(conn);
                        }}
                        className="p-1 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        title="Center on canvas"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* STICKY COMMENTS SECTION */}
        {(activeCategory === 'all' || activeCategory === 'comments') &&
          matchedComments.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center space-x-1 text-amber-400">
                  <MessageSquare className="w-3 h-3" />
                  <span>Sticky Notes ({matchedComments.length})</span>
                </div>
              </div>

              <div className="space-y-1">
                {matchedComments.map((comment) => {
                  const targetNode = comment.targetNodeId
                    ? nodeMap.get(comment.targetNodeId)
                    : null;

                  return (
                    <div
                      key={comment.id}
                      onClick={() => handleCommentClick(comment)}
                      className="group p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 text-slate-900 font-bold text-[10px] shadow-sm"
                          style={{ backgroundColor: comment.color || '#fef08a' }}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-slate-900 opacity-90" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2 leading-tight">
                            {renderHighlighted(comment.content || 'Empty note...', q)}
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-1">
                            <span className="flex items-center space-x-0.5 text-amber-300/80">
                              <User className="w-2.5 h-2.5" />
                              <span>{renderHighlighted(comment.author, q)}</span>
                            </span>
                            {targetNode && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400 truncate max-w-[90px]">
                                  @{renderHighlighted(targetNode.label, q)}
                                </span>
                              </>
                            )}
                            {comment.resolved && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30">
                                Resolved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommentClick(comment);
                        }}
                        className="p-1 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-1"
                        title="Center on canvas"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {/* Footer Info / Stats */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Zap className="w-3 h-3 text-indigo-400" />
          <span>Click result to focus element</span>
        </div>
        <span className="font-mono text-slate-400">{totalResultsCount} items</span>
      </div>
    </div>
  );
};
