import React, { useMemo } from 'react';
import { NetworkFlow, NodeInfo, EdgeInfo, Severity, AnomalyPrediction } from '../types';
import { Server, Monitor, ShieldAlert, ShieldCheck, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';

interface NetworkVisualizerProps {
  flows: NetworkFlow[];
  predictions: Map<string, AnomalyPrediction>;
  selectedNode: string | null;
  setSelectedNode: (nodeId: string | null) => void;
  selectedEdge: string | null;
  setSelectedEdge: (edgeId: string | null) => void;
  onSelectFlow: (flow: NetworkFlow) => void;
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({
  flows,
  predictions,
  selectedNode,
  setSelectedNode,
  selectedEdge,
  setSelectedEdge,
  onSelectFlow,
}) => {
  // Process topology nodes and edges based on flows and anomaly predictions
  const { nodes } = useMemo(() => {
    const nodeMap = new Map<string, NodeInfo>();
    const edgeMap = new Map<string, EdgeInfo>();

    flows.forEach((flow) => {
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
      if (sevOrder[flowSev] > sevOrder[edge.severity]) {
        edge.severity = flowSev;
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges: Array.from(edgeMap.values())
    };
  }, [flows, predictions]);

  // Filter flows matching selected node or edge
  const filteredFlows = useMemo(() => {
    if (selectedEdge) {
      const [src, dst] = selectedEdge.split('->');
      return flows.filter((f) => f.sourceIP === src && f.destinationIP === dst);
    }
    if (selectedNode) {
      return flows.filter((f) => f.sourceIP === selectedNode || f.destinationIP === selectedNode);
    }
    return flows;
  }, [flows, selectedNode, selectedEdge]);

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

  const getSeverityBorderColor = (sev: Severity) => {
    switch (sev) {
      case 'HIGH':
        return 'border-[#f85149] text-[#f85149] shadow-[0_0_12px_rgba(248,81,73,0.3)]';
      case 'MEDIUM':
        return 'border-[#d29922] text-[#d29922]';
      case 'LOW':
        return 'border-[#58a6ff] text-[#58a6ff]';
      default:
        return 'border-[#3fb950] text-[#3fb950]';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Topology Map Canvas (8 Cols) */}
      <div className="lg:col-span-8 bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col justify-between min-h-[520px] relative overflow-hidden">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#21262d_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Header Controls */}
        <div className="flex items-center justify-between z-10 pb-3 border-b border-[#21262d]">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#58a6ff]" />
            <h2 className="font-mono font-bold text-sm text-[#f0f6fc] uppercase tracking-wider">
              Network Flow Topology Map
            </h2>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-[#8b949e]">Hosts: {nodes.length}</span>
            {(selectedNode || selectedEdge) && (
              <button
                onClick={() => {
                  setSelectedNode(null);
                  setSelectedEdge(null);
                }}
                className="flex items-center space-x-1 px-2 py-0.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded text-[#58a6ff]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset View</span>
              </button>
            )}
          </div>
        </div>

        {/* Node Topology Interactive Grid */}
        <div className="my-auto py-8 z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const borderStyle = getSeverityBorderColor(node.highestSeverity);

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedEdge(null);
                  setSelectedNode(node.id === selectedNode ? null : node.id);
                }}
                className={`cursor-pointer p-3 bg-[#0d1117] border-2 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  isSelected ? 'ring-2 ring-[#58a6ff] bg-[#21262d]' : ''
                } ${borderStyle}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {node.type === 'target' || node.type === 'gateway' ? (
                      <Server className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                    <span className="font-mono font-bold text-xs truncate max-w-[110px]">
                      {node.label}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-semibold ${getSeverityBadgeClass(
                      node.highestSeverity
                    )}`}
                  >
                    {node.highestSeverity}
                  </span>
                </div>

                <div className="space-y-1 font-mono text-[11px] text-[#8b949e] border-t border-[#21262d] pt-2">
                  <div className="flex justify-between">
                    <span>Flows:</span>
                    <span className="text-[#c9d1d9] font-medium">{node.flowCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Threat Score:</span>
                    <span
                      className={`font-semibold ${
                        node.anomalyScore > 0.5 ? 'text-[#f85149]' : 'text-[#3fb950]'
                      }`}
                    >
                      {(node.anomalyScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transferred:</span>
                    <span className="text-[#c9d1d9] text-[10px]">
                      {(node.bytesTransferred / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="z-10 pt-3 border-t border-[#21262d] flex flex-wrap items-center justify-between text-xs font-mono text-[#8b949e]">
          <div className="flex items-center space-x-4">
            <span className="text-[#484f58]">SEVERITY KEYS:</span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
              <span>INFO</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#58a6ff]" />
              <span>LOW</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]" />
              <span>MEDIUM</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
              <span>HIGH / THREAT</span>
            </span>
          </div>
          <span className="text-[11px] text-[#484f58]">Click any host node to isolate network traffic</span>
        </div>
      </div>

      {/* Filtered Telemetry List for Selected Node/Edge (4 Cols) */}
      <div className="lg:col-span-4 bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col justify-between min-h-[520px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#21262d] mb-3">
            <h3 className="font-mono font-bold text-xs text-[#f0f6fc] uppercase tracking-wider flex items-center space-x-1.5">
              <ArrowUpRight className="w-4 h-4 text-[#3fb950]" />
              <span>{selectedNode ? `Node Flows (${selectedNode})` : 'Active Network Connections'}</span>
            </h3>
            <span className="text-xs font-mono text-[#8b949e]">
              {filteredFlows.length} record{filteredFlows.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-2 max-h-[410px] overflow-y-auto pr-1">
            {filteredFlows.length === 0 ? (
              <div className="text-center py-12 text-[#8b949e] font-mono text-xs">
                No active traffic flows matching selection.
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
                    className="p-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] rounded cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#f0f6fc] font-semibold flex items-center space-x-1">
                        {isAnomaly ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-[#f85149]" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#3fb950]" />
                        )}
                        <span>{flow.protocol}</span>
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${getSeverityBadgeClass(sev)}`}>
                        {pred ? pred.predictedClass : flow.label}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#8b949e] flex items-center justify-between">
                      <span className="truncate max-w-[120px]">{flow.sourceIP}:{flow.sourcePort}</span>
                      <span>&rarr;</span>
                      <span className="truncate max-w-[120px]">{flow.destinationIP}:{flow.destinationPort}</span>
                    </div>

                    <div className="text-[10px] font-mono text-[#484f58] flex justify-between border-t border-[#21262d] pt-1">
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

        <div className="pt-3 border-t border-[#21262d] text-[11px] font-mono text-[#8b949e] flex justify-between">
          <span>Targeting telemetry:</span>
          <span className="text-[#58a6ff]">Click flow record for deep inspection</span>
        </div>
      </div>
    </div>
  );
};
