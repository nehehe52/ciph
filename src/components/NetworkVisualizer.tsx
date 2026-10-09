import React, { useMemo, useState } from 'react';
import { NetworkFlow, NodeInfo, EdgeInfo, Severity, AnomalyPrediction } from '../types';
import { Server, Monitor, ShieldAlert, ShieldCheck, ArrowUpRight, Zap, RefreshCw, Filter, Sliders, ShieldOff, Terminal } from 'lucide-react';

interface NetworkVisualizerProps {
  flows: NetworkFlow[];
  predictions: Map<string, AnomalyPrediction>;
  selectedNode: string | null;
  setSelectedNode: (nodeId: string | null) => void;
  selectedEdge: string | null;
  setSelectedEdge: (edgeId: string | null) => void;
  onSelectFlow: (flow: NetworkFlow) => void;
  blockedIPs?: Set<string>;
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({
  flows,
  predictions,
  selectedNode,
  setSelectedNode,
  selectedEdge,
  setSelectedEdge,
  onSelectFlow,
  blockedIPs = new Set(),
}) => {
  const [minScoreThreshold, setMinScoreThreshold] = useState<number>(0);
  const [protocolFilter, setProtocolFilter] = useState<'ALL' | 'TCP' | 'UDP' | 'ICMP'>('ALL');

  // Filter flows by sensitivity slider and protocol filter
  const activeFlows = useMemo(() => {
    return flows.filter((flow) => {
      const pred = predictions.get(flow.id);
      const score = pred ? pred.score : 0;

      if (score < minScoreThreshold / 100) return false;
      if (protocolFilter !== 'ALL' && flow.protocol !== protocolFilter) return false;

      return true;
    });
  }, [flows, predictions, minScoreThreshold, protocolFilter]);

  // Process topology nodes and edges based on active flows and anomaly predictions
  const { nodes } = useMemo(() => {
    const nodeMap = new Map<string, NodeInfo>();
    const edgeMap = new Map<string, EdgeInfo>();

    activeFlows.forEach((flow) => {
      const pred = predictions.get(flow.id);
      const score = pred ? pred.score : 0.1;
      const flowSev = pred ? pred.severity : 'INFO';

      // Helper to update or create host node
      const processNode = (ip: string) => {
        let node = nodeMap.get(ip);
        if (!node) {
          let type: NodeInfo['type'] = 'internal';
          if (ip.startsWith('10.') || ip.startsWith('172.16.')) type = 'gateway';
          else if (ip === '192.168.10.50' || ip === '192.168.10.22') type = 'target';
          else if (!ip.startsWith('192.168.')) type = 'external';

          node = {
            id: ip,
            label: ip,
            type,
            flowCount: 0,
            highestSeverity: 'INFO',
            anomalyScore: 0,
            bytesTransferred: 0
          };
          nodeMap.set(ip, node);
        }

        node.flowCount += 1;
        node.bytesTransferred += (flow.totalFwdBytes + flow.totalBwdBytes);
        node.anomalyScore = Math.max(node.anomalyScore, score);

        const sevOrder: Record<Severity, number> = { INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
        if (sevOrder[flowSev] > sevOrder[node.highestSeverity]) {
          node.highestSeverity = flowSev;
        }
      };

      processNode(flow.sourceIP);
      processNode(flow.destinationIP);

      // Edge processing
      const edgeKey = `${flow.sourceIP}->${flow.destinationIP}`;
      let edge = edgeMap.get(edgeKey);
      if (!edge) {
        edge = {
          id: edgeKey,
          source: flow.sourceIP,
          target: flow.destinationIP,
          flowCount: 0,
          protocol: flow.protocol,
          anomalyScore: 0,
          severity: 'INFO'
        };
        edgeMap.set(edgeKey, edge);
      }

      edge.flowCount += 1;
      edge.anomalyScore = Math.max(edge.anomalyScore, score);
      const sevOrder: Record<Severity, number> = { INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
      if (sevOrder[flowSev] > sevOrder[nodeMap.get(flow.sourceIP)?.highestSeverity || 'INFO']) {
        edge.severity = flowSev;
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges: Array.from(edgeMap.values())
    };
  }, [activeFlows, predictions]);

  // Filter flows matching selected node or edge
  const filteredFlows = useMemo(() => {
    if (selectedEdge) {
      const [src, dst] = selectedEdge.split('->');
      return activeFlows.filter((f) => f.sourceIP === src && f.destinationIP === dst);
    }
    if (selectedNode) {
      return activeFlows.filter((f) => f.sourceIP === selectedNode || f.destinationIP === selectedNode);
    }
    return activeFlows;
  }, [activeFlows, selectedNode, selectedEdge]);

  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'HIGH':
        return 'bg-[#ff3344]/10 text-[#ff3344] border-[#ff3344]/40';
      case 'MEDIUM':
        return 'bg-[#ffb000]/10 text-[#ffb000] border-[#ffb000]/40';
      case 'LOW':
        return 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/40';
      default:
        return 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/40';
    }
  };

  const getSeverityBorderColor = (sev: Severity) => {
    switch (sev) {
      case 'HIGH':
        return 'border-[#ff3344] text-[#ff3344] shadow-[0_0_12px_rgba(255,51,68,0.3)]';
      case 'MEDIUM':
        return 'border-[#ffb000] text-[#ffb000] shadow-[0_0_8px_rgba(255,176,0,0.2)]';
      case 'LOW':
        return 'border-[#00e5ff] text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.2)]';
      default:
        return 'border-[#00ff66]/60 text-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.15)]';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono">
      {/* Topology Map Canvas (8 Cols) */}
      <div className="lg:col-span-8 bg-[#111827] border border-[#1f293d] rounded-lg p-4 flex flex-col justify-between min-h-[520px] relative overflow-hidden shadow-2xl">
        {/* Background Cyber Grid */}
        <div className="absolute inset-0 cyber-grid-bg opacity-50 pointer-events-none" />

        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between z-10 pb-3 border-b border-[#1f293d] gap-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#00e5ff]" />
            <h2 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-widest">
              [NETWORK_FLOW_TOPOLOGY_MAP]
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Anomaly Sensitivity Threshold Slider */}
            <div className="flex items-center space-x-1.5 bg-[#070a10] border border-[#1f293d] px-2.5 py-1 rounded">
              <Sliders className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span className="text-[#8b949e]">Threshold: {minScoreThreshold}%</span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minScoreThreshold}
                onChange={(e) => setMinScoreThreshold(Number(e.target.value))}
                className="w-20 accent-[#00e5ff] cursor-pointer"
              />
            </div>

            {/* Protocol Quick Filter */}
            <div className="flex items-center bg-[#070a10] border border-[#1f293d] rounded p-0.5 text-[11px]">
              <Filter className="w-3 h-3 text-[#8b949e] ml-1" />
              {(['ALL', 'TCP', 'UDP', 'ICMP'] as const).map((proto) => (
                <button
                  key={proto}
                  onClick={() => setProtocolFilter(proto)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    protocolFilter === proto
                      ? 'bg-[#1f293d] text-[#00e5ff] font-bold border border-[#00e5ff]/40'
                      : 'text-[#8b949e] hover:text-[#f0f6fc]'
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>

            <span className="text-[#8b949e]">Hosts: {nodes.length}</span>
            {(selectedNode || selectedEdge || minScoreThreshold > 0 || protocolFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedNode(null);
                  setSelectedEdge(null);
                  setMinScoreThreshold(0);
                  setProtocolFilter('ALL');
                }}
                className="flex items-center space-x-1 px-2 py-0.5 bg-[#1f293d] hover:bg-[#2d3b55] border border-[#00e5ff]/40 rounded text-[#00e5ff] transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>[Reset Filters]</span>
              </button>
            )}
          </div>
        </div>

        {/* Node Topology Interactive Grid */}
        <div className="my-auto py-6 z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const borderStyle = getSeverityBorderColor(node.highestSeverity);
            const isBlocked = blockedIPs.has(node.id);

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedEdge(null);
                  setSelectedNode(node.id === selectedNode ? null : node.id);
                }}
                className={`cursor-pointer p-3 bg-[#070a10] border-2 rounded-lg transition-all duration-200 hover:scale-[1.02] relative ${
                  isSelected ? 'ring-2 ring-[#00e5ff] bg-[#1f293d]' : ''
                } ${isBlocked ? 'opacity-60 border-dashed border-[#ff3344]' : borderStyle}`}
              >
                {isBlocked && (
                  <div className="absolute -top-2 -right-2 bg-[#ff3344] text-white text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center space-x-0.5 shadow-lg">
                    <ShieldOff className="w-2.5 h-2.5" />
                    <span>[ISOLATED]</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {node.type === 'target' || node.type === 'gateway' ? (
                      <Server className="w-4 h-4 text-[#00e5ff]" />
                    ) : (
                      <Monitor className="w-4 h-4 text-[#00ff66]" />
                    )}
                    <span className="font-bold text-xs truncate max-w-[110px] text-[#f0f6fc]">
                      {node.label}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${getSeverityBadgeClass(
                      node.highestSeverity
                    )}`}
                  >
                    {node.highestSeverity}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-[#8b949e] border-t border-[#1f293d] pt-2">
                  <div className="flex justify-between">
                    <span>Flows:</span>
                    <span className="text-[#f0f6fc] font-semibold">{node.flowCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Threat Score:</span>
                    <span
                      className={`font-bold ${
                        node.anomalyScore > 0.5 ? 'text-[#ff3344]' : 'text-[#00ff66]'
                      }`}
                    >
                      {(node.anomalyScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Traffic:</span>
                    <span className="text-[#f0f6fc] text-[10px]">
                      {(node.bytesTransferred / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="z-10 pt-3 border-t border-[#1f293d] flex flex-wrap items-center justify-between text-xs text-[#8b949e]">
          <div className="flex items-center space-x-4">
            <span className="text-[#484f58] uppercase font-bold">[SEVERITY]:</span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] led-green" />
              <span>INFO</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] led-cyan" />
              <span>LOW</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#ffb000]" />
              <span>MEDIUM</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#ff3344] led-red" />
              <span>HIGH</span>
            </span>
          </div>
          <span className="text-[11px] text-[#484f58]">Click any host node to isolate network telemetry</span>
        </div>
      </div>

      {/* Filtered Telemetry List for Selected Node/Edge (4 Cols) */}
      <div className="lg:col-span-4 bg-[#111827] border border-[#1f293d] rounded-lg p-4 flex flex-col justify-between min-h-[520px] shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#1f293d] mb-3">
            <h3 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-wider flex items-center space-x-1.5">
              <ArrowUpRight className="w-4 h-4 text-[#00ff66]" />
              <span>{selectedNode ? `[NODE_FLOWS: ${selectedNode}]` : '[ACTIVE_FLOW_TELEMETRY]'}</span>
            </h3>
            <span className="text-xs text-[#00e5ff] bg-[#070a10] border border-[#00e5ff]/30 px-2 py-0.5 rounded font-bold">
              {filteredFlows.length} REC
            </span>
          </div>

          <div className="space-y-2 max-h-[410px] overflow-y-auto pr-1">
            {filteredFlows.length === 0 ? (
              <div className="text-center py-12 text-[#8b949e] text-xs space-y-2">
                <Terminal className="w-8 h-8 text-[#1f293d] mx-auto animate-pulse" />
                <p>No active network traffic matching telemetry criteria.</p>
              </div>
            ) : (
              filteredFlows.map((flow) => {
                const pred = predictions.get(flow.id);
                const sev = pred ? pred.severity : 'INFO';
                const isAnomaly = pred ? pred.isAnomaly : false;

                return (
                  <div
                    key={flow.id}
                    onClick={() => onSelectFlow(flow)}
                    className="p-2.5 bg-[#070a10] hover:bg-[#1f293d] border border-[#1f293d] hover:border-[#00e5ff]/40 rounded cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#f0f6fc] font-bold flex items-center space-x-1">
                        {isAnomaly ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-[#ff3344]" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00ff66]" />
                        )}
                        <span>{flow.protocol}</span>
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border uppercase font-bold ${getSeverityBadgeClass(sev)}`}>
                        {pred ? pred.predictedClass : flow.label}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#8b949e] flex items-center justify-between">
                      <span className="truncate max-w-[120px] text-[#f0f6fc]">{flow.sourceIP}:{flow.sourcePort}</span>
                      <span className="text-[#00e5ff]">&rarr;</span>
                      <span className="truncate max-w-[120px] text-[#f0f6fc]">{flow.destinationIP}:{flow.destinationPort}</span>
                    </div>

                    <div className="text-[10px] text-[#484f58] flex justify-between border-t border-[#1f293d] pt-1">
                      <span>Pkts: {flow.totalFwdPackets + flow.totalBwdPackets}</span>
                      <span>Bytes: {(flow.totalFwdBytes + flow.totalBwdBytes).toLocaleString()} B</span>
                      <span>Dur: {(flow.flowDuration / 1000).toFixed(1)} ms</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-[#1f293d] text-[11px] text-[#8b949e] flex justify-between">
          <span>Targeting telemetry:</span>
          <span className="text-[#00e5ff] font-bold">[Inspect Record]</span>
        </div>
      </div>
    </div>
  );
};
