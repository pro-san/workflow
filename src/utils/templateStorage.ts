import { CanvasNode, ShapeType, ShapeCategory } from '../types/workflow';

export interface NodeStyleTemplate {
  id: string;
  name: string;
  shapeType: ShapeType;
  category: ShapeCategory;
  width: number;
  height: number;
  fill: string;
  fillType: 'solid' | 'gradient' | 'none';
  gradientColor?: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  cornerRadius: number;
  opacity: number;
  shadow: boolean;
  glow: boolean;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  createdAt: string;
  isBuiltIn?: boolean;
}

export const BUILT_IN_TEMPLATES: NodeStyleTemplate[] = [
  {
    id: 'tpl_glass_indigo',
    name: 'Glassy Indigo',
    shapeType: 'rounded_rectangle',
    category: 'basic',
    width: 130,
    height: 75,
    fill: '#4f46e5',
    fillType: 'gradient',
    gradientColor: '#06b6d4',
    stroke: '#818cf8',
    strokeWidth: 2,
    strokeStyle: 'solid',
    cornerRadius: 14,
    opacity: 0.95,
    shadow: true,
    glow: true,
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: 'semibold',
    textColor: '#ffffff',
    textAlign: 'center',
    createdAt: '2026-01-01T00:00:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'tpl_alert_amber',
    name: 'Warning Alert',
    shapeType: 'diamond',
    category: 'basic',
    width: 90,
    height: 90,
    fill: '#f59e0b',
    fillType: 'solid',
    stroke: '#b45309',
    strokeWidth: 3,
    strokeStyle: 'solid',
    cornerRadius: 8,
    opacity: 1,
    shadow: true,
    glow: true,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 'bold',
    textColor: '#ffffff',
    textAlign: 'center',
    createdAt: '2026-01-01T00:00:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'tpl_emerald_process',
    name: 'Emerald Success',
    shapeType: 'circle',
    category: 'bpmn',
    width: 80,
    height: 80,
    fill: '#10b981',
    fillType: 'solid',
    stroke: '#047857',
    strokeWidth: 2,
    strokeStyle: 'solid',
    cornerRadius: 40,
    opacity: 1,
    shadow: true,
    glow: false,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 'semibold',
    textColor: '#ffffff',
    textAlign: 'center',
    createdAt: '2026-01-01T00:00:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'tpl_cyber_dark',
    name: 'Cyberpunk Neon',
    shapeType: 'rectangle',
    category: 'basic',
    width: 140,
    height: 70,
    fill: '#0f172a',
    fillType: 'solid',
    stroke: '#ec4899',
    strokeWidth: 2.5,
    strokeStyle: 'dashed',
    cornerRadius: 6,
    opacity: 1,
    shadow: true,
    glow: true,
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: 'medium',
    textColor: '#f472b6',
    textAlign: 'center',
    createdAt: '2026-01-01T00:00:00.000Z',
    isBuiltIn: true,
  },
];

const LOCAL_STORAGE_KEY = 'workflow_user_style_templates';

export function loadUserTemplates(): NodeStyleTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load user templates', err);
    return [];
  }
}

export function saveUserTemplates(templates: NodeStyleTemplate[]): void {
  try {
    const customOnly = templates.filter((t) => !t.isBuiltIn);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));
  } catch (err) {
    console.error('Failed to save user templates', err);
  }
}

export function createTemplateFromNode(node: CanvasNode, templateName: string): NodeStyleTemplate {
  return {
    id: `tpl_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: templateName.trim() || `${node.label || 'Node'} Style`,
    shapeType: node.type,
    category: node.category,
    width: node.width,
    height: node.height,
    fill: node.fill,
    fillType: node.fillType,
    gradientColor: node.gradientColor,
    stroke: node.stroke,
    strokeWidth: node.strokeWidth,
    strokeStyle: node.strokeStyle,
    cornerRadius: node.cornerRadius,
    opacity: node.opacity,
    shadow: node.shadow,
    glow: node.glow,
    fontFamily: node.fontFamily,
    fontSize: node.fontSize,
    fontWeight: node.fontWeight,
    textColor: node.textColor,
    textAlign: node.textAlign,
    createdAt: new Date().toISOString(),
    isBuiltIn: false,
  };
}
