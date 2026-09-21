import React, { useState } from 'react';
import { BrainCircuit, Sparkles, X, Check, BarChart2, Cpu } from 'lucide-react';
import { AIAnalysisResult } from '../types';

interface AiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiInspectorModal: React.FC<AiInspectorModalProps> = ({ isOpen, onClose }) => {
  const [testText, setTestText] = useState(
    'Two people are injured in a road accident. One person appears unconscious and immediate help is required.'
  );
  const [affectedCount, setAffectedCount] = useState(2);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testText, affectedCount })
      });
      const data = await res.json();
      setResult(data.prediction);
    } catch (err: any) {
      alert(`AI Analysis error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <BrainCircuit className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI / ML Triage &amp; NLP Inspector</h2>
              <p className="text-xs text-indigo-200">B.Tech Major Project Demonstration Testing Lab</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Select Sample Viva Test Cases:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setTestText('Two people are injured in a road accident. One person appears unconscious and immediate help is required.');
                  setAffectedCount(2);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-800 border border-slate-200"
              >
                🚗 Road Accident (Viva Spec)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestText('Huge fire broke out in chemical factory warehouse, thick black toxic smoke billowing.');
                  setAffectedCount(5);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-800 border border-slate-200"
              >
                🔥 Factory Fire (Critical)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestText('Elderly man experiencing severe chest pain and breathlessness, suspected cardiac arrest.');
                  setAffectedCount(1);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-800 border border-slate-200"
              >
                ❤️ Cardiac Arrest
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestText('River water overflowed banks, entire residential colony submerged in 4 feet water.');
                  setAffectedCount(8);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-800 border border-slate-200"
              >
                🌊 Flood Submersion
              </button>
            </div>
          </div>

          {/* Test Input Area */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Enter Emergency Description to Classify:
            </label>
            <textarea
              rows={3}
              value={testText}
              onChange={e => setTestText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Affected People:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={affectedCount}
                onChange={e => setAffectedCount(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded border border-slate-300 text-center font-bold"
              />
            </div>

            <button
              id="btn-run-ai-analysis"
              disabled={isAnalyzing}
              onClick={handleRunAnalysis}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Computing TF-IDF Vectors...' : 'Analyze with TF-IDF + ML Model'}
            </button>
          </div>

          {/* RESULTS DISPLAY */}
          {result && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Predicted Category</span>
                  <span className="text-sm font-extrabold text-indigo-700">{result.category}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Priority</span>
                  <span
                    className={`text-sm font-extrabold ${
                      result.priority === 'CRITICAL'
                        ? 'text-red-600'
                        : result.priority === 'HIGH'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {result.priority}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Model Confidence</span>
                  <span className="text-sm font-extrabold text-emerald-600">{result.confidence}%</span>
                </div>
              </div>

              {/* Explanatory text */}
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Explainability Vector:</span>
                <p className="text-xs text-slate-700 font-medium">{result.explanation}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {result.keywords.map(kw => (
                    <span key={kw} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-mono text-[10px]">
                      TF-IDF: {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Probability Distribution Chart */}
              {result.categoryProbabilities && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                    Multinomial Naive Bayes Posterior Distribution P(Category | Text):
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {Object.entries(result.categoryProbabilities).map(([cat, prob]) => (
                      <div key={cat} className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-semibold text-slate-700">{cat}</span>
                          <span className="font-mono text-slate-500">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cat === result.category ? 'bg-indigo-600' : 'bg-slate-300'
                            }`}
                            style={{ width: `${Math.max(prob * 100, 2)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Specifications */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 font-mono">
                Model: {result.model} &bull; Laplace Smoothing α=1.0 &bull; N-Grams: Unigram + Bigram &bull; Smooth IDF
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-800"
          >
            Close Testing Lab
          </button>
        </div>

      </div>
    </div>
  );
};
