import React from 'react';
import { ModelMetrics } from '../types';
import { Cpu, CheckCircle, Crosshair, AlertCircle, BarChart, ShieldAlert, Database, ArrowRight, Activity, Terminal } from 'lucide-react';

interface ModelMetricsViewProps {
  metrics: ModelMetrics;
  datasetName: string;
  onSelectBenchmarkDataset?: (datasetFileName: string) => void;
}

const BENCHMARK_DATASETS = [
  {
    fileName: 'Monday-WorkingHours.pcap_ISCX.csv',
    title: 'Monday Working Hours (Normal Traffic)',
    description: 'Baseline benign TLS/HTTP encrypted traffic dataset from CIC-IDS2017.',
    attacks: 'BENIGN Baseline',
    recordsCount: '5 flows',
    tag: '[BENCHMARK_01]'
  },
  {
    fileName: 'Wednesday-workingHours.pcap_ISCX.csv',
    title: 'Wednesday Working Hours (DoS / Attacks)',
    description: 'Includes DoS Slowloris, Heartbleed, and Botnet network traffic vectors.',
    attacks: 'DoS Slowloris, Bot',
    recordsCount: '3 flows',
    tag: '[BENCHMARK_02]'
  },
];

export const ModelMetricsView: React.FC<ModelMetricsViewProps> = ({
  metrics,
  datasetName,
  onSelectBenchmarkDataset,
}) => {
  const { accuracy, precision, recall, f1Score, confusionMatrix, totalEvaluated, threatCount, benignCount } = metrics;

  return (
    <div className="flex flex-col space-y-6 bg-[#0B0F19] border border-[#30363d] rounded p-5 font-mono text-xs shadow-2xl cyber-grid-bg">
      {/* Top SOC Console Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#0d1117] border border-[#00ff66]/30 rounded text-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.15)] flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] led-green inline-block"></span>
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-[#00ff66] bg-[#00ff66]/10 px-1.5 py-0.5 border border-[#00ff66]/30 rounded font-bold uppercase">
                [SYS.OK]
              </span>
              <span className="text-[10px] text-[#8b949e] uppercase tracking-wider">
                [EVAL_ENGINE_v2.4]
              </span>
            </div>
            <h2 className="font-bold text-sm text-[#f0f6fc] uppercase tracking-widest mt-1">
              SUPERVISED_ANOMALY_ENGINE_METRICS
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-[#0d1117] border border-[#30363d] px-3 py-1.5 rounded">
          <span className="text-[#8b949e] text-[11px] uppercase">[ACTIVE_DATASET]:</span>
          <span className="px-2 py-0.5 bg-[#161b22] border border-[#00e5ff]/40 rounded text-[#00e5ff] font-bold">
            {datasetName}
          </span>
        </div>
      </div>

      {/* Benchmark Dataset Selection Panel */}
      <div className="flex flex-col space-y-3 bg-[#0d1117] border border-[#30363d] p-4 rounded relative">
        <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#00e5ff]" />
            <h3 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-wider">
              [STANDARD_BENCHMARK_SUITE]
            </h3>
          </div>
          <span className="text-[10px] text-[#8b949e] font-mono">
            [CIC-IDS2017_HELD_OUT_VALIDATION]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {BENCHMARK_DATASETS.map((ds) => {
            const isSelected = datasetName === ds.fileName;

            return (
              <div
                key={ds.fileName}
                className={`p-3 bg-[#161b22] border rounded flex flex-col justify-between space-y-3 transition-all duration-200 ${
                  isSelected
                    ? 'border-[#00e5ff] bg-[#161b22] shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                    : 'border-[#21262d] hover:border-[#00e5ff]/40 hover:bg-[#1c2128]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#8b949e] font-bold">{ds.tag}</span>
                    {isSelected ? (
                      <span className="text-[10px] bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/40 px-2 py-0.5 rounded font-bold uppercase flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] led-cyan inline-block"></span>
                        <span>[LOADED]</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#484f58] uppercase">[STANDBY]</span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-[#f0f6fc]">{ds.title}</h4>
                  <p className="text-[11px] text-[#8b949e] mt-1 leading-snug">{ds.description}</p>
                </div>

                <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#8b949e]">Vectors:</span>
                    <span className="text-[#ffb000] font-bold px-1.5 py-0.5 bg-[#0d1117] border border-[#ffb000]/30 rounded">
                      {ds.attacks}
                    </span>
                  </div>

                  {onSelectBenchmarkDataset && (
                    <button
                      type="button"
                      onClick={() => onSelectBenchmarkDataset(ds.fileName)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#21262d] text-[#8b949e] cursor-default border border-[#30363d]'
                          : 'bg-[#0d1117] hover:bg-[#21262d] border border-[#00e5ff]/50 text-[#00e5ff] hover:text-[#f0f6fc] hover:border-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                      }`}
                    >
                      <span>{isSelected ? '[ Active Dataset ]' : '[ Select Dataset ]'}</span>
                      {!isSelected && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Analytical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded space-y-2 relative overflow-hidden group hover:border-[#00ff66]/40 transition-all">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00ff66] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full led-green inline-block"></span>
              <span>[ ACCURACY_RATE ]</span>
            </span>
            <CheckCircle className="w-4 h-4 text-[#00ff66]" />
          </div>
          <div className="text-3xl font-bold text-[#00ff66] drop-shadow-[0_0_8px_rgba(0,255,102,0.3)]">
            {(accuracy * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#8b949e] border-t border-[#21262d] pt-1.5">
            Overall correct predictions / Total evaluated records
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded space-y-2 relative overflow-hidden group hover:border-[#00e5ff]/40 transition-all">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00e5ff] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full led-cyan inline-block"></span>
              <span>[ PRECISION ]</span>
            </span>
            <Crosshair className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div className="text-3xl font-bold text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">
            {(precision * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#8b949e] border-t border-[#21262d] pt-1.5">
            True Positive / (True Positive + False Positive)
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded space-y-2 relative overflow-hidden group hover:border-[#ffb000]/40 transition-all">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#ffb000] flex items-center space-x-1">
              <Activity className="w-3 h-3 text-[#ffb000]" />
              <span>[ RECALL ]</span>
            </span>
            <AlertCircle className="w-4 h-4 text-[#ffb000]" />
          </div>
          <div className="text-3xl font-bold text-[#ffb000]">
            {(recall * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#8b949e] border-t border-[#21262d] pt-1.5">
            True Positive / (True Positive + False Negative)
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded space-y-2 relative overflow-hidden group hover:border-[#b800ff]/40 transition-all">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#b800ff] flex items-center space-x-1">
              <Terminal className="w-3 h-3 text-[#b800ff]" />
              <span>[ F1_SCORE ]</span>
            </span>
            <BarChart className="w-4 h-4 text-[#b800ff]" />
          </div>
          <div className="text-3xl font-bold text-[#b800ff]">
            {(f1Score * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#8b949e] border-t border-[#21262d] pt-1.5">
            Harmonic Mean of Precision &amp; Recall
          </p>
        </div>
      </div>

      {/* Confusion Matrix & Dataset Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Confusion Matrix Section */}
        <div className="lg:col-span-7 bg-[#0d1117] border border-[#30363d] p-4 rounded space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
            <h3 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#00e5ff]" />
              <span>[CONFUSION_MATRIX_BREAKDOWN]</span>
            </h3>
            <span className="text-[10px] bg-[#161b22] px-2 py-0.5 rounded border border-[#30363d] text-[#8b949e]">
              Evaluated: {totalEvaluated}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#161b22] border border-[#00ff66]/30 p-3 rounded space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#00ff66] font-bold uppercase">[TP] TRUE POSITIVE</span>
                <span className="w-2 h-2 rounded-full bg-[#00ff66] led-green inline-block"></span>
              </div>
              <span className="text-2xl font-bold text-[#00ff66] block">{confusionMatrix.tp}</span>
              <span className="text-[10px] text-[#8b949e] block">Threat identified correctly</span>
            </div>

            <div className="bg-[#161b22] border border-[#ff3344]/30 p-3 rounded space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#ff3344] font-bold uppercase">[FP] FALSE POSITIVE</span>
                <span className="w-2 h-2 rounded-full bg-[#ff3344] led-red inline-block"></span>
              </div>
              <span className="text-2xl font-bold text-[#ff3344] block">{confusionMatrix.fp}</span>
              <span className="text-[10px] text-[#8b949e] block">Benign misclassified as Threat</span>
            </div>

            <div className="bg-[#161b22] border border-[#ff3344]/30 p-3 rounded space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#ff3344] font-bold uppercase">[FN] FALSE NEGATIVE</span>
                <span className="w-2 h-2 rounded-full bg-[#ff3344] led-red inline-block"></span>
              </div>
              <span className="text-2xl font-bold text-[#ff3344] block">{confusionMatrix.fn}</span>
              <span className="text-[10px] text-[#8b949e] block">Threat missed as Benign</span>
            </div>

            <div className="bg-[#161b22] border border-[#00ff66]/30 p-3 rounded space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#00ff66] font-bold uppercase">[TN] TRUE NEGATIVE</span>
                <span className="w-2 h-2 rounded-full bg-[#00ff66] led-green inline-block"></span>
              </div>
              <span className="text-2xl font-bold text-[#00ff66] block">{confusionMatrix.tn}</span>
              <span className="text-[10px] text-[#8b949e] block">Benign verified correctly</span>
            </div>
          </div>
        </div>

        {/* Dataset Label Composition */}
        <div className="lg:col-span-5 bg-[#0d1117] border border-[#30363d] p-4 rounded space-y-3">
          <div className="pb-2 border-b border-[#21262d]">
            <h3 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-wider">
              [LABEL_DISTRIBUTION]
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-[#00ff66] font-bold">[BENIGN] Normal Flows</span>
                <span className="font-bold text-[#f0f6fc]">
                  {benignCount} ({((benignCount / Math.max(1, totalEvaluated)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#161b22] rounded border border-[#30363d] overflow-hidden">
                <div
                  className="h-full bg-[#00ff66]"
                  style={{ width: `${(benignCount / Math.max(1, totalEvaluated)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-[#ff3344] font-bold">[THREAT] Attack Vectors</span>
                <span className="font-bold text-[#f0f6fc]">
                  {threatCount} ({((threatCount / Math.max(1, totalEvaluated)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#161b22] rounded border border-[#30363d] overflow-hidden">
                <div
                  className="h-full bg-[#ff3344]"
                  style={{ width: `${(threatCount / Math.max(1, totalEvaluated)) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-[10px] text-[#8b949e] leading-relaxed border-t border-[#21262d] font-mono">
              [NOTE]: Evaluated metrics are produced using supervised heuristic flow-feature vectors extracted directly from official dataset records.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
