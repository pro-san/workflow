export type AutoLayoutAlgorithm =
  | 'horizontal_tree'
  | 'vertical_tree'
  | 'circular'
  | 'grid'
  | 'organic';

export type ShapeCategory = 'basic' | 'bpmn' | 'flowchart' | 'uml' | 'cloud' | 'widget';

export type ShapeType =
  // Basic
  | 'rectangle'
  | 'rounded_rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'pentagon'
  | 'arrow_right'
  | 'star'
  // BPMN 2.0
  | 'start_event'
  | 'end_event'
  | 'intermediate_event'
  | 'task'
  | 'user_task'
  | 'service_task'
  | 'script_task'
  | 'manual_task'
  | 'business_rule'
  | 'gateway_exclusive'
  | 'gateway_parallel'
  | 'gateway_inclusive'
  | 'pool'
  | 'lane'
  // Flowchart
  | 'process'
  | 'decision'
  | 'document'
  | 'data'
  | 'input_output'
  | 'delay'
  | 'database'
  | 'cloud_shape'
  // UML
  | 'actor'
  | 'class_box'
  | 'interface_box'
  | 'component'
  | 'use_case'
  | 'activity'
  | 'state'
  // Cloud
  | 'aws_compute'
  | 'aws_storage'
  | 'aws_database'
  | 'azure_vm'
  | 'gcp_cloud'
  // Widgets
  | 'text_box'
  | 'sticky_note'
  | 'table'
  | 'qr_code'
  | 'image_placeholder';

export type AnchorPoint = 'top' | 'right' | 'bottom' | 'left' | 'center';

export type ConnectorLineStyle = 'orthogonal' | 'curved' | 'straight';

export type ArrowType = 'arrow' | 'filled_arrow' | 'diamond' | 'circle' | 'none';

export interface CanvasNode {
  id: string;
  type: ShapeType;
  category: ShapeCategory;
  label: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
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
  layerId: string;
  locked: boolean;
  hidden: boolean;
  customData?: Record<string, any>;
}

export interface CanvasConnector {
  id: string;
  fromNodeId: string;
  fromAnchor: AnchorPoint;
  toNodeId: string;
  toAnchor: AnchorPoint;
  label: string;
  lineStyle: ConnectorLineStyle;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  startArrow: ArrowType;
  endArrow: ArrowType;
  animated: boolean;
  jumpLines: boolean;
  fontSize: number;
  textColor: string;
}

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

export interface DiagramProject {
  id: string;
  title: string;
  description: string;
  type: 'BPMN' | 'Flowchart' | 'UML' | 'Cloud Architecture' | 'General';
  nodes: CanvasNode[];
  connectors: CanvasConnector[];
  layers: CanvasLayer[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  favorite: boolean;
}

export type ActiveTool = 'select' | 'pan' | 'connector' | 'text' | 'shape';

export interface CanvasState {
  selectedNodeIds: string[];
  selectedConnectorIds: string[];
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  showRulers: boolean;
  showMiniMap: boolean;
  activeTool: ActiveTool;
  activeLayerId: string;
  connectingSourceId: string | null;
  connectingSourceAnchor: AnchorPoint | null;
}

export type ThemeName =
  | 'light_enterprise'
  | 'dark_studio'
  | 'blueprint'
  | 'cyberpunk'
  | 'warm_sunset'
  | 'forest_mint';

export interface PluginDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  category: 'Validation' | 'Export' | 'Automation' | 'Analytics';
}

export interface AIValidationIssue {
  severity: 'high' | 'medium' | 'low';
  nodeId?: string;
  message: string;
  suggestion: string;
}

export interface AIValidationReport {
  score: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  issues: AIValidationIssue[];
  bestPractices: string[];
}
