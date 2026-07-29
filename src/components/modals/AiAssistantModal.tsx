import React, { useState } from 'react';
import { X, Sparkles, FileText, CheckCircle2, AlertTriangle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { DiagramProject } from '../../types/workflow';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DiagramProject;
  setProject: React.Dispatch<React.SetStateAction<DiagramProject>>;
  initialTab?: 'generate' | 'explain' | 'validate';
  onRecordHistory: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  project,
  setProject,
  initialTab = 'generate',
  onRecordHistory,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'generate' | 'explain' | 'validate'>(initialTab);
  const [promptText, setPromptText] = useState('');
  const [diagramType, setDiagramType] = useState<'BPMN' | 'Flowchart' | 'UML'>('BPMN');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Results state
  const [summaryResult, setSummaryResult] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleGenerateWorkflow = async () => {
    if (!promptText.trim()) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, diagramType }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate diagram');
      }

      if (data.diagram) {
        setProject((prev) => ({
          ...prev,
          title: data.diagram.title || prev.title,
          type: data.diagram.type || prev.type,
          nodes: data.diagram.nodes || [],
          connectors: data.diagram.connectors || [],
        }));
        onRecordHistory();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during AI generation');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainWorkflow = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagram: project }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate explanation');
      }

      setSummaryResult(data.explanation || '');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateWorkflow = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagram: project }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to audit workflow');
      }

      setValidationResult(data.report);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to perform workflow audit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Workflow Assistant</h2>
              <p className="text-[11px] text-slate-400">Powered by Gemini 3.6 Enterprise Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
              activeTab === 'generate'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate from Prompt</span>
          </button>
          <button
            onClick={() => { setActiveTab('explain'); if (!summaryResult) handleExplainWorkflow(); }}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
              activeTab === 'explain'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Summary</span>
          </button>
          <button
            onClick={() => { setActiveTab('validate'); if (!validationResult) handleValidateWorkflow(); }}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
              activeTab === 'validate'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audit & Validation</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Describe your desired process or business workflow
                </label>
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="e.g. Create an employee expense approval workflow starting with claim submission, manager review decision, auto-rejection if over budget, finance payment processing, and email notification."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1.5">Diagram Format</label>
                  <select
                    value={diagramType}
                    onChange={(e) => setDiagramType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="BPMN">BPMN 2.0 Standard</option>
                    <option value="Flowchart">Flowchart</option>
                    <option value="UML">UML Activity Diagram</option>
                  </select>
                </div>
              </div>

              <button
                disabled={loading || !promptText.trim()}
                onClick={handleGenerateWorkflow}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all ${
                  loading || !promptText.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Workflow Diagram...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Build Canvas</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'explain' && (
            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                  <span className="text-xs">Analyzing diagram elements...</span>
                </div>
              ) : summaryResult ? (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
                  {summaryResult}
                </div>
              ) : (
                <button
                  onClick={handleExplainWorkflow}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-200"
                >
                  Generate Summary
                </button>
              )}
            </div>
          )}

          {activeTab === 'validate' && (
            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                  <span className="text-xs">Auditing workflow semantics...</span>
                </div>
              ) : validationResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 block">Quality Score</span>
                      <span className="text-2xl font-bold font-mono text-emerald-400">
                        {validationResult.score}/100
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      STATUS: {validationResult.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300">Identified Issues & Fixes</h4>
                    {validationResult.issues?.map((issue: any, idx: number) => (
                      <div key={idx} className="bg-slate-950/60 p-3 rounded border border-slate-800 text-xs">
                        <div className="flex items-center space-x-2 text-amber-400 font-medium mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{issue.message}</span>
                        </div>
                        <p className="text-slate-400 pl-5.5">{issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleValidateWorkflow}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-200"
                >
                  Run Diagram Audit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
