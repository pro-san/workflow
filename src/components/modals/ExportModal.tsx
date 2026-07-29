import React, { useState } from 'react';
import { X, Download, FileCode, FileText, Image as ImageIcon, Check } from 'lucide-react';
import { DiagramProject } from '../../types/workflow';
import {
  exportSvgElement,
  exportSvgToImage,
  exportToBPMNXML,
  exportToJSON,
  exportToMarkdown,
  exportToXML,
} from '../../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DiagramProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  if (!isOpen) return null;

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const triggerExport = (format: string) => {
    const svgEl = document.querySelector('svg.pointer-events-auto') as SVGSVGElement;

    switch (format) {
      case 'json':
        exportToJSON(project);
        break;
      case 'xml':
        exportToXML(project);
        break;
      case 'bpmn':
        exportToBPMNXML(project);
        break;
      case 'markdown':
        exportToMarkdown(project);
        break;
      case 'svg':
        if (svgEl) exportSvgElement(svgEl, `${project.title.toLowerCase().replace(/\s+/g, '-')}.svg`);
        break;
      case 'png':
        if (svgEl) exportSvgToImage(svgEl, `${project.title.toLowerCase().replace(/\s+/g, '-')}.png`, 'png');
        break;
      case 'jpeg':
        if (svgEl) exportSvgToImage(svgEl, `${project.title.toLowerCase().replace(/\s+/g, '-')}.jpg`, 'jpeg');
        break;
    }

    setDownloadSuccess(format);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const exportFormats = [
    { id: 'svg', label: 'SVG Vector Graphic', desc: 'Scalable vector format for web & editing', icon: FileCode, ext: '.svg' },
    { id: 'png', label: 'PNG Image', desc: 'High-res transparent raster image', icon: ImageIcon, ext: '.png' },
    { id: 'jpeg', label: 'JPEG Image', desc: 'Standard compressed graphic image', icon: ImageIcon, ext: '.jpg' },
    { id: 'bpmn', label: 'BPMN 2.0 XML', desc: 'Industry standard XML for Camunda & Bizagi', icon: FileCode, ext: '.bpmn' },
    { id: 'json', label: 'JSON Diagram File', desc: 'Raw diagram state backup & import', icon: FileCode, ext: '.json' },
    { id: 'markdown', label: 'Markdown Documentation', desc: 'Auto-generated process documentation', icon: FileText, ext: '.md' },
    { id: 'xml', label: 'Standard XML', desc: 'Structured XML metadata export', icon: FileCode, ext: '.xml' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Download className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Export Workflow</h2>
              <p className="text-[11px] text-slate-400">Choose your preferred export format</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formats Grid */}
        <div className="p-5 flex-1 overflow-y-auto space-y-2.5">
          {exportFormats.map((fmt) => {
            const Icon = fmt.icon;
            const isDone = downloadSuccess === fmt.id;
            return (
              <button
                key={fmt.id}
                onClick={() => triggerExport(fmt.id)}
                className="w-full flex items-center justify-between p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-900 rounded-lg text-indigo-400 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        {fmt.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{fmt.ext}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{fmt.desc}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 group-hover:bg-indigo-600 rounded-lg text-xs font-medium text-slate-200 group-hover:text-white transition-all">
                  {isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Exported</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
