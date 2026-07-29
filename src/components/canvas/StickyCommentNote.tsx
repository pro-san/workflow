import React, { useState } from 'react';
import { StickyComment } from '../../types/workflow';
import { MentionTextarea } from '../common/MentionTextarea';
import { MentionText } from '../common/MentionText';
import { Check, Trash2, Edit2, MessageSquare, Link, Palette } from 'lucide-react';

interface StickyCommentNoteProps {
  comment: StickyComment;
  targetNodeLabel?: string;
  onUpdate: (updated: StickyComment) => void;
  onDelete: (id: string) => void;
  onStartDrag: (e: React.MouseEvent, commentId: string) => void;
  zoom: number;
}

const NOTE_COLORS = [
  { name: 'Yellow', value: '#fef08a', text: '#713f12', border: '#fde047' },
  { name: 'Green', value: '#bbf7d0', text: '#14532d', border: '#86efac' },
  { name: 'Blue', value: '#bfdbfe', text: '#1e3a8a', border: '#93c5fd' },
  { name: 'Pink', value: '#fbcfe8', text: '#831843', border: '#f472b6' },
  { name: 'Orange', value: '#fed7aa', text: '#7c2d12', border: '#fb923c' },
];

export const StickyCommentNote: React.FC<StickyCommentNoteProps> = ({
  comment,
  targetNodeLabel,
  onUpdate,
  onDelete,
  onStartDrag,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [showPalette, setShowPalette] = useState(false);

  const currentColorConfig =
    NOTE_COLORS.find((c) => c.value === comment.color) || NOTE_COLORS[0];

  const handleSaveText = () => {
    setIsEditing(false);
    if (content.trim() !== comment.content) {
      onUpdate({ ...comment, content: content.trim() });
    }
  };

  return (
    <foreignObject
      x={comment.x}
      y={comment.y}
      width={comment.width || 200}
      height={comment.height || 150}
      className="overflow-visible select-none"
    >
      <div
        style={{
          backgroundColor: comment.color || '#fef08a',
          borderColor: currentColorConfig.border,
          color: currentColorConfig.text,
        }}
        className={`relative w-full h-full p-2.5 rounded-lg shadow-lg border-2 flex flex-col justify-between transition-all duration-200 group ${
          comment.resolved ? 'opacity-60 grayscale-[0.3]' : 'hover:shadow-xl hover:scale-[1.01]'
        }`}
      >
        {/* Sticky Note Top Drag Handle / Header */}
        <div
          onMouseDown={(e) => onStartDrag(e, comment.id)}
          className="flex items-center justify-between cursor-move pb-1.5 border-b border-black/10 select-none"
        >
          <div className="flex items-center space-x-1.5 overflow-hidden">
            {comment.authorAvatar ? (
              <img
                src={comment.authorAvatar}
                alt={comment.author}
                className="w-4 h-4 rounded-full object-cover border border-black/20"
              />
            ) : (
              <MessageSquare className="w-3.5 h-3.5 opacity-70" />
            )}
            <span className="text-[11px] font-semibold truncate max-w-[100px]">
              {comment.author}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[9px] opacity-60 mr-1">{comment.createdAt}</span>

            {/* Resolve Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ ...comment, resolved: !comment.resolved });
              }}
              className={`p-0.5 rounded transition-colors ${
                comment.resolved
                  ? 'bg-emerald-600 text-white'
                  : 'hover:bg-black/10 text-black/70'
              }`}
              title={comment.resolved ? 'Mark active' : 'Mark resolved'}
            >
              <Check className="w-3 h-3" />
            </button>

            {/* Color Palette Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPalette(!showPalette);
              }}
              className="p-0.5 rounded hover:bg-black/10 text-black/70 transition-colors"
              title="Change color"
            >
              <Palette className="w-3 h-3" />
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(comment.id);
              }}
              className="p-0.5 rounded hover:bg-red-500 hover:text-white text-black/70 transition-colors"
              title="Delete comment"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Color Palette Popover */}
        {showPalette && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-8 right-2 bg-white/95 backdrop-blur-md p-1.5 rounded-md shadow-xl border border-slate-200 flex items-center space-x-1 z-30"
          >
            {NOTE_COLORS.map((col) => (
              <button
                key={col.value}
                onClick={() => {
                  onUpdate({ ...comment, color: col.value });
                  setShowPalette(false);
                }}
                className={`w-4 h-4 rounded-full border border-black/20 transition-transform ${
                  comment.color === col.value ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: col.value }}
                title={col.name}
              />
            ))}
          </div>
        )}

        {/* Linked Target Node Tag */}
        {targetNodeLabel && (
          <div className="flex items-center space-x-1 mt-1 text-[10px] font-medium opacity-75">
            <Link className="w-2.5 h-2.5" />
            <span className="truncate">Node: {targetNodeLabel}</span>
          </div>
        )}

        {/* Note Body Text Content */}
        <div className="flex-1 my-1 overflow-auto text-xs leading-snug">
          {isEditing ? (
            <MentionTextarea
              value={content}
              onChange={setContent}
              onSave={handleSaveText}
              onCancel={() => {
                setContent(comment.content);
                setIsEditing(false);
              }}
              rows={2}
              autoFocus
              lightMode
            />
          ) : (
            <div
              onDoubleClick={() => setIsEditing(true)}
              className="w-full h-full cursor-text whitespace-pre-wrap break-words font-sans"
            >
              {comment.content ? (
                <MentionText content={comment.content} lightMode />
              ) : (
                <span className="italic opacity-50">Empty note...</span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-black/10 opacity-75">
          <div className="flex items-center space-x-1.5">
            <span>{comment.resolved ? 'Resolved' : 'Active'}</span>
            {comment.replies && comment.replies.length > 0 && (
              <span className="flex items-center space-x-0.5 font-semibold text-slate-900 bg-black/10 px-1 py-0.5 rounded text-[9px]">
                <MessageSquare className="w-2.5 h-2.5" />
                <span>{comment.replies.length}</span>
              </span>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="hover:underline flex items-center space-x-0.5"
            >
              <Edit2 className="w-2.5 h-2.5" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </foreignObject>
  );
};
