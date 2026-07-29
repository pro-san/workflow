import { CanvasConnector, CanvasNode } from '../types/workflow';

export type AutoLayoutAlgorithm =
  | 'horizontal_tree'
  | 'vertical_tree'
  | 'circular'
  | 'grid'
  | 'organic';

export function applyAutoLayout(
  nodes: CanvasNode[],
  connectors: CanvasConnector[],
  algorithm: AutoLayoutAlgorithm
): CanvasNode[] {
  if (nodes.length === 0) return nodes;

  const newNodes = nodes.map((n) => ({ ...n }));

  if (algorithm === 'grid') {
    const cols = Math.ceil(Math.sqrt(newNodes.length));
    const startX = 100;
    const startY = 100;
    const spacingX = 220;
    const spacingY = 160;

    newNodes.forEach((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      node.x = startX + col * spacingX;
      node.y = startY + row * spacingY;
    });
    return newNodes;
  }

  if (algorithm === 'circular') {
    const centerX = 500;
    const centerY = 400;
    const radius = Math.max(180, newNodes.length * 40);
    const angleStep = (2 * Math.PI) / newNodes.length;

    newNodes.forEach((node, i) => {
      const angle = i * angleStep;
      node.x = centerX + radius * Math.cos(angle) - node.width / 2;
      node.y = centerY + radius * Math.sin(angle) - node.height / 2;
    });
    return newNodes;
  }

  if (algorithm === 'horizontal_tree' || algorithm === 'vertical_tree') {
    // Topological / Level ordering based on connectors
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    newNodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });

    connectors.forEach((c) => {
      if (adj[c.fromNodeId] && inDegree[c.toNodeId] !== undefined) {
        adj[c.fromNodeId].push(c.toNodeId);
        inDegree[c.toNodeId] = (inDegree[c.toNodeId] || 0) + 1;
      }
    });

    const levels: Record<string, number> = {};
    const queue: string[] = [];

    // Find root nodes
    Object.keys(inDegree).forEach((id) => {
      if (inDegree[id] === 0) {
        queue.push(id);
        levels[id] = 0;
      }
    });

    if (queue.length === 0 && newNodes.length > 0) {
      queue.push(newNodes[0].id);
      levels[newNodes[0].id] = 0;
    }

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const currLevel = levels[curr] || 0;

      (adj[curr] || []).forEach((next) => {
        if (levels[next] === undefined || levels[next] < currLevel + 1) {
          levels[next] = currLevel + 1;
          queue.push(next);
        }
      });
    }

    // Group nodes by level
    const levelGroups: Record<number, CanvasNode[]> = {};
    newNodes.forEach((node) => {
      const lvl = levels[node.id] || 0;
      if (!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(node);
    });

    const startX = 100;
    const startY = 120;
    const levelGap = 240;
    const siblingGap = 140;

    if (algorithm === 'horizontal_tree') {
      Object.keys(levelGroups).forEach((lvlStr) => {
        const lvl = parseInt(lvlStr, 10);
        const group = levelGroups[lvl];
        const totalHeight = group.length * siblingGap;
        const groupStartY = startY + Math.max(0, (400 - totalHeight) / 2);

        group.forEach((node, idx) => {
          node.x = startX + lvl * levelGap;
          node.y = groupStartY + idx * siblingGap;
        });
      });
    } else {
      Object.keys(levelGroups).forEach((lvlStr) => {
        const lvl = parseInt(lvlStr, 10);
        const group = levelGroups[lvl];
        const totalWidth = group.length * siblingGap;
        const groupStartX = startX + Math.max(0, (600 - totalWidth) / 2);

        group.forEach((node, idx) => {
          node.x = groupStartX + idx * siblingGap;
          node.y = startY + lvl * levelGap;
        });
      });
    }

    return newNodes;
  }

  // Organic Organic / Force-Directed placement approximation
  const iterations = 50;
  const k = 180; // optimal distance

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all node pairs
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        const n1 = newNodes[i];
        const n2 = newNodes[j];
        let dx = n2.x - n1.x;
        let dy = n2.y - n1.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let force = (k * k) / dist;

        n1.x -= (dx / dist) * force * 0.05;
        n1.y -= (dy / dist) * force * 0.05;
        n2.x += (dx / dist) * force * 0.05;
        n2.y += (dy / dist) * force * 0.05;
      }
    }

    // Attraction along connectors
    connectors.forEach((c) => {
      const n1 = newNodes.find((n) => n.id === c.fromNodeId);
      const n2 = newNodes.find((n) => n.id === c.toNodeId);
      if (n1 && n2) {
        let dx = n2.x - n1.x;
        let dy = n2.y - n1.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let force = (dist * dist) / k;

        n1.x += (dx / dist) * force * 0.03;
        n1.y += (dy / dist) * force * 0.03;
        n2.x -= (dx / dist) * force * 0.03;
        n2.y -= (dy / dist) * force * 0.03;
      }
    });
  }

  return newNodes;
}
