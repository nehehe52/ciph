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
        return 'bg-[#ff3344]/10 text-[#ff3344] border-[#ff3344]/40 shadow-[0_0_6px_rgba(255,51,68,0.2)]';
      case 'MEDIUM':
        return 'bg-[#ffb000]/10 text-[#ffb000] border-[#ffb000]/40';
      case 'LOW':
        return 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/40';
      default:
        return 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/40';
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-lg p-4 font-mono text-xs space-y-4 shadow-2xl">
      {/* Control Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1f293d]">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-[#ff3344]" />
          <h2 className="font-bold text-xs text-[#f0f6fc] uppercase tracking-widest">
            [EVIDENCE_FIRST_EVENT_LOG]
          </h2>
          <span className="text-[10px] bg-[#070a10] text-[#00e5ff] px-2 py-0.5 rounded border border-[#00e5ff]/30 font-bold">
            {filteredFlows.length} EVENTS
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter buttons */}
          <div className="flex items-center bg-[#070a10] border border-[#1f293d] rounded p-0.5 text-[11px]">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded transition-colors font-bold ${
                  severityFilter === sev
                    ? 'bg-[#1f293d] text-[#00e5ff] border border-[#00e5ff]/40'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
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
              className="bg-[#070a10] border border-[#1f293d] rounded pl-8 pr-3 py-1 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#00e5ff] w-48 font-mono"
            />
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#070a10] hover:bg-[#1f293d] border border-[#1f293d] rounded text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
            title="Toggle Timestamp Sort Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>{sortOrder === 'desc' ? '[Newest]' : '[Oldest]'}</span>
          </button>
        </div>
      </div>

      {/* High-density Tabular Event View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f293d] text-[11px] text-[#8b949e] uppercase bg-[#070a10]">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Source Endpoint</th>
              <th className="py-2.5 px-3">Destination Endpoint</th>
              <th className="py-2.5 px-3">Proto</th>
              <th className="py-2.5 px-3">Model Prediction</th>
              <th className="py-2.5 px-3">Dataset Label</th>
              <th className="py-2.5 px-3">Packets / Bytes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f293d] text-xs">
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
                    className={`cursor-pointer transition-all hover:bg-[#1f293d]/80 ${
                      isSelected ? 'bg-[#1f293d] border-l-4 border-l-[#00e5ff]' : ''
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

                    <td className="py-2 px-3 font-bold text-[#f0f6fc] whitespace-nowrap">
                      {flow.sourceIP}:{flow.sourcePort}
                    </td>

                    <td className="py-2 px-3 font-bold text-[#f0f6fc] whitespace-nowrap">
                      {flow.destinationIP}:{flow.destinationPort}
                    </td>

                    <td className="py-2 px-3 text-[#00e5ff] font-bold whitespace-nowrap">
                      {flow.protocol}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`font-bold ${pred && pred.isAnomaly ? 'text-[#ff3344]' : 'text-[#00ff66]'}`}>
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
