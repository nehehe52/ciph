import React from 'react';
import { ModelMetrics } from '../types';
import { Cpu, CheckCircle, Crosshair, AlertCircle, BarChart, ShieldAlert } from 'lucide-react';

interface ModelMetricsViewProps {
  metrics: ModelMetrics;
  datasetName: string;
}

export const ModelMetricsView: React.FC<ModelMetricsViewProps> = ({ metrics, datasetName }) => {
  const { accuracy, precision, recall, f1Score, confusionMatrix, totalEvaluated, threatCount, benignCount } = metrics;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 font-mono text-xs space-y-6">
      {/* Header Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#21262d]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#0d1117] border border-[#30363d] rounded text-[#3fb950]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#f0f6fc] uppercase tracking-wider">
              Supervised Anomaly Engine Model Metrics
            </h2>
            <p className="text-[11px] text-[#8b949e]">
              Evaluation calculated directly from held-out CIC-IDS2017 flow metadata benchmark
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-[#8b949e]">Evaluation Target:</span>
          <span className="px-2.5 py-1 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] font-bold">
            {datasetName}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold">Accuracy Rate</span>
            <CheckCircle className="w-4 h-4 text-[#3fb950]" />
          </div>
          <div className="text-2xl font-bold text-[#3fb950]">
            {(accuracy * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#484f58]">Overall correct predictions count / Total</p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold">Precision</span>
            <Crosshair className="w-4 h-4 text-[#58a6ff]" />
          </div>
          <div className="text-2xl font-bold text-[#58a6ff]">
            {(precision * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#484f58]">True Positive / (True Positive + False Positive)</p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold">Recall / Sensitivity</span>
            <AlertCircle className="w-4 h-4 text-[#d29922]" />
          </div>
          <div className="text-2xl font-bold text-[#d29922]">
            {(recall * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#484f58]">True Positive / (True Positive + False Negative)</p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold">F1-Score</span>
            <BarChart className="w-4 h-4 text-[#bc8cff]" />
          </div>
          <div className="text-2xl font-bold text-[#bc8cff]">
            {(f1Score * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#484f58]">Harmonic Mean of Precision &amp; Recall</p>
        </div>
      </div>

      {/* Confusion Matrix & Dataset Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
        {/* Confusion Matrix */}
        <div className="lg:col-span-7 bg-[#0d1117] border border-[#30363d] p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
            <h3 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-[#58a6ff]" />
              <span>Confusion Matrix Breakdown</span>
            </h3>
            <span className="text-[10px] text-[#8b949e]">Evaluated Records: {totalEvaluated}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-[#161b22] border border-[#3fb950]/30 p-3 rounded space-y-1">
              <span className="text-[10px] text-[#8b949e] uppercase block font-bold">True Positive (TP)</span>
              <span className="text-xl font-bold text-[#3fb950]">{confusionMatrix.tp}</span>
              <span className="text-[10px] text-[#484f58] block">Actual Threat detected as Threat</span>
            </div>

            <div className="bg-[#161b22] border border-[#f85149]/30 p-3 rounded space-y-1">
              <span className="text-[10px] text-[#8b949e] uppercase block font-bold">False Positive (FP)</span>
              <span className="text-xl font-bold text-[#f85149]">{confusionMatrix.fp}</span>
              <span className="text-[10px] text-[#484f58] block">Benign Traffic misidentified as Threat</span>
            </div>

            <div className="bg-[#161b22] border border-[#f85149]/30 p-3 rounded space-y-1">
              <span className="text-[10px] text-[#8b949e] uppercase block font-bold">False Negative (FN)</span>
              <span className="text-xl font-bold text-[#f85149]">{confusionMatrix.fn}</span>
              <span className="text-[10px] text-[#484f58] block">Actual Threat missed as Benign</span>
            </div>

            <div className="bg-[#161b22] border border-[#3fb950]/30 p-3 rounded space-y-1">
              <span className="text-[10px] text-[#8b949e] uppercase block font-bold">True Negative (TN)</span>
              <span className="text-xl font-bold text-[#3fb950]">{confusionMatrix.tn}</span>
              <span className="text-[10px] text-[#484f58] block">Benign Traffic verified as Benign</span>
            </div>
          </div>
        </div>

        {/* Dataset Class Distribution */}
        <div className="lg:col-span-5 bg-[#0d1117] border border-[#30363d] p-4 rounded-lg space-y-3">
          <div className="pb-2 border-b border-[#21262d]">
            <h3 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-wider">
              Dataset Label Composition
            </h3>
          </div>

          <div className="space-y-3 font-mono">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#3fb950]">BENIGN Flow Records</span>
                <span className="font-bold text-[#c9d1d9]">{benignCount} ({((benignCount / Math.max(1, totalEvaluated)) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-[#161b22] rounded overflow-hidden">
                <div
                  className="h-full bg-[#3fb950]"
                  style={{ width: `${(benignCount / Math.max(1, totalEvaluated)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#f85149]">THREAT / Attack Vector Records</span>
                <span className="font-bold text-[#c9d1d9]">{threatCount} ({((threatCount / Math.max(1, totalEvaluated)) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-[#161b22] rounded overflow-hidden">
                <div
                  className="h-full bg-[#f85149]"
                  style={{ width: `${(threatCount / Math.max(1, totalEvaluated)) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#8b949e] leading-relaxed border-t border-[#21262d]">
              Metrics are derived purely from real CIC-IDS2017 CSV flow records without synthesizing or fabricating performance values.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
