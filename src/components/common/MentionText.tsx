import React from 'react';
import { TEAM_MEMBERS } from '../../data/teamMembers';

interface MentionTextProps {
  content: string;
  className?: string;
  lightMode?: boolean;
}

export const MentionText: React.FC<MentionTextProps> = ({
  content,
  className = '',
  lightMode = false,
}) => {
  if (!content) return null;

  // Build regex pattern matching @MemberName or @handle or general @[A-Za-z0-9_]+
  // Sort member names by length descending so longer names match first (e.g. Sarah Jenkins before Sarah)
  const sortedMembers = [...TEAM_MEMBERS].sort((a, b) => b.name.length - a.name.length);
  const memberPatterns = sortedMembers.map(
    (m) => `@${m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
  );
  const handlePatterns = sortedMembers.map(
    (m) => `@${m.handle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
  );

  // Combine into single regex
  const allRegexString = `(${[...memberPatterns, ...handlePatterns, '@[A-Za-z0-9_]+'].join('|')})`;
  const regex = new RegExp(allRegexString, 'gi');

  const parts = content.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('@')) {
          const rawName = part.substring(1).trim().toLowerCase();
          const matchedMember = TEAM_MEMBERS.find(
            (m) =>
              m.name.toLowerCase() === rawName ||
              m.handle.toLowerCase() === rawName ||
              m.name.toLowerCase().startsWith(rawName)
          );

          return (
            <span
              key={index}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-semibold transition-all ${
                lightMode
                  ? 'bg-amber-600/20 text-amber-900 border border-amber-600/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
              }`}
              title={
                matchedMember
                  ? `${matchedMember.name} • ${matchedMember.role}`
                  : `Tagged collaborator: ${part}`
              }
            >
              {matchedMember ? (
                <>
                  <img
                    src={matchedMember.avatar}
                    alt={matchedMember.name}
                    className="w-3 h-3 rounded-full object-cover"
                  />
                  <span>@{matchedMember.name}</span>
                </>
              ) : (
                <span>{part}</span>
              )}
            </span>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
