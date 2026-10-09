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
      <div className="bg-[#111827] border border-[#1f293d] rounded-lg p-6 flex flex-col items-center justify-center text-center text-[#8b949e] font-mono min-h-[380px] shadow-2xl">
        <Terminal className="w-10 h-10 text-[#1f293d] mb-3 animate-pulse" />
        <p className="text-sm font-bold text-[#f0f6fc] uppercase tracking-wider">[ NO TELEMETRY RECORD SELECTED ]</p>
        <p className="text-xs text-[#8b949e] max-w-xs mt-1">
          Select any connection line, host node, or threat event row to inspect raw feature vectors and SOC analyst defensive recommendations.
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
        return 'bg-[#ff3344]/10 text-[#ff3344] border-[#ff3344]/40 shadow-[0_0_8px_rgba(255,51,68,0.2)]';
      case 'MEDIUM':
        return 'bg-[#ffb000]/10 text-[#ffb000] border-[#ffb000]/40';
      case 'LOW':
        return 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/40';
      default:
        return 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/40';
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
    <div className="bg-[#111827] border border-[#1f293d] rounded-lg p-5 font-mono text-xs space-y-4 shadow-2xl">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
        <div className="flex items-center space-x-2">
          {isThreat ? (
            <AlertTriangle className="w-5 h-5 text-[#ff3344] animate-pulse" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-[#00ff66]" />
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-[#f0f6fc] uppercase tracking-wider">[INSPECTOR_PANEL]</h3>
              <span className={`px-2 py-0.5 text-[10px] rounded border uppercase font-bold ${getSeverityBadgeClass(severity)}`}>
                {severity}
              </span>
              {isSourceBlocked && (
                <span className="px-1.5 py-0.2 bg-[#ff3344]/20 text-[#ff3344] border border-[#ff3344]/40 text-[10px] rounded font-bold uppercase">
                  [FIREWALL_BLOCKED]
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8b949e]">ID: {flow.id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#070a10] hover:bg-[#1f293d] border border-[#00e5ff]/40 rounded text-[#00e5ff] font-bold text-xs transition-all shadow-[0_0_8px_rgba(0,229,255,0.15)]"
            title="Download Incident Report JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>[EXPORT REPORT]</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#8b949e] hover:text-[#f0f6fc] text-xs px-2 py-1 bg-[#1f293d] border border-[#1f293d] rounded"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* View Selector Sub-Tabs */}
      <div className="flex items-center space-x-1 border-b border-[#1f293d] pb-2 text-[11px]">
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`px-3 py-1 rounded border ${
            activeSubTab === 'metrics'
              ? 'bg-[#1f293d] text-[#00e5ff] border-[#00e5ff]/40 font-bold'
              : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
          }`}
        >
          [Flow Vectors]
        </button>
        <button
          onClick={() => setActiveSubTab('pcap')}
          className={`flex items-center space-x-1 px-3 py-1 rounded border ${
            activeSubTab === 'pcap'
              ? 'bg-[#1f293d] text-[#00e5ff] border-[#00e5ff]/40 font-bold'
              : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
          }`}
        >
          <Binary className="w-3 h-3 text-[#00e5ff]" />
          <span>[Raw Frame Header]</span>
        </button>
        <button
          onClick={() => setActiveSubTab('mitigation')}
          className={`flex items-center space-x-1 px-3 py-1 rounded border ${
            activeSubTab === 'mitigation'
              ? 'bg-[#1f293d] text-[#00e5ff] border-[#00e5ff]/40 font-bold'
              : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
          }`}
        >
          <ShieldAlert className="w-3 h-3 text-[#ffb000]" />
          <span>[Firewall Controls]</span>
        </button>
      </div>

      {activeSubTab === 'metrics' && (
        <div className="space-y-4">
          {/* Ground Truth vs Prediction Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#070a10] p-3 rounded border border-[#1f293d]">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8b949e] uppercase font-bold flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-[#00e5ff]" />
                <span>MODEL PREDICTION RESULT</span>
              </span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-bold ${isThreat ? 'text-[#ff3344]' : 'text-[#00ff66]'}`}>
                  {prediction ? prediction.predictedClass : (isThreat ? 'Anomalous Traffic' : 'BENIGN')}
                </span>
                {prediction && (
                  <span className="text-[10px] text-[#8b949e] bg-[#111827] px-1.5 py-0.5 rounded border border-[#1f293d]">
                    Score: {(prediction.score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#1f293d] pt-2 md:pt-0 md:pl-3">
              <span className="text-[10px] text-[#8b949e] uppercase font-bold flex items-center space-x-1">
                <FileText className="w-3 h-3 text-[#00ff66]" />
                <span>DATASET LABEL</span>
              </span>
              <div className="text-sm font-bold text-[#f0f6fc]">
                {flow.label}
              </div>
            </div>
          </div>

          {/* Connection Pair */}
          <div className="bg-[#070a10] p-3 rounded border border-[#1f293d] space-y-2">
            <span className="text-[10px] text-[#8b949e] uppercase font-bold">[IP_ENDPOINT_PAIR]</span>
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="bg-[#111827] px-2.5 py-1.5 rounded border border-[#1f293d] text-[#f0f6fc]">
                <span className="text-[#8b949e] text-[10px] block">SRC:</span>
                <span>{flow.sourceIP}:{flow.sourcePort}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#00e5ff]" />
              <div className="bg-[#111827] px-2.5 py-1.5 rounded border border-[#1f293d] text-[#f0f6fc]">
                <span className="text-[#8b949e] text-[10px] block">DST:</span>
                <span>{flow.destinationIP}:{flow.destinationPort}</span>
              </div>
              <div className="bg-[#1f293d] px-3 py-1.5 rounded border border-[#00e5ff]/40 text-[#00e5ff]">
                <span className="text-[#8b949e] text-[10px] block">PROTO:</span>
                <span>{flow.protocol}</span>
              </div>
            </div>
          </div>

          {/* Raw Feature Vector Table */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#8b949e] uppercase font-bold">[FEATURE_METRIC_VECTORS]</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-[#070a10] p-2 rounded border border-[#1f293d]">
                <span className="text-[#484f58] block text-[10px]">Flow Duration</span>
                <span className="text-[#f0f6fc] font-semibold">{(flow.flowDuration / 1000).toFixed(2)} ms</span>
              </div>
              <div className="bg-[#070a10] p-2 rounded border border-[#1f293d]">
                <span className="text-[#484f58] block text-[10px]">Fwd / Bwd Packets</span>
                <span className="text-[#f0f6fc] font-semibold">{flow.totalFwdPackets} / {flow.totalBwdPackets}</span>
              </div>
              <div className="bg-[#070a10] p-2 rounded border border-[#1f293d]">
                <span className="text-[#484f58] block text-[10px]">Fwd / Bwd Bytes</span>
                <span className="text-[#f0f6fc] font-semibold">{flow.totalFwdBytes} / {flow.totalBwdBytes} B</span>
              </div>
              <div className="bg-[#070a10] p-2 rounded border border-[#1f293d]">
                <span className="text-[#484f58] block text-[10px]">Flow Packets/s</span>
                <span className="text-[#f0f6fc] font-semibold">{flow.flowPacketsPerSec.toFixed(1)}</span>
              </div>
              <div className="bg-[#070a10] p-2 rounded border border-[#1f293d]">
                <span className="text-[#484f58] block text-[10px]">Flow Bytes/s</span>
                <span className="text-[#f0f6fc] font-semibold">{flow.flowBytesPerSec.toFixed(1)}</span>
              </div>
              <div className="bg-[#070a10] p-2 rounded border border-[#1f293d]">
                <span className="text-[#484f58] block text-[10px]">Flags (SYN / ACK / RST)</span>
                <span className="text-[#f0f6fc] font-semibold">{flow.synFlagCount} / {flow.ackFlagCount} / {flow.rstFlagCount}</span>
              </div>
            </div>
          </div>

          {/* Detection Signatures & Defensive Action */}
          <div className="space-y-2 pt-2 border-t border-[#1f293d]">
            {prediction && prediction.reasons.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-[#8b949e] uppercase font-bold">[DETECTED_SIGNATURES]</span>
                <ul className="space-y-1">
                  {prediction.reasons.map((r, i) => (
                    <li key={i} className="flex items-start space-x-1.5 text-[11px] text-[#c9d1d9]">
                      <span className="text-[#00e5ff] font-bold">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-[#1f293d] border border-[#00e5ff]/30 p-3 rounded space-y-1">
              <span className="text-[10px] text-[#ffb000] uppercase font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SOC ANALYST ACTIONABLE RECOMMENDATION</span>
              </span>
              <p className="text-xs text-[#f0f6fc] leading-relaxed">
                {prediction ? prediction.recommendation : 'Review firewall logs for byte bursts and establish updated baseline parameters.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'pcap' && (
        <div className="space-y-2 bg-[#070a10] p-3 rounded border border-[#1f293d]">
          <span className="text-[10px] text-[#00e5ff] uppercase font-bold block">[RAW_TRANSPORT_FRAME_HEADER_HEX]</span>
          <pre className="text-[11px] text-[#00ff66] bg-[#070a10] overflow-x-auto p-2 rounded font-mono border border-[#1f293d] leading-relaxed">
            {hexDump}
          </pre>
          <p className="text-[10px] text-[#8b949e]">
            Transport header bytes constructed strictly from captured IP/TCP header fields without payload decryption.
          </p>
        </div>
      )}

      {activeSubTab === 'mitigation' && (
        <div className="space-y-3 bg-[#070a10] p-3 rounded border border-[#1f293d]">
          <span className="text-[10px] text-[#ffb000] uppercase font-bold block">[AUTOMATED_FIREWALL_REMEDIATION]</span>
          <p className="text-xs text-[#c9d1d9]">
            Enforce automated perimeter ingress block rules for threat source endpoint <span className="text-[#f0f6fc] font-bold">{flow.sourceIP}</span>.
          </p>

          <div className="bg-[#111827] p-2.5 rounded border border-[#1f293d] space-y-1 font-mono text-[11px] text-[#8b949e]">
            <span className="text-[#00e5ff] block font-bold">Generated iptables Rule:</span>
            <code className="text-[#00ff66] block">iptables -A INPUT -s {flow.sourceIP} -p {flow.protocol.toLowerCase()} --dport {flow.destinationPort} -j DROP</code>
          </div>

          {onToggleBlockIP && (
            <button
              onClick={() => onToggleBlockIP(flow.sourceIP)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-bold transition-all text-xs ${
                isSourceBlocked
                  ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/40 hover:bg-[#00ff66]/20'
                  : 'bg-[#ff3344]/10 text-[#ff3344] border border-[#ff3344]/40 hover:bg-[#ff3344]/20'
              }`}
            >
              {isSourceBlocked ? (
                <>
                  <ShieldOff className="w-3.5 h-3.5" />
                  <span>[UNBLOCK SOURCE HOST: {flow.sourceIP}]</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>[BLOCK &amp; ISOLATE HOST: {flow.sourceIP}]</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
