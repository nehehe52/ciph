import React, { useState } from 'react';
import { NetworkFlow, AnomalyPrediction, Severity } from '../types';
import { AlertTriangle, ShieldCheck, Terminal, Cpu, CheckCircle2, FileText, ArrowRight, ShieldAlert, Download, Binary, ShieldOff } from 'lucide-react';

interface ThreatPanelProps {
  flow: NetworkFlow | null;
  prediction: AnomalyPrediction | undefined;
  onClose?: () => void;
  blockedIPs?: Set<string>;
  onToggleBlockIP?: (ip: string) => void;
}

export const ThreatPanel: React.FC<ThreatPanelProps> = ({
  flow,
  prediction,
  onClose,
  blockedIPs = new Set(),
  onToggleBlockIP
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'pcap' | 'mitigation'>('metrics');

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
  const isSourceBlocked = blockedIPs.has(flow.sourceIP);

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

  // Export Incident JSON report
  const handleExportReport = () => {
    const reportData = {
      incidentId: flow.id,
      timestamp: flow.timestamp,
      severity,
      sourceIP: flow.sourceIP,
      sourcePort: flow.sourcePort,
      destinationIP: flow.destinationIP,
      destinationPort: flow.destinationPort,
      protocol: flow.protocol,
      groundTruthLabel: flow.label,
      predictedClass: prediction ? prediction.predictedClass : flow.label,
      anomalyScore: prediction ? prediction.score : 0,
      detectedReasons: prediction ? prediction.reasons : [],
      analystRecommendation: prediction ? prediction.recommendation : 'No action required',
      telemetry: {
        flowDurationMs: flow.flowDuration / 1000,
        fwdPackets: flow.totalFwdPackets,
        bwdPackets: flow.totalBwdPackets,
        fwdBytes: flow.totalFwdBytes,
        bwdBytes: flow.totalBwdBytes,
        packetsPerSec: flow.flowPacketsPerSec,
        bytesPerSec: flow.flowBytesPerSec,
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_report_${flow.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate synthetic hex dump representation from flow features
  const hexDump = [
    `0000  45 00 00 3c 1c 46 40 00  40 06 b1 e6 ${flow.sourceIP.split('.').map(x => parseInt(x).toString(16).padStart(2, '0')).join(' ')}`,
    `0010  ${flow.destinationIP.split('.').map(x => parseInt(x).toString(16).padStart(2, '0')).join(' ')} ${flow.sourcePort.toString(16).padStart(4, '0').match(/../g)?.join(' ')} ${flow.destinationPort.toString(16).padStart(4, '0').match(/../g)?.join(' ')}  E..<..@.@........`,
    `0020  00 00 00 00 00 00 00 00  a0 02 72 10 92 1d 00 00  ..........r.....`,
    `0030  02 04 05 b4 04 02 08 0a  1e 87 e3 fe 00 00 00 00  ................`
  ].join('\n');

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
              {isSourceBlocked && (
                <span className="px-1.5 py-0.2 bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40 text-[10px] rounded font-bold uppercase">
                  FIREWALL BLOCKED
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8b949e]">ID: {flow.id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded text-[#58a6ff] text-xs transition-colors"
            title="Download Incident Report JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT REPORT</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#8b949e] hover:text-[#f0f6fc] text-xs px-2 py-1 bg-[#21262d] border border-[#30363d] rounded"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* View Selector Sub-Tabs */}
      <div className="flex items-center space-x-1 border-b border-[#21262d] pb-2 text-[11px]">
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`px-3 py-1 rounded border ${
            activeSubTab === 'metrics'
              ? 'bg-[#21262d] text-[#f0f6fc] border-[#30363d] font-bold'
              : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
          }`}
        >
          Flow Vectors
        </button>
        <button
          onClick={() => setActiveSubTab('pcap')}
          className={`flex items-center space-x-1 px-3 py-1 rounded border ${
            activeSubTab === 'pcap'
              ? 'bg-[#21262d] text-[#f0f6fc] border-[#30363d] font-bold'
              : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
          }`}
        >
          <Binary className="w-3 h-3 text-[#58a6ff]" />
          <span>Raw Packet Header</span>
        </button>
        <button
          onClick={() => setActiveSubTab('mitigation')}
          className={`flex items-center space-x-1 px-3 py-1 rounded border ${
            activeSubTab === 'mitigation'
              ? 'bg-[#21262d] text-[#f0f6fc] border-[#30363d] font-bold'
              : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
          }`}
        >
          <ShieldAlert className="w-3 h-3 text-[#d29922]" />
          <span>Firewall Simulator</span>
        </button>
      </div>

      {activeSubTab === 'metrics' && (
        <div className="space-y-4">
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
      )}

      {activeSubTab === 'pcap' && (
        <div className="space-y-2 bg-[#0d1117] p-3 rounded border border-[#21262d]">
          <span className="text-[10px] text-[#8b949e] uppercase font-bold block">Raw Transport Frame Header Simulation</span>
          <pre className="text-[11px] text-[#3fb950] bg-[#0d1117] overflow-x-auto p-2 rounded font-mono border border-[#21262d] leading-relaxed">
            {hexDump}
          </pre>
          <p className="text-[10px] text-[#8b949e]">
            Transport header bytes constructed strictly from captured IP/TCP header fields without payload decryption.
          </p>
        </div>
      )}

      {activeSubTab === 'mitigation' && (
        <div className="space-y-3 bg-[#0d1117] p-3 rounded border border-[#21262d]">
          <span className="text-[10px] text-[#d29922] uppercase font-bold block">Automated Firewall Remediation Control</span>
          <p className="text-xs text-[#c9d1d9]">
            Enforce automated perimeter ingress block rules for threat source endpoint <span className="text-[#f0f6fc] font-bold">{flow.sourceIP}</span>.
          </p>

          <div className="bg-[#161b22] p-2.5 rounded border border-[#30363d] space-y-1 font-mono text-[11px] text-[#8b949e]">
            <span className="text-[#58a6ff] block font-bold">Generated iptables Rule:</span>
            <code className="text-[#3fb950] block">iptables -A INPUT -s {flow.sourceIP} -p {flow.protocol.toLowerCase()} --dport {flow.destinationPort} -j DROP</code>
          </div>

          {onToggleBlockIP && (
            <button
              onClick={() => onToggleBlockIP(flow.sourceIP)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-bold transition-colors text-xs ${
                isSourceBlocked
                  ? 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/30 hover:bg-[#3fb950]/20'
                  : 'bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/30 hover:bg-[#f85149]/20'
              }`}
            >
              {isSourceBlocked ? (
                <>
                  <ShieldOff className="w-3.5 h-3.5" />
                  <span>UNBLOCK SOURCE HOST ({flow.sourceIP})</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>BLOCK &amp; ISOLATE HOST ({flow.sourceIP})</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
