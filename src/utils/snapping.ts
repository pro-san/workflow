import { CanvasNode } from '../types/workflow';

export interface AlignmentGuide {
  id: string;
  type: 'vertical' | 'horizontal';
  linePosition: number; // x coordinate for vertical line, y coordinate for horizontal line
  start: number; // y1 for vertical, x1 for horizontal
  end: number; // y2 for vertical, x2 for horizontal
  label?: string;
  isCanvasCenter?: boolean;
}

export interface SmartSnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

interface SmartSnapParams {
  dragNode: CanvasNode;
  rawX: number;
  rawY: number;
  otherNodes: CanvasNode[];
  canvasCenter?: { x: number; y: number };
  contentCenter?: { x: number; y: number };
  snapToGrid: boolean;
  gridSize?: number;
  snapThreshold?: number;
}

/**
 * Computes smart snap alignment positions and active guide lines when dragging a node.
 * Checks alignments against other visible nodes (edges & centers) and the canvas center.
 */
export function computeSmartSnap({
  dragNode,
  rawX,
  rawY,
  otherNodes,
  canvasCenter,
  contentCenter,
  snapToGrid,
  gridSize = 20,
  snapThreshold = 8,
}: SmartSnapParams): SmartSnapResult {
  let snappedX = rawX;
  let snappedY = rawY;
  const guides: AlignmentGuide[] = [];

  const dragWidth = dragNode.width;
  const dragHeight = dragNode.height;

  // -------------------------------------------------------------
  // Vertical Alignment Targets (matching X coordinates)
  // -------------------------------------------------------------
  interface VerticalTarget {
    x: number;
    minY: number;
    maxY: number;
    label?: string;
    isCenter?: boolean;
  }

  const verticalTargets: VerticalTarget[] = [];

  // 1. Canvas Center X
  if (canvasCenter) {
    verticalTargets.push({
      x: canvasCenter.x,
      minY: Math.min(rawY - 100, canvasCenter.y - 300),
      maxY: Math.max(rawY + dragHeight + 100, canvasCenter.y + 300),
      label: 'Canvas Center',
      isCenter: true,
    });
  }

  // 2. Content Center X (if distinct from canvas center)
  if (contentCenter && (!canvasCenter || Math.abs(contentCenter.x - canvasCenter.x) > 5)) {
    verticalTargets.push({
      x: contentCenter.x,
      minY: rawY - 100,
      maxY: rawY + dragHeight + 100,
      label: 'Diagram Center',
      isCenter: true,
    });
  }

  // 3. Other Nodes' X edges (Left, Center, Right)
  otherNodes.forEach((node) => {
    const left = node.x;
    const center = node.x + node.width / 2;
    const right = node.x + node.width;
    const minY = node.y;
    const maxY = node.y + node.height;

    verticalTargets.push(
      { x: left, minY, maxY, label: 'Align Left' },
      { x: center, minY, maxY, label: 'Align Center' },
      { x: right, minY, maxY, label: 'Align Right' }
    );
  });

  // Evaluate Vertical Snapping (modifies X)
  const dragXPoints = [
    { offset: 0, type: 'left' },
    { offset: dragWidth / 2, type: 'center' },
    { offset: dragWidth, type: 'right' },
  ];

  let bestXDiff = snapThreshold + 1;
  let bestXSnapPos: number | null = null;
  let bestXGuide: AlignmentGuide | null = null;

  for (const pt of dragXPoints) {
    const currentX = rawX + pt.offset;
    for (const target of verticalTargets) {
      const diff = Math.abs(currentX - target.x);
      if (diff <= snapThreshold && diff < bestXDiff) {
        bestXDiff = diff;
        bestXSnapPos = target.x - pt.offset;

        const minY = Math.min(rawY, target.minY) - 40;
        const maxY = Math.max(rawY + dragHeight, target.maxY) + 40;

        bestXGuide = {
          id: `v_${target.x}_${pt.type}`,
          type: 'vertical',
          linePosition: target.x,
          start: minY,
          end: maxY,
          label: target.label,
          isCanvasCenter: target.isCenter,
        };
      }
    }
  }

  if (bestXSnapPos !== null && bestXGuide !== null) {
    snappedX = bestXSnapPos;
    guides.push(bestXGuide);
  } else if (snapToGrid) {
    snappedX = Math.round(rawX / gridSize) * gridSize;
  }

  // -------------------------------------------------------------
  // Horizontal Alignment Targets (matching Y coordinates)
  // -------------------------------------------------------------
  interface HorizontalTarget {
    y: number;
    minX: number;
    maxX: number;
    label?: string;
    isCenter?: boolean;
  }

  const horizontalTargets: HorizontalTarget[] = [];

  // 1. Canvas Center Y
  if (canvasCenter) {
    horizontalTargets.push({
      y: canvasCenter.y,
      minX: Math.min(snappedX - 100, canvasCenter.x - 300),
      maxX: Math.max(snappedX + dragWidth + 100, canvasCenter.x + 300),
      label: 'Canvas Center',
      isCenter: true,
    });
  }

  // 2. Content Center Y (if distinct from canvas center)
  if (contentCenter && (!canvasCenter || Math.abs(contentCenter.y - canvasCenter.y) > 5)) {
    horizontalTargets.push({
      y: contentCenter.y,
      minX: snappedX - 100,
      maxX: snappedX + dragWidth + 100,
      label: 'Diagram Center',
      isCenter: true,
    });
  }

  // 3. Other Nodes' Y edges (Top, Middle, Bottom)
  otherNodes.forEach((node) => {
    const top = node.y;
    const middle = node.y + node.height / 2;
    const bottom = node.y + node.height;
    const minX = node.x;
    const maxX = node.x + node.width;

    horizontalTargets.push(
      { y: top, minX, maxX, label: 'Align Top' },
      { y: middle, minX, maxX, label: 'Align Middle' },
      { y: bottom, minX, maxX, label: 'Align Middle' }
    );
  });

  // Evaluate Horizontal Snapping (modifies Y)
  const dragYPoints = [
    { offset: 0, type: 'top' },
    { offset: dragHeight / 2, type: 'middle' },
    { offset: dragHeight, type: 'bottom' },
  ];

  let bestYDiff = snapThreshold + 1;
  let bestYSnapPos: number | null = null;
  let bestYGuide: AlignmentGuide | null = null;

  for (const pt of dragYPoints) {
    const currentY = rawY + pt.offset;
    for (const target of horizontalTargets) {
      const diff = Math.abs(currentY - target.y);
      if (diff <= snapThreshold && diff < bestYDiff) {
        bestYDiff = diff;
        bestYSnapPos = target.y - pt.offset;

        const minX = Math.min(snappedX, target.minX) - 40;
        const maxX = Math.max(snappedX + dragWidth, target.maxX) + 40;

        bestYGuide = {
          id: `h_${target.y}_${pt.type}`,
          type: 'horizontal',
          linePosition: target.y,
          start: minX,
          end: maxX,
          label: target.label,
          isCanvasCenter: target.isCenter,
        };
      }
    }
  }

  if (bestYSnapPos !== null && bestYGuide !== null) {
    snappedY = bestYSnapPos;
    guides.push(bestYGuide);
  } else if (snapToGrid) {
    snappedY = Math.round(rawY / gridSize) * gridSize;
  }

  return {
    x: snappedX,
    y: snappedY,
    guides,
  };
}
