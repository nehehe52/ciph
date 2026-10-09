export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';

export type AnalysisMode = 'DATASET_ANALYSIS' | 'DEMO_REPLAY';

export interface NetworkFlow {
  id: string;
  timestamp: string;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string; // 'TCP', 'UDP', or 'ICMP'
  flowDuration: number;
  totalFwdPackets: number;
  totalBwdPackets: number;
  totalFwdBytes: number;
  totalBwdBytes: number;
  fwdPacketLenMax: number;
  fwdPacketLenMin: number;
  fwdPacketLenMean: number;
  bwdPacketLenMax: number;
  bwdPacketLenMin: number;
  bwdPacketLenMean: number;
  flowBytesPerSec: number;
  flowPacketsPerSec: number;
  flowIatMean: number;
  finFlagCount: number;
  synFlagCount: number;
  rstFlagCount: number;
  pshFlagCount: number;
  ackFlagCount: number;
  urgFlagCount: number;
  label: string; // Ground truth label e.g., 'BENIGN', 'DDoS', 'PortScan'
  isSynthetic?: boolean;
}

export interface NodeInfo {
  id: string; // IP Address
  label: string;
  type: 'internal' | 'external' | 'gateway' | 'target';
  flowCount: number;
  highestSeverity: Severity;
  anomalyScore: number;
  bytesTransferred: number;
}

export interface EdgeInfo {
  id: string; // sourceIP -> destinationIP
  source: string;
  target: string;
  flowCount: number;
  protocol: string;
  anomalyScore: number;
  severity: Severity;
}

export interface AnomalyPrediction {
  flowId: string;
  isAnomaly: boolean;
  score: number; // 0.0 to 1.0
  severity: Severity;
  predictedClass: string;
  confidence: number; // 0.0 to 1.0
  reasons: string[];
  recommendation: string;
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: ConfusionMatrix;
  totalEvaluated: number;
  threatCount: number;
  benignCount: number;
}
