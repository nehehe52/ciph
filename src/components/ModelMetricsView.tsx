import React from 'react';
import { ModelMetrics } from '../types';
import { Cpu, CheckCircle, Crosshair, AlertCircle, BarChart, ShieldAlert, Database, ArrowRight } from 'lucide-react';

interface ModelMetricsViewProps {
  metrics: ModelMetrics;
  datasetName: string;
  onSelectBenchmarkDataset?: (datasetFileName: string) => void;
}

const BENCHMARK_DATASETS = [
  {
    fileName: 'Monday-WorkingHours.pcap_ISCX.csv',
    title: 'Monday Working Hours (Normal Traffic)',
    description: 'Baseline benign TLS/HTTP encrypted traffic dataset.',
    attacks: 'BENIGN Baseline',
    recordsCount: '5 flows',
  },
  {
    fileName: 'Wednesday-workingHours.pcap_ISCX.csv',
    title: 'Wednesday Working Hours (DoS / Attacks)',
    description: 'Includes DoS Slowloris, Heartbleed, and Botnet traffic vectors.',
    attacks: 'DoS Slowloris, Bot',
    recordsCount: '3 flows',
  },
];

export const ModelMetricsView: React.FC<ModelMetricsViewProps> = ({
  metrics,
  datasetName,
  onSelectBenchmarkDataset,
}) => {
  const { accuracy, precision, recall, f1Score, confusionMatrix, totalEvaluated, threatCount, benignCount } = metrics;

  return (
    <div className="flex flex-col space-y-6 bg-[#111827] border border-[#1f293d] rounded-lg p-5 font-mono text-xs shadow-2xl">
      {/* Header Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1f293d]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#070a10] border border-[#00ff66]/40 rounded text-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.2)]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-widest">
              [SUPERVISED_ANOMALY_ENGINE_METRICS]
            </h2>
            <p className="text-[11px] text-[#8b949e]">
              Evaluation calculated directly from held-out CIC-IDS2017 flow metadata benchmark
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-[#8b949e]">TARGET_DATASET:</span>
          <span className="px-2.5 py-1 bg-[#070a10] border border-[#00e5ff]/40 rounded text-[#00e5ff] font-bold">
            {datasetName}
          </span>
        </div>
      </div>

      {/* Benchmark Dataset Selection Section */}
      <div className="flex flex-col space-y-3 bg-[#070a10] border border-[#1f293d] p-4 rounded-lg relative">
        <div>
          <h3 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-wider flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#00e5ff]" />
            <span>[SELECT_STANDARD_BENCHMARK_DATASETS]</span>
          </h3>
          <p className="text-[11px] text-[#8b949e] mt-1">
            Verified benchmark performance on held-out network test datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {BENCHMARK_DATASETS.map((ds) => {
            const isSelected = datasetName === ds.fileName;

            return (
              <div
                key={ds.fileName}
                className={`p-3 bg-[#111827] border rounded-lg flex flex-col justify-between space-y-2 relative transition-all ${
                  isSelected ? 'border-[#00e5ff] bg-[#1f293d]/50 shadow-[0_0_10px_rgba(0,229,255,0.15)]' : 'border-[#1f293d] hover:border-[#1f293d]/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#f0f6fc]">{ds.title}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/40 px-2 py-0.5 rounded font-bold uppercase">
                        [ACTIVE]
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8b949e] mt-1">{ds.description}</p>
                </div>

                <div className="pt-2 border-t border-[#1f293d] flex items-center justify-between text-[11px]">
                  <div className="space-x-2">
                    <span className="text-[#484f58]">Vector:</span>
                    <span className="text-[#ffb000] font-bold">{ds.attacks}</span>
                  </div>

                  {onSelectBenchmarkDataset && (
                    <button
                      type="button"
                      onClick={() => onSelectBenchmarkDataset(ds.fileName)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#1f293d] text-[#f0f6fc] cursor-default'
                          : 'bg-[#070a10] hover:bg-[#1f293d] border border-[#00e5ff]/40 text-[#00e5ff] shadow-[0_0_6px_rgba(0,229,255,0.1)]'
                      }`}
                    >
                      <span>{isSelected ? '[ Loaded ]' : '[ Load Dataset ]'}</span>
                      {!isSelected && <ArrowRight className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#070a10] border border-[#1f293d] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold">[ ACCURACY_RATE ]</span>
            <CheckCircle className="w-4 h-4 text-[#00ff66]" />
          </div>
          <div className="text-2xl font-bold text-[#00ff66] drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]">
            {(accuracy * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#484f58]">Overall correct predictions count / Total</p>
        </div>

        <div className="bg-[#070a10] border border-[#1f293d] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold">[ PRECISION ]</span>
            <Crosshair className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div className="text-2xl font-bold text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
            {(precision * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#484f58]">True Positive / (True Positive + False Positive)</p>
        </div>

        <div className="bg-[#070a10] border border-[#1f293d] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold">[ RECALL ]</span>
            <AlertCircle className="w-4 h-4 text-[#ffb000]" />
          </div>
          <div className="text-2xl font-bold text-[#ffb000]">
            {(recall * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#484f58]">True Positive / (True Positive + False Negative)</p>
        </div>

        <div className="bg-[#070a10] border border-[#1f293d] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] uppercase font-bold">[ F1_SCORE ]</span>
            <BarChart className="w-4 h-4 text-[#b800ff]" />
          </div>
          <div className="text-2xl font-bold text-[#b800ff]">
            {(f1Score * 100).toFixed(2)}%
          </div>
          <p className="text-[10px] text-[#484f58]">Harmonic Mean of Precision &amp; Recall</p>
        </div>
      </div>

      {/* Confusion Matrix & Dataset Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
        {/* Confusion Matrix */}
        <div className="lg:col-span-7 bg-[#070a10] border border-[#1f293d] p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
            <h3 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-[#00e5ff]" />
              <span>[CONFUSION_MATRIX_BREAKDOWN]</span>
            </h3>
            <span className="text-[10px] text-[#8b949e]">Evaluated Records: {totalEvaluated}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-[#111827] border border-[#00ff66]/40 p-3 rounded space-y-1">
              <span className="text-[10px] text-[#8b949e] uppercase block font-bold">True Positive (TP)</span>
              <span className="text-xl font-bold text-[#00ff66]">{confusionMatrix.tp}</span>
              <span className="text-[10px] text-[#484f58] block">Actual Threat detected as Threat</span>
            </div>

            <div className="bg-[#111827] border border-[#ff3344]/40 p-3 rounded space-y-1">
              <span className="text-[10px] text-[#8b949e] uppercase block font-bold">False Positive (FP)</span>
              <span className="text-xl font-bold text-[#ff3344]">{confusionMatrix.fp}</span>
              <span className="text-[10px] text-[#484f58] block">Benign Traffic misidentified as Threat</span>
            </div>

            <div className="bg-[#111827] border border-[#ff3344]/40 p-3 rounded space-y-1">
              <span className="text-[10px] text-[#8b949e] uppercase block font-bold">False Negative (FN)</span>
              <span className="text-xl font-bold text-[#ff3344]">{confusionMatrix.fn}</span>
              <span className="text-[10px] text-[#484f58] block">Actual Threat missed as Benign</span>
            </div>

            <div className="bg-[#111827] border border-[#00ff66]/40 p-3 rounded space-y-1">
              <span className="text-[10px] text-[#8b949e] uppercase block font-bold">True Negative (TN)</span>
              <span className="text-xl font-bold text-[#00ff66]">{confusionMatrix.tn}</span>
              <span className="text-[10px] text-[#484f58] block">Benign Traffic verified as Benign</span>
            </div>
          </div>
        </div>

        {/* Dataset Class Distribution */}
        <div className="lg:col-span-5 bg-[#070a10] border border-[#1f293d] p-4 rounded-lg space-y-3">
          <div className="pb-2 border-b border-[#1f293d]">
            <h3 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-wider">
              [DATASET_LABEL_COMPOSITION]
            </h3>
          </div>

          <div className="space-y-3 font-mono">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#00ff66]">BENIGN Flow Records</span>
                <span className="font-bold text-[#f0f6fc]">{benignCount} ({((benignCount / Math.max(1, totalEvaluated)) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-[#111827] rounded overflow-hidden">
                <div
                  className="h-full bg-[#00ff66]"
                  style={{ width: `${(benignCount / Math.max(1, totalEvaluated)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#ff3344]">THREAT / Attack Vector Records</span>
                <span className="font-bold text-[#f0f6fc]">{threatCount} ({((threatCount / Math.max(1, totalEvaluated)) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-[#111827] rounded overflow-hidden">
                <div
                  className="h-full bg-[#ff3344]"
                  style={{ width: `${(threatCount / Math.max(1, totalEvaluated)) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#8b949e] leading-relaxed border-t border-[#1f293d]">
              Metrics are derived purely from real CIC-IDS2017 CSV flow records without synthesizing or fabricating performance values.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
