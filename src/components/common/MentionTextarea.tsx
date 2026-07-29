import React, { useState, useRef, useEffect } from 'react';
import { TEAM_MEMBERS, TeamMember } from '../../data/teamMembers';
import { AtSign, User } from 'lucide-react';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
  className?: string;
  lightMode?: boolean;
}

export const MentionTextarea: React.FC<MentionTextareaProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = 'Add your note... Type @ to mention collaborators',
  rows = 3,
  autoFocus = false,
  className = '',
  lightMode = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter members based on mentionQuery
  const filteredMembers = TEAM_MEMBERS.filter((member) => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.handle.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q)
    );
  });

  // Detect @ mention trigger when value or cursor position changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPos = e.target.selectionStart;
    checkMentionTrigger(newValue, cursorPos);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const cursorPos = textareaRef.current?.selectionStart || 0;
      checkMentionTrigger(value, cursorPos);
    }
  };

  const checkMentionTrigger = (text: string, cursorPos: number) => {
    // Look backward from cursorPos to find the last '@'
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos !== -1) {
      // Ensure '@' is at start of string or preceded by whitespace
      const charBeforeAt = lastAtPos > 0 ? textBeforeCursor[lastAtPos - 1] : ' ';
      const queryAfterAt = textBeforeCursor.slice(lastAtPos + 1);

      // Trigger if '@' preceded by whitespace/newline and query has no newlines
      if (/[\s\n]/.test(charBeforeAt) || lastAtPos === 0) {
        if (!queryAfterAt.includes('\n') && queryAfterAt.length <= 20) {
          setShowDropdown(true);
          setMentionQuery(queryAfterAt);
          setMentionIndex(lastAtPos);
          setSelectedIndex(0);
          return;
        }
      }
    }

    setShowDropdown(false);
  };

  const insertMention = (member: TeamMember) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;

    let startPos = mentionIndex;
    if (startPos === -1) {
      // Find last @ or current cursor
      startPos = cursorPos;
    }

    const textBefore = value.slice(0, startPos);
    const textAfter = value.slice(cursorPos);
    const mentionText = `@${member.name} `;

    const newText = textBefore + mentionText + textAfter;
    onChange(newText);

    setShowDropdown(false);

    // Set cursor right after inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = startPos + mentionText.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showDropdown && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
        return;
      }
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && onSave) {
      e.preventDefault();
      onSave();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full flex flex-col space-y-1.5">
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          rows={rows}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={
            className ||
            `w-full p-2.5 text-xs rounded-lg border resize-none focus:outline-none transition-all ${
              lightMode
                ? 'bg-white border-amber-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400'
                : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-amber-500/60'
            }`
          }
        />

        {/* Mention Trigger Dropdown List */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className={`absolute left-0 bottom-full mb-1 w-64 max-h-52 overflow-y-auto rounded-lg shadow-2xl border z-50 py-1 backdrop-blur-md ${
              lightMode
                ? 'bg-white/95 border-amber-200 text-slate-800 shadow-amber-900/10'
                : 'bg-slate-900/95 border-slate-700 text-slate-200 shadow-slate-950/80'
            }`}
          >
            <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-amber-500 uppercase flex items-center justify-between border-b border-slate-800/50 mb-1">
              <span className="flex items-center gap-1">
                <AtSign className="w-3 h-3 text-amber-400" />
                <span>Mention Team Member</span>
              </span>
              <span className="text-slate-500 text-[9px] font-normal">
                ↑↓ to navigate, Enter to tag
              </span>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 italic">
                No matching team members
              </div>
            ) : (
              filteredMembers.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => insertMention(member)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-2.5 py-1.5 flex items-center justify-between text-left text-xs transition-colors ${
                    index === selectedIndex
                      ? lightMode
                        ? 'bg-amber-100 text-amber-950 font-medium'
                        : 'bg-amber-500/20 text-amber-200 font-medium'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-5 h-5 rounded-full object-cover border border-amber-500/30 flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-medium leading-none text-xs">{member.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                    @{member.handle}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Team Member Quick Tag Bar */}
      <div className="flex items-center justify-between gap-1 pt-1">
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5 no-scrollbar">
          <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mr-1 flex-shrink-0">
            <AtSign className="w-2.5 h-2.5 text-amber-400" />
            <span>Tag:</span>
          </span>
          {TEAM_MEMBERS.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => insertMention(member)}
              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] border transition-colors flex-shrink-0 ${
                lightMode
                  ? 'bg-slate-100 hover:bg-amber-100 border-slate-200 text-slate-700'
                  : 'bg-slate-800/80 hover:bg-amber-500/20 border-slate-700/80 hover:border-amber-500/40 text-slate-300 hover:text-amber-300'
              }`}
              title={`Tag ${member.name} (${member.role})`}
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-3 h-3 rounded-full object-cover"
              />
              <span className="font-medium">{member.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {(onSave || onCancel) && (
          <div className="flex items-center space-x-1 flex-shrink-0">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            )}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded text-[11px] shadow-sm transition-colors"
              >
                Save
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
