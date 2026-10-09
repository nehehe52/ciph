import React from 'react';
import { NetworkFlow, AnomalyPrediction, Severity } from '../types';
import { AlertTriangle, ShieldCheck, Terminal, Cpu, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

interface ThreatPanelProps {
  flow: NetworkFlow | null;
  prediction: AnomalyPrediction | undefined;
  onClose?: () => void;
}

export const ThreatPanel: React.FC<ThreatPanelProps> = ({ flow, prediction, onClose }) => {
  if (!flow) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex flex-col items-center justify-center text-center text-[#8b949e] font-mono min-h-[380px]">
        <Terminal className="w-10 h-10 text-[#484f58] mb-3 animate-pulse" />
        <p className="text-sm font-semibold text-[#c9d1d9]">No Flow Telemetry Selected</p>
        <p className="text-xs text-[#8b949e] max-w-xs mt-1">
          Select any connection line, host node, or threat event row to inspect feature vectors and SOC analyst defensive recommendations.
        </p>
      </div>
    );
  }

  const isThreat = prediction ? prediction.isAnomaly : flow.label !== 'BENIGN';
  const severity: Severity = prediction ? prediction.severity : (isThreat ? 'HIGH' : 'INFO');

  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'HIGH':
        return 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/30';
      case 'MEDIUM':
        return 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/30';
      case 'LOW':
        return 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/30';
      default:
        return 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/30';
    }
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 font-mono text-xs space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
        <div className="flex items-center space-x-2">
          {isThreat ? (
            <AlertTriangle className="w-5 h-5 text-[#f85149]" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-[#3fb950]" />
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-[#f0f6fc]">Flow Telemetry Inspector</h3>
              <span className={`px-2 py-0.5 text-[10px] rounded border uppercase font-bold ${getSeverityBadgeClass(severity)}`}>
                {severity}
              </span>
            </div>
            <p className="text-[11px] text-[#8b949e]">ID: {flow.id}</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#f0f6fc] text-xs px-2 py-1 bg-[#21262d] border border-[#30363d] rounded"
          >
            Close
          </button>
        )}
      </div>

      {/* Ground Truth vs Prediction Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#0d1117] p-3 rounded border border-[#21262d]">
        <div className="space-y-1">
          <span className="text-[10px] text-[#484f58] uppercase font-bold flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-[#58a6ff]" />
            <span>Model Prediction Result</span>
          </span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-bold ${isThreat ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>
              {prediction ? prediction.predictedClass : (isThreat ? 'Anomalous Traffic' : 'BENIGN')}
            </span>
            {prediction && (
              <span className="text-[10px] text-[#8b949e] bg-[#21262d] px-1.5 py-0.5 rounded border border-[#30363d]">
                Score: {(prediction.score * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#21262d] pt-2 md:pt-0 md:pl-3">
          <span className="text-[10px] text-[#484f58] uppercase font-bold flex items-center space-x-1">
            <FileText className="w-3 h-3 text-[#3fb950]" />
            <span>CIC-IDS2017 Dataset Label</span>
          </span>
          <div className="text-sm font-bold text-[#f0f6fc]">
            {flow.label}
          </div>
        </div>
      </div>

      {/* Connection Pair */}
      <div className="bg-[#0d1117] p-3 rounded border border-[#21262d] space-y-2">
        <span className="text-[10px] text-[#484f58] uppercase font-bold">IP Endpoint &amp; Protocol Vector</span>
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="bg-[#161b22] px-2.5 py-1.5 rounded border border-[#30363d] text-[#c9d1d9]">
            <span className="text-[#8b949e] text-[10px] block">SRC:</span>
            <span>{flow.sourceIP}:{flow.sourcePort}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#58a6ff]" />
          <div className="bg-[#161b22] px-2.5 py-1.5 rounded border border-[#30363d] text-[#c9d1d9]">
            <span className="text-[#8b949e] text-[10px] block">DST:</span>
            <span>{flow.destinationIP}:{flow.destinationPort}</span>
          </div>
          <div className="bg-[#21262d] px-3 py-1.5 rounded border border-[#30363d] text-[#58a6ff]">
            <span className="text-[#8b949e] text-[10px] block">PROTO:</span>
            <span>{flow.protocol}</span>
          </div>
        </div>
      </div>

      {/* Raw Feature Vector Table */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-[#8b949e] uppercase font-bold">Flow Feature Metrics</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="bg-[#0d1117] p-2 rounded border border-[#21262d]">
            <span className="text-[#484f58] block text-[10px]">Flow Duration</span>
            <span className="text-[#f0f6fc] font-semibold">{(flow.flowDuration / 1000).toFixed(2)} ms</span>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#21262d]">
            <span className="text-[#484f58] block text-[10px]">Fwd / Bwd Packets</span>
            <span className="text-[#f0f6fc] font-semibold">{flow.totalFwdPackets} / {flow.totalBwdPackets}</span>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#21262d]">
            <span className="text-[#484f58] block text-[10px]">Fwd / Bwd Bytes</span>
            <span className="text-[#f0f6fc] font-semibold">{flow.totalFwdBytes} / {flow.totalBwdBytes} B</span>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#21262d]">
            <span className="text-[#484f58] block text-[10px]">Flow Packets/s</span>
            <span className="text-[#f0f6fc] font-semibold">{flow.flowPacketsPerSec.toFixed(1)}</span>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#21262d]">
            <span className="text-[#484f58] block text-[10px]">Flow Bytes/s</span>
            <span className="text-[#f0f6fc] font-semibold">{flow.flowBytesPerSec.toFixed(1)}</span>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#21262d]">
            <span className="text-[#484f58] block text-[10px]">Flags (SYN / ACK / RST)</span>
            <span className="text-[#f0f6fc] font-semibold">{flow.synFlagCount} / {flow.ackFlagCount} / {flow.rstFlagCount}</span>
          </div>
        </div>
      </div>

      {/* Detection Signatures & Defensive Action */}
      <div className="space-y-2 pt-2 border-t border-[#21262d]">
        {prediction && prediction.reasons.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] text-[#8b949e] uppercase font-bold">Detected Feature Signatures</span>
            <ul className="space-y-1">
              {prediction.reasons.map((r, i) => (
                <li key={i} className="flex items-start space-x-1.5 text-[11px] text-[#c9d1d9]">
                  <span className="text-[#58a6ff] font-bold">&bull;</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-[#21262d] border border-[#30363d] p-3 rounded space-y-1">
          <span className="text-[10px] text-[#d29922] uppercase font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SOC Analyst Defensive Recommendation</span>
          </span>
          <p className="text-xs text-[#f0f6fc] leading-relaxed">
            {prediction ? prediction.recommendation : 'Review firewall logs for byte bursts and establish updated baseline parameters.'}
          </p>
        </div>
      </div>
    </div>
  );
};
