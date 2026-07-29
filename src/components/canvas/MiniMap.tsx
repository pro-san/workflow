import React from 'react';
import { CanvasConnector, CanvasNode } from '../../types/workflow';

interface MiniMapProps {
  nodes: CanvasNode[];
  connectors: CanvasConnector[];
  zoom: number;
  panX: number;
  panY: number;
}

export const MiniMap: React.FC<MiniMapProps> = ({ nodes, connectors, zoom, panX, panY }) => {
  if (nodes.length === 0) return null;

  // Find canvas extents
  let minX = 0;
  let minY = 0;
  let maxX = 1200;
  let maxY = 800;

  nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  });

  const width = Math.max(1000, maxX - minX + 200);
  const height = Math.max(700, maxY - minY + 200);

  const mapWidth = 180;
  const mapHeight = 120;
  const scaleX = mapWidth / width;
  const scaleY = mapHeight / height;

  return (
    <div className="absolute bottom-4 right-4 w-[180px] h-[120px] bg-slate-900/90 border border-slate-700/80 rounded-lg shadow-2xl overflow-hidden pointer-events-none select-none z-20 backdrop-blur-sm">
      <svg className="w-full h-full bg-slate-950/80">
        {nodes.map((node) => (
          <rect
            key={node.id}
            x={(node.x - minX + 100) * scaleX}
            y={(node.y - minY + 100) * scaleY}
            width={Math.max(4, node.width * scaleX)}
            height={Math.max(4, node.height * scaleY)}
            fill={node.fill || '#4f46e5'}
            rx={2}
            opacity={0.8}
          />
        ))}

        {/* Viewport Box */}
        <rect
          x={Math.max(0, (-panX - minX + 100) * scaleX)}
          y={Math.max(0, (-panY - minY + 100) * scaleY)}
          width={Math.min(mapWidth, (800 / zoom) * scaleX)}
          height={Math.min(mapHeight, (600 / zoom) * scaleY)}
          fill="rgba(99, 102, 241, 0.15)"
          stroke="#818cf8"
          strokeWidth="1.5"
          rx={2}
        />
      </svg>
    </div>
  );
};
