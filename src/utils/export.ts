import { DiagramProject } from '../types/workflow';

/**
 * Downloads a text-based blob to user machine
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports diagram as JSON file
 */
export function exportToJSON(project: DiagramProject) {
  const jsonStr = JSON.stringify(project, null, 2);
  downloadFile(jsonStr, `${slugify(project.title)}.wf.json`, 'application/json');
}

/**
 * Exports diagram as standard XML format
 */
export function exportToXML(project: DiagramProject) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<workflow title="${escapeXml(project.title)}" type="${project.type}">\n`;
  xml += `  <nodes>\n`;
  project.nodes.forEach((n) => {
    xml += `    <node id="${n.id}" type="${n.type}" label="${escapeXml(n.label)}" x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" fill="${n.fill}" stroke="${n.stroke}" />\n`;
  });
  xml += `  </nodes>\n`;
  xml += `  <connectors>\n`;
  project.connectors.forEach((c) => {
    xml += `    <connector id="${c.id}" from="${c.fromNodeId}" to="${c.toNodeId}" label="${escapeXml(c.label)}" lineStyle="${c.lineStyle}" />\n`;
  });
  xml += `  </connectors>\n`;
  xml += `</workflow>`;

  downloadFile(xml, `${slugify(project.title)}.xml`, 'text/xml');
}

/**
 * Exports diagram as standard BPMN 2.0 XML
 */
export function exportToBPMNXML(project: DiagramProject) {
  let bpmn = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  bpmn += `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">\n`;
  bpmn += `  <bpmn:process id="Process_1" isExecutable="true">\n`;

  project.nodes.forEach((n) => {
    const nodeType = getBpmnTagName(n.type);
    bpmn += `    <bpmn:${nodeType} id="${n.id}" name="${escapeXml(n.label)}" />\n`;
  });

  project.connectors.forEach((c) => {
    bpmn += `    <bpmn:sequenceFlow id="${c.id}" sourceRef="${c.fromNodeId}" targetRef="${c.toNodeId}" name="${escapeXml(c.label)}" />\n`;
  });

  bpmn += `  </bpmn:process>\n`;
  bpmn += `</bpmn:definitions>`;

  downloadFile(bpmn, `${slugify(project.title)}.bpmn`, 'text/xml');
}

/**
 * Exports diagram documentation as Markdown
 */
export function exportToMarkdown(project: DiagramProject) {
  let md = `# Workflow Documentation: ${project.title}\n\n`;
  md += `**Type:** ${project.type}  \n`;
  md += `**Created:** ${project.createdAt}  \n`;
  md += `**Description:** ${project.description || 'N/A'}  \n\n`;

  md += `## Steps & Nodes (${project.nodes.length})\n\n`;
  md += `| ID | Name / Label | Type | Category |\n`;
  md += `|---|---|---|---|\n`;
  project.nodes.forEach((n) => {
    md += `| ${n.id} | ${n.label || 'Unnamed'} | ${n.type} | ${n.category} |\n`;
  });

  md += `\n## Connections & Transitions (${project.connectors.length})\n\n`;
  md += `| From | Target | Label | Style |\n`;
  md += `|---|---|---|---|\n`;
  project.connectors.forEach((c) => {
    const fromNode = project.nodes.find((n) => n.id === c.fromNodeId)?.label || c.fromNodeId;
    const toNode = project.nodes.find((n) => n.id === c.toNodeId)?.label || c.toNodeId;
    md += `| ${fromNode} | ${toNode} | ${c.label || '-'} | ${c.lineStyle} |\n`;
  });

  downloadFile(md, `${slugify(project.title)}.md`, 'text/markdown');
}

/**
 * Downloads SVG element as file
 */
export function exportSvgElement(svgEl: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgEl);

  if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  downloadFile(svgString, filename, 'image/svg+xml');
}

/**
 * Converts SVG element into raster PNG/JPG download
 */
export function exportSvgToImage(svgEl: SVGSVGElement, filename: string, format: 'png' | 'jpeg') {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const bbox = svgEl.getBoundingClientRect();
    canvas.width = (bbox.width || 1200) * 2;
    canvas.height = (bbox.height || 800) * 2;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      const imgUrl = canvas.toDataURL(`image/${format}`, 0.95);
      const a = document.createElement('a');
      a.href = imgUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'diagram';
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function getBpmnTagName(type: string): string {
  switch (type) {
    case 'start_event': return 'startEvent';
    case 'end_event': return 'endEvent';
    case 'user_task': return 'userTask';
    case 'service_task': return 'serviceTask';
    case 'script_task': return 'scriptTask';
    case 'gateway_exclusive': return 'exclusiveGateway';
    case 'gateway_parallel': return 'parallelGateway';
    default: return 'task';
  }
}
