import { DiagramProject, StickyComment } from '../types/workflow';

/**
 * Cleanly escapes field values for CSV output
 */
const escapeCSV = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Export feedback comments as a CSV file download
 */
export const exportCommentsToCSV = (project: DiagramProject) => {
  const comments = project.comments || [];
  const nodesMap = new Map((project.nodes || []).map((n) => [n.id, n.label]));

  const headers = [
    'Comment ID',
    'Timestamp',
    'Author',
    'Status',
    'Linked Node ID',
    'Linked Node Name',
    'Comment Content',
    'Replies Count',
    'Replies Detail',
  ];

  const rows = comments.map((comment) => {
    const nodeLabel = comment.targetNodeId
      ? nodesMap.get(comment.targetNodeId) || comment.targetNodeId
      : 'Unlinked Canvas Note';

    const repliesDetail = (comment.replies || [])
      .map((r) => `[${r.createdAt}] ${r.author}: ${r.content}`)
      .join(' | ');

    return [
      escapeCSV(comment.id),
      escapeCSV(comment.createdAt),
      escapeCSV(comment.author),
      escapeCSV(comment.resolved ? 'Resolved' : 'Active'),
      escapeCSV(comment.targetNodeId || 'N/A'),
      escapeCSV(nodeLabel),
      escapeCSV(comment.content),
      escapeCSV(comment.replies ? comment.replies.length : 0),
      escapeCSV(repliesDetail),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedProjectName = (project.title || 'Project').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `${sanitizedProjectName}_Feedback_Report_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Open printable PDF / Report view in a new window/iframe or trigger print dialog
 */
export const printCommentsPDFReport = (project: DiagramProject) => {
  const comments = project.comments || [];
  const nodesMap = new Map((project.nodes || []).map((n) => [n.id, n.label]));

  const total = comments.length;
  const resolved = comments.filter((c) => c.resolved).length;
  const active = total - resolved;
  const printDate = new Date().toLocaleString();

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and print the PDF report.');
    return;
  }

  const reportHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${project.title || 'Project'} - Feedback & Comments Report</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          background: #ffffff;
          line-height: 1.5;
          margin: 0;
          padding: 20px;
        }
        .header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        .subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        .summary-value {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }
        .summary-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .comment-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-left: 4px solid #f59e0b;
          border-radius: 6px;
          padding: 14px;
          margin-bottom: 16px;
          page-break-inside: avoid;
        }
        .comment-card.resolved {
          border-left-color: #10b981;
          background: #f0fdf4;
        }
        .comment-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .author-box {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #1e293b;
        }
        .avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          object-fit: cover;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-active {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-resolved {
          background: #d1fae5;
          color: #065f46;
        }
        .node-link {
          font-size: 11px;
          color: #0284c7;
          background: #e0f2fe;
          padding: 2px 6px;
          border-radius: 4px;
          margin-bottom: 8px;
          display: inline-block;
        }
        .comment-body {
          font-size: 13px;
          color: #334155;
          white-space: pre-wrap;
          margin-bottom: 8px;
        }
        .reply-section {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px dashed #cbd5e1;
          padding-left: 12px;
        }
        .reply-item {
          background: #f1f5f9;
          border-radius: 6px;
          padding: 8px 10px;
          margin-bottom: 6px;
          font-size: 12px;
        }
        .reply-meta {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          color: #475569;
          font-size: 11px;
          margin-bottom: 2px;
        }
        .actions-bar {
          position: fixed;
          top: 12px;
          right: 12px;
          background: #0f172a;
          padding: 8px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          gap: 10px;
          z-index: 1000;
        }
        .btn-print {
          background: #f59e0b;
          color: #0f172a;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
        }
        .btn-close {
          background: #334155;
          color: #ffffff;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        }
        @media print {
          .actions-bar {
            display: none !important;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="actions-bar">
        <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <button class="btn-close" onclick="window.close()">Close</button>
      </div>

      <div class="header">
        <div>
          <h1 class="title">${project.title || 'Workflow Project'}</h1>
          <p class="subtitle">Feedback & Sticky Comments Audit Report • Generated on ${printDate}</p>
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-value">${total}</div>
          <div class="summary-label">Total Notes</div>
        </div>
        <div class="summary-card">
          <div class="summary-value" style="color: #d97706">${active}</div>
          <div class="summary-label">Active Notes</div>
        </div>
        <div class="summary-card">
          <div class="summary-value" style="color: #059669">${resolved}</div>
          <div class="summary-label">Resolved</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${
            comments.reduce((acc, c) => acc + (c.replies ? c.replies.length : 0), 0)
          }</div>
          <div class="summary-label">Thread Replies</div>
        </div>
      </div>

      <h2 style="font-size: 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">
        Detailed Feedback Log (${comments.length})
      </h2>

      ${
        comments.length === 0
          ? '<p style="color: #94a3b8; font-style: italic;">No sticky comment notes recorded in this project.</p>'
          : comments
              .map((c) => {
                const nodeLabel = c.targetNodeId
                  ? nodesMap.get(c.targetNodeId) || c.targetNodeId
                  : null;

                const repliesHTML =
                  c.replies && c.replies.length > 0
                    ? `
                    <div class="reply-section">
                      <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px;">
                        THREAD REPLIES (${c.replies.length})
                      </div>
                      ${c.replies
                        .map(
                          (r) => `
                        <div class="reply-item">
                          <div class="reply-meta">
                            <span>${r.author}</span>
                            <span>${r.createdAt}</span>
                          </div>
                          <div style="color: #1e293b;">${r.content}</div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  `
                    : '';

                return `
                  <div class="comment-card ${c.resolved ? 'resolved' : ''}">
                    <div class="comment-meta">
                      <div class="author-box">
                        ${
                          c.authorAvatar
                            ? `<img src="${c.authorAvatar}" class="avatar" alt="${c.author}" />`
                            : ''
                        }
                        <span>${c.author}</span>
                      </div>
                      <div>
                        <span class="badge ${c.resolved ? 'badge-resolved' : 'badge-active'}">
                          ${c.resolved ? 'Resolved' : 'Active'}
                        </span>
                        <span style="color: #64748b; margin-left: 8px;">${c.createdAt}</span>
                      </div>
                    </div>

                    ${
                      nodeLabel
                        ? `<div class="node-link">📍 Linked to Step: <strong>${nodeLabel}</strong></div>`
                        : ''
                    }

                    <div class="comment-body">${c.content}</div>

                    ${repliesHTML}
                  </div>
                `;
              })
              .join('')
      }
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(reportHTML);
  printWindow.document.close();
};
