import React, { useState } from 'react';
import { DiagramProject, StickyComment } from '../../types/workflow';
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Link,
  Search,
  Filter,
  Palette,
  Check,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

interface StickyCommentsPanelProps {
  project: DiagramProject;
  onUpdateComments: (comments: StickyComment[]) => void;
  onAddStickyComment: (targetNodeId?: string) => void;
  onSelectNode?: (nodeId: string) => void;
}

const NOTE_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
];

export const StickyCommentsPanel: React.FC<StickyCommentsPanelProps> = ({
  project,
  onUpdateComments,
  onAddStickyComment,
  onSelectNode,
}) => {
  const comments = project.comments || [];
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [showOnlyUnresolved, setShowOnlyUnresolved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const filteredComments = comments.filter((c) => {
    if (showOnlyUnresolved && c.resolved) return false;
    if (filter === 'active' && c.resolved) return false;
    if (filter === 'resolved' && !c.resolved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const targetNode = project.nodes.find((n) => n.id === c.targetNodeId);
      const nodeLabel = targetNode?.label || '';

      const matchesContent = c.content.toLowerCase().includes(q);
      const matchesAuthor = c.author.toLowerCase().includes(q);
      const matchesNodeLabel = nodeLabel.toLowerCase().includes(q);
      const matchesNodeId = c.targetNodeId ? c.targetNodeId.toLowerCase().includes(q) : false;

      if (!matchesContent && !matchesAuthor && !matchesNodeLabel && !matchesNodeId) {
        return false;
      }
    }
    return true;
  });

  const activeCount = comments.filter((c) => !c.resolved).length;
  const resolvedCount = comments.filter((c) => c.resolved).length;
  const unresolvedInViewCount = filteredComments.filter((c) => !c.resolved).length;

  const handleResolveAll = () => {
    const updated = comments.map((c) => ({ ...c, resolved: true }));
    onUpdateComments(updated);
  };

  const handleToggleResolve = (id: string) => {
    const updated = comments.map((c) =>
      c.id === id ? { ...c, resolved: !c.resolved } : c
    );
    onUpdateComments(updated);
  };

  const handleDelete = (id: string) => {
    onUpdateComments(comments.filter((c) => c.id !== id));
  };

  const handleStartEditing = (c: StickyComment) => {
    setEditingCommentId(c.id);
    setEditingText(c.content);
  };

  const handleSaveEditing = (id: string) => {
    if (editingText.trim()) {
      onUpdateComments(
        comments.map((c) => (c.id === id ? { ...c, content: editingText.trim() } : c))
      );
    }
    setEditingCommentId(null);
  };

  const handleColorChange = (id: string, color: string) => {
    onUpdateComments(comments.map((c) => (c.id === id ? { ...c, color } : c)));
  };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 overflow-hidden">
          <MessageSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <h3 className="font-semibold text-sm text-slate-100 truncate">Notes</h3>
          <span className="bg-slate-800 text-slate-400 text-xs px-1.5 py-0.5 rounded-full font-mono flex-shrink-0">
            {comments.length}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleResolveAll}
            disabled={activeCount === 0}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500/10 disabled:cursor-not-allowed px-2 py-1 rounded-md text-[11px] font-medium flex items-center space-x-1 transition-colors shadow-sm"
            title={
              activeCount > 0
                ? `Resolve all ${activeCount} active notes`
                : 'All notes are already resolved'
            }
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Resolve All</span>
          </button>
          <button
            onClick={() => onAddStickyComment()}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2 py-1 rounded-md text-[11px] font-semibold flex items-center space-x-1 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 space-y-2 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search content, author, or node..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 p-0.5 rounded"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between bg-slate-950 p-1 rounded-lg border border-slate-800/80 text-xs">
          <button
            onClick={() => {
              setFilter('all');
              if (showOnlyUnresolved) setShowOnlyUnresolved(false);
            }}
            className={`flex-1 py-1 rounded-md text-center font-medium transition-colors ${
              filter === 'all' && !showOnlyUnresolved
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({comments.length})
          </button>
          <button
            onClick={() => {
              setFilter('active');
            }}
            className={`flex-1 py-1 rounded-md text-center font-medium transition-colors ${
              filter === 'active' || showOnlyUnresolved
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => {
              setFilter('resolved');
              if (showOnlyUnresolved) setShowOnlyUnresolved(false);
            }}
            className={`flex-1 py-1 rounded-md text-center font-medium transition-colors ${
              filter === 'resolved' && !showOnlyUnresolved
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Unresolved Only Quick Toggle */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 rounded-lg border border-slate-800/80">
          <div className="flex items-center space-x-2">
            {showOnlyUnresolved ? (
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-xs font-medium text-slate-300">
              Show unresolved only
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !showOnlyUnresolved;
              setShowOnlyUnresolved(next);
              if (next && filter === 'resolved') {
                setFilter('all');
              }
            }}
            className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showOnlyUnresolved ? 'bg-amber-500' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={showOnlyUnresolved}
            title={showOnlyUnresolved ? 'Showing unresolved feedback only' : 'Toggle to show only unresolved feedback'}
          >
            <span
              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                showOnlyUnresolved ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sticky Comments List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredComments.length === 0 ? (
          <div className="text-center py-10 px-4">
            <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">No sticky notes found</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Click "+ New Note" or right-click canvas nodes to add collaborative feedback.
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const targetNode = project.nodes.find((n) => n.id === comment.targetNodeId);

            return (
              <div
                key={comment.id}
                className={`p-3 rounded-lg border transition-all ${
                  comment.resolved
                    ? 'bg-slate-950/50 border-slate-800/60 opacity-75'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Note Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    {/* Color Swatch */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-slate-700"
                      style={{ backgroundColor: comment.color || '#fef08a' }}
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {comment.author}
                      </p>
                      <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{comment.createdAt}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleResolve(comment.id)}
                      className={`p-1 rounded transition-colors ${
                        comment.resolved
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50'
                          : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                      }`}
                      title={comment.resolved ? 'Mark Active' : 'Mark Resolved'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Target Node Attachment */}
                {targetNode && (
                  <button
                    onClick={() => onSelectNode && onSelectNode(targetNode.id)}
                    className="w-full flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-amber-400/90 hover:text-amber-300 hover:border-amber-500/30 mb-2 truncate text-left transition-colors"
                  >
                    <Link className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">Target: {targetNode.label}</span>
                  </button>
                )}

                {/* Note Content */}
                {editingCommentId === comment.id ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded p-2 text-xs text-slate-200 focus:outline-none resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-1.5">
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEditing(comment.id)}
                        className="px-2.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[11px] font-medium hover:bg-amber-400"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => handleStartEditing(comment)}
                    className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/80 cursor-pointer hover:border-slate-700 whitespace-pre-wrap leading-relaxed"
                  >
                    {comment.content}
                  </p>
                )}

                {/* Color Selector Bar */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Palette className="w-2.5 h-2.5" />
                    <span>Color</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    {NOTE_COLORS.map((col) => (
                      <button
                        key={col.value}
                        onClick={() => handleColorChange(comment.id, col.value)}
                        className={`w-3.5 h-3.5 rounded-full border border-slate-700 transition-transform ${
                          comment.color === col.value
                            ? 'ring-2 ring-amber-400 scale-110'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: col.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
