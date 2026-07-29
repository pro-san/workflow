import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API client on server side
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Workflow Designer Enterprise Server',
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(apiKey),
    });
  });

  // AI Workflow Generator Endpoint
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, diagramType = 'BPMN', style = 'Modern' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const systemInstruction = `You are a World-Class Enterprise Workflow & Process Architect.
Your job is to parse natural language descriptions into valid, visually organized, clean diagram JSON data structures.

Return strictly a JSON object with no markdown formatting around it (no markdown code fences). The structure must follow this format:

{
  "title": "Name of workflow",
  "type": "${diagramType}",
  "nodes": [
    {
      "id": "node_1",
      "type": "start_event | process | user_task | service_task | gateway_exclusive | gateway_parallel | end_event | document | data | cloud",
      "label": "Action or Event Name",
      "category": "bpmn | flowchart | uml | cloud",
      "x": 100,
      "y": 150,
      "width": 120,
      "height": 70,
      "fill": "#4f46e5",
      "stroke": "#312e81",
      "shape": "rectangle | rounded_rectangle | circle | diamond | cloud | cylinder"
    }
  ],
  "connectors": [
    {
      "id": "conn_1",
      "from": "node_1",
      "to": "node_2",
      "label": "Yes / Next",
      "lineStyle": "orthogonal | curved | straight",
      "animated": false
    }
  ]
}

Ensure coordinates (x, y) flow logically from left to right (x increasing by 180-220px per step) or top to bottom.
For decision gateways, split paths vertically (e.g. y = 100 for Yes, y = 300 for No) and converge if necessary.
Generate 5 to 12 meaningful nodes with rich labels and accurate routing links.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Create a ${diagramType} workflow diagram based on this prompt: "${prompt}". Style preference: ${style}.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      let responseText = response.text || '';
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedData = JSON.parse(responseText);
      return res.json({ success: true, diagram: parsedData });
    } catch (err: any) {
      console.error('AI Generate Error:', err);
      return res.status(500).json({
        error: 'Failed to generate workflow with AI',
        details: err?.message || String(err),
      });
    }
  });

  // AI Workflow Explanation Endpoint
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { diagram } = req.body;
      if (!diagram) {
        return res.status(400).json({ error: 'Diagram data is required' });
      }

      const prompt = `Analyze this workflow diagram and write a clear, executive summary for enterprise stakeholders:
Title: ${diagram.title || 'Untitled Diagram'}
Nodes: ${JSON.stringify(diagram.nodes?.map((n: any) => ({ label: n.label, type: n.type })) || [])}
Connections: ${JSON.stringify(diagram.connectors?.map((c: any) => ({ from: c.from, to: c.to, label: c.label })) || [])}

Provide:
1. Executive Process Summary
2. Step-by-Step Flow Explanation
3. Key Decision Gateways & Routing Logic
4. Identified Bottlenecks or Efficiency Recommendations`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      return res.json({ success: true, explanation: response.text });
    } catch (err: any) {
      console.error('AI Explain Error:', err);
      return res.status(500).json({
        error: 'Failed to explain workflow',
        details: err?.message || String(err),
      });
    }
  });

  // AI Workflow Validation Endpoint
  app.post('/api/ai/validate', async (req, res) => {
    try {
      const { diagram } = req.body;
      if (!diagram) {
        return res.status(400).json({ error: 'Diagram data is required' });
      }

      const prompt = `Perform an enterprise BPMN 2.0 & Flowchart audit on this workflow diagram:
Title: ${diagram.title || 'Untitled'}
Nodes: ${JSON.stringify(diagram.nodes || [])}
Connectors: ${JSON.stringify(diagram.connectors || [])}

Return a JSON object with:
{
  "score": 85,
  "status": "PASS | WARN | FAIL",
  "issues": [
    {
      "severity": "high | medium | low",
      "nodeId": "optional_id",
      "message": "Description of defect",
      "suggestion": "How to fix"
    }
  ],
  "bestPractices": ["Recommendation 1", "Recommendation 2"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      let text = response.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const report = JSON.parse(text);

      return res.json({ success: true, report });
    } catch (err: any) {
      console.error('AI Validate Error:', err);
      return res.status(500).json({
        error: 'Failed to validate workflow',
        details: err?.message || String(err),
      });
    }
  });

  // Vite middleware setup for dev vs production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
