import { AnchorPoint, CanvasNode, ConnectorLineStyle } from '../types/workflow';

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculates absolute (x, y) point for a specific anchor on a node
 */
export function getNodeAnchorPos(node: CanvasNode, anchor: AnchorPoint): Point {
  const { x, y, width, height } = node;
  switch (anchor) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
    case 'center':
    default:
      return { x: x + width / 2, y: y + height / 2 };
  }
}

/**
 * Snap coordinate to grid if enabled
 */
export function snapValue(val: number, gridSize: number, enabled: boolean): number {
  if (!enabled || gridSize <= 0) return val;
  return Math.round(val / gridSize) * gridSize;
}

/**
 * Generates SVG path string d="..." for straight, curved, or orthogonal connectors
 */
export function generateConnectorPath(
  start: Point,
  end: Point,
  startAnchor: AnchorPoint,
  endAnchor: AnchorPoint,
  style: ConnectorLineStyle
): string {
  if (style === 'straight') {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  if (style === 'curved') {
    const dx = Math.abs(end.x - start.x) * 0.5;
    const dy = Math.abs(end.y - start.y) * 0.5;

    let c1 = { ...start };
    let c2 = { ...end };

    if (startAnchor === 'left' || startAnchor === 'right') {
      c1.x += startAnchor === 'right' ? dx : -dx;
    } else {
      c1.y += startAnchor === 'bottom' ? dy : -dy;
    }

    if (endAnchor === 'left' || endAnchor === 'right') {
      c2.x += endAnchor === 'left' ? -dx : dx;
    } else {
      c2.y += endAnchor === 'top' ? -dy : dy;
    }

    return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
  }

  // Orthogonal (Elbow / Right-Angle) Routing
  const points: Point[] = [start];
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  if (startAnchor === 'right' || startAnchor === 'left') {
    if (endAnchor === 'left' || endAnchor === 'right') {
      points.push({ x: midX, y: start.y });
      points.push({ x: midX, y: end.y });
    } else {
      points.push({ x: end.x, y: start.y });
    }
  } else if (startAnchor === 'top' || startAnchor === 'bottom') {
    if (endAnchor === 'top' || endAnchor === 'bottom') {
      points.push({ x: start.x, y: midY });
      points.push({ x: end.x, y: midY });
    } else {
      points.push({ x: start.x, y: end.y });
    }
  } else {
    points.push({ x: midX, y: start.y });
    points.push({ x: midX, y: end.y });
  }

  points.push(end);

  return points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');
}

/**
 * Midpoint calculation for connector labels
 */
export function getConnectorMidpoint(start: Point, end: Point): Point {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

/**
 * Calculates bounding box around selected nodes
 */
export function getNodesBoundingBox(nodes: CanvasNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
