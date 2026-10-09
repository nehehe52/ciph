import React, { useState } from 'react';
import { NetworkFlow, AnomalyPrediction, Severity } from '../types';
import { Search, ShieldAlert, ArrowUpDown, Clock } from 'lucide-react';

interface AlertTimelineProps {
  flows: NetworkFlow[];
  predictions: Map<string, AnomalyPrediction>;
  selectedFlow: NetworkFlow | null;
  onSelectFlow: (flow: NetworkFlow) => void;
}

export const AlertTimeline: React.FC<AlertTimelineProps> = ({
  flows,
  predictions,
  selectedFlow,
  onSelectFlow,
}) => {
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredFlows = flows.filter((flow) => {
    const pred = predictions.get(flow.id);
    const sev = pred ? pred.severity : 'INFO';

    if (severityFilter !== 'ALL' && sev !== severityFilter) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchIp = flow.sourceIP.toLowerCase().includes(q) || flow.destinationIP.toLowerCase().includes(q);
      const matchProto = flow.protocol.toLowerCase().includes(q);
      const matchLabel = flow.label.toLowerCase().includes(q);
      const matchPred = pred && pred.predictedClass.toLowerCase().includes(q);
      return matchIp || matchProto || matchLabel || matchPred;
    }

    return true;
  }).sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

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
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 font-mono text-xs space-y-4">
      {/* Control Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#21262d]">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-[#f85149]" />
          <h2 className="font-bold text-sm text-[#f0f6fc] uppercase tracking-wider">
            Evidence-First Event Timeline
          </h2>
          <span className="text-[10px] bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded border border-[#30363d]">
            {filteredFlows.length} Events Logged
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter buttons */}
          <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded p-0.5 text-[11px]">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  severityFilter === sev
                    ? 'bg-[#21262d] text-[#f0f6fc] font-bold border border-[#30363d]'
                    : 'text-[#8b949e] hover:text-[#c9d1d9]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search IP, Proto, Label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded pl-8 pr-3 py-1 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] w-48"
            />
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] rounded text-[#8b949e] hover:text-[#c9d1d9]"
            title="Toggle Timestamp Sort Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* High-density Tabular Event View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#30363d] text-[11px] text-[#8b949e] uppercase bg-[#0d1117]">
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-3">Severity</th>
              <th className="py-2 px-3">Source Endpoint</th>
              <th className="py-2 px-3">Destination Endpoint</th>
              <th className="py-2 px-3">Proto</th>
              <th className="py-2 px-3">Model Prediction</th>
              <th className="py-2 px-3">Dataset Label</th>
              <th className="py-2 px-3">Packets / Bytes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262d] text-xs">
            {filteredFlows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#8b949e]">
                  No network threat events matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredFlows.map((flow) => {
                const pred = predictions.get(flow.id);
                const sev = pred ? pred.severity : 'INFO';
                const isSelected = selectedFlow?.id === flow.id;
                const formattedTime = new Date(flow.timestamp).toISOString().substring(11, 23);

                return (
                  <tr
                    key={flow.id}
                    onClick={() => onSelectFlow(flow)}
                    className={`cursor-pointer transition-colors hover:bg-[#21262d]/70 ${
                      isSelected ? 'bg-[#21262d] border-l-4 border-l-[#58a6ff]' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-[#8b949e] whitespace-nowrap flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-[#484f58]" />
                      <span>{formattedTime}</span>
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] rounded border font-bold uppercase ${getSeverityBadgeClass(sev)}`}>
                        {sev}
                      </span>
                    </td>

                    <td className="py-2 px-3 font-semibold text-[#f0f6fc] whitespace-nowrap">
                      {flow.sourceIP}:{flow.sourcePort}
                    </td>

                    <td className="py-2 px-3 font-semibold text-[#f0f6fc] whitespace-nowrap">
                      {flow.destinationIP}:{flow.destinationPort}
                    </td>

                    <td className="py-2 px-3 text-[#58a6ff] whitespace-nowrap">
                      {flow.protocol}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`font-semibold ${pred && pred.isAnomaly ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>
                        {pred ? pred.predictedClass : flow.label}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-[#8b949e] whitespace-nowrap">
                      {flow.label}
                    </td>

                    <td className="py-2 px-3 text-[#8b949e] whitespace-nowrap text-[11px]">
                      {flow.totalFwdPackets + flow.totalBwdPackets} pkts / {(flow.totalFwdBytes + flow.totalBwdBytes).toLocaleString()} B
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
