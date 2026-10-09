import Papa from 'papaparse';
import { NetworkFlow } from '../types';

/**
 * Safely converts a value to number, replacing NaN, null, undefined, Infinity with fallback (0)
 */
function sanitizeNumber(val: any, fallback: number = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return fallback;
    return val;
  }
  const str = String(val).trim();
  if (str === 'Infinity' || str === '-Infinity' || str === 'NaN' || str === 'Infinity ') {
    return fallback;
  }
  const parsed = parseFloat(str);
  if (isNaN(parsed) || !isFinite(parsed)) return fallback;
  return parsed;
}

/**
 * Maps raw CSV row key-values (with trimmed column names) to a normalized NetworkFlow record
 */
export function mapRowToFlow(row: Record<string, any>, index: number): NetworkFlow {
  // Normalize row keys by trimming whitespace
  const normalizedRow: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    if (key) {
      normalizedRow[key.trim()] = row[key];
    }
  }

  // Helper to retrieve value by list of candidate header names
  const getVal = (...keys: string[]) => {
    for (const k of keys) {
      if (normalizedRow[k] !== undefined) return normalizedRow[k];
    }
    return undefined;
  };

  const destPort = sanitizeNumber(getVal('Destination Port', 'Dst Port', 'DstPort', 'destination_port'), 80);
  const srcPort = sanitizeNumber(getVal('Source Port', 'Src Port', 'SrcPort', 'source_port'), 49152 + (index % 10000));

  // Determine Source and Destination IP with standard security sandbox fallbacks if absent in dataset variant
  let sourceIP = String(getVal('Source IP', 'Src IP', 'SrcIP', 'source_ip') || '').trim();
  let destinationIP = String(getVal('Destination IP', 'Dst IP', 'DstIP', 'destination_ip') || '').trim();

  if (!sourceIP) {
    // Generate deterministic subnet IP for consistent visual topology
    const host = (index % 250) + 2;
    sourceIP = `192.168.1.${host}`;
  }
  if (!destinationIP) {
    if (destPort === 80 || destPort === 443) {
      destinationIP = '192.168.10.50'; // Internal Web/App Server
    } else if (destPort === 22) {
      destinationIP = '192.168.10.22'; // SSH Jump Host
    } else if (destPort === 53) {
      destinationIP = '8.8.8.8'; // External DNS
    } else {
      destinationIP = `10.0.0.${(index % 50) + 10}`;
    }
  }

  // Protocol translation
  const rawProto = sanitizeNumber(getVal('Protocol', 'protocol'), 6);
  let protocol = 'TCP';
  if (rawProto === 17) protocol = 'UDP';
  else if (rawProto === 1) protocol = 'ICMP';
  else if (typeof rawProto === 'string') protocol = String(rawProto).toUpperCase();

  // Ground truth label
  const rawLabel = String(getVal('Label', 'label') || 'BENIGN').trim();
  const label = rawLabel.length > 0 ? rawLabel : 'BENIGN';

  const flowDuration = sanitizeNumber(getVal('Flow Duration', 'flow_duration'), 1000);
  const totalFwdPackets = sanitizeNumber(getVal('Total Fwd Packets', 'Total Fwd Packet', 'tot_fwd_pkts'), 1);
  const totalBwdPackets = sanitizeNumber(getVal('Total Backward Packets', 'Total Bwd packets', 'tot_bwd_pkts'), 0);

  const totalFwdBytes = sanitizeNumber(getVal('Total Length of Fwd Packets', 'Subflow Fwd Bytes'), 0);
  const totalBwdBytes = sanitizeNumber(getVal('Total Length of Bwd Packets', 'Subflow Bwd Bytes'), 0);

  const flowBytesPerSec = sanitizeNumber(getVal('Flow Bytes/s', 'Flow Bytes/s'), (totalFwdBytes + totalBwdBytes) / Math.max(1, flowDuration / 1000000));
  const flowPacketsPerSec = sanitizeNumber(getVal('Flow Packets/s', 'Flow Packets/s'), (totalFwdPackets + totalBwdPackets) / Math.max(1, flowDuration / 1000000));

  // Timestamps
  const timestampStr = String(getVal('Timestamp', 'timestamp') || '');
  let timestamp = new Date().toISOString();
  if (timestampStr) {
    const d = new Date(timestampStr);
    if (!isNaN(d.getTime())) {
      timestamp = d.toISOString();
    } else {
      timestamp = new Date(Date.now() - (100000 - index * 1000)).toISOString();
    }
  } else {
    timestamp = new Date(Date.now() - (100000 - index * 1000)).toISOString();
  }

  return {
    id: `flow-${index}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    sourceIP,
    destinationIP,
    sourcePort: srcPort,
    destinationPort: destPort,
    protocol,
    flowDuration,
    totalFwdPackets,
    totalBwdPackets,
    totalFwdBytes,
    totalBwdBytes,
    fwdPacketLenMax: sanitizeNumber(getVal('Fwd Packet Length Max', 'fwd_pkt_len_max'), 0),
    fwdPacketLenMin: sanitizeNumber(getVal('Fwd Packet Length Min', 'fwd_pkt_len_min'), 0),
    fwdPacketLenMean: sanitizeNumber(getVal('Fwd Packet Length Mean', 'fwd_pkt_len_mean'), 0),
    bwdPacketLenMax: sanitizeNumber(getVal('Bwd Packet Length Max', 'bwd_pkt_len_max'), 0),
    bwdPacketLenMin: sanitizeNumber(getVal('Bwd Packet Length Min', 'bwd_pkt_len_min'), 0),
    bwdPacketLenMean: sanitizeNumber(getVal('Bwd Packet Length Mean', 'bwd_pkt_len_mean'), 0),
    flowBytesPerSec,
    flowPacketsPerSec,
    flowIatMean: sanitizeNumber(getVal('Flow IAT Mean', 'flow_iat_mean'), 0),
    finFlagCount: sanitizeNumber(getVal('FIN Flag Count', 'fin_flag_cnt'), 0),
    synFlagCount: sanitizeNumber(getVal('SYN Flag Count', 'syn_flag_cnt'), 0),
    rstFlagCount: sanitizeNumber(getVal('RST Flag Count', 'rst_flag_cnt'), 0),
    pshFlagCount: sanitizeNumber(getVal('PSH Flag Count', 'psh_flag_cnt'), 0),
    ackFlagCount: sanitizeNumber(getVal('ACK Flag Count', 'ack_flag_cnt'), 0),
    urgFlagCount: sanitizeNumber(getVal('URG Flag Count', 'urg_flag_cnt'), 0),
    label
  };
}

/**
 * Parses raw CSV content text into cleaned array of NetworkFlow records
 */
export function parseCSVContent(csvContent: string): NetworkFlow[] {
  const parseResult = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  if (!parseResult.data || !Array.isArray(parseResult.data)) {
    return [];
  }

  return parseResult.data
    .filter((row: any) => row && typeof row === 'object' && Object.keys(row).length > 1)
    .map((row: any, idx: number) => mapRowToFlow(row, idx));
}
