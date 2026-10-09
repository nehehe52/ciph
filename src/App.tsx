import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NetworkFlow, AnomalyPrediction, AnalysisMode } from './types';
import { parseCSVContent } from './lib/datasetLoader';
import { evaluateFlow, calculateModelMetrics } from './lib/anomalyModel';
import { Header } from './components/Header';
import { NetworkVisualizer } from './components/NetworkVisualizer';
import { ThreatPanel } from './components/ThreatPanel';
import { AlertTimeline } from './components/AlertTimeline';
import { ModelMetricsView } from './components/ModelMetricsView';
import { PrivacyNotice } from './components/PrivacyNotice';

// Built-in fallback sample datasets (from MachineLearningCVE)
const INITIAL_CSV_SAMPLE = ` Flow Duration , Total Fwd Packets , Total Backward Packets , Total Length of Fwd Packets , Total Length of Bwd Packets , Fwd Packet Length Max , Fwd Packet Length Min , Fwd Packet Length Mean , Fwd Packet Length Std , Bwd Packet Length Max , Bwd Packet Length Min , Bwd Packet Length Mean , Bwd Packet Length Std , Flow Bytes/s , Flow Packets/s , Flow IAT Mean , Flow IAT Std , Flow IAT Max , Flow IAT Min , Fwd IAT Total , Fwd IAT Mean , Fwd IAT Std , Fwd IAT Max , Fwd IAT Min , Bwd IAT Total , Bwd IAT Mean , Bwd IAT Std , Bwd IAT Max , Bwd IAT Min , Fwd PSH Flags , Bwd PSH Flags , Fwd URG Flags , Bwd URG Flags , Fwd Header Length , Bwd Header Length , Fwd Packets/s , Bwd Packets/s , Min Packet Length , Max Packet Length , Packet Length Mean , Packet Length Std , Packet Length Variance , FIN Flag Count , SYN Flag Count , RST Flag Count , PSH Flag Count , ACK Flag Count , URG Flag Count , CWE Flag Count , ECE Flag Count , Down/Up Ratio , Average Packet Size , Avg Fwd Segment Size , Avg Bwd Segment Size , Fwd Header Length.1 , Fwd Avg Bytes/Bulk , Fwd Avg Packets/Bulk , Fwd Avg Bulk Rate , Bwd Avg Bytes/Bulk , Bwd Avg Packets/Bulk , Bwd Avg Bulk Rate , Subflow Fwd Packets , Subflow Fwd Bytes , Subflow Bwd Packets , Subflow Bwd Bytes , Init_Win_bytes_forward , Init_Win_bytes_backward , act_data_pkt_fwd , min_seg_size_forward , Active Mean , Active Std , Active Max , Active Min , Idle Mean , Idle Std , Idle Max , Idle Min , Destination Port , Source IP , Destination IP , Source Port , Protocol , Label
120000, 10, 8, 540, 1200, 100, 20, 54, 12, 300, 40, 150, 25, 14500.0, 150.0, 12000, 500, 15000, 1000, 120000, 12000, 500, 15000, 1000, 110000, 11000, 400, 14000, 1000, 0, 0, 0, 0, 200, 160, 83.33, 66.67, 20, 300, 96.6, 45.2, 2043.0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 96.6, 54, 150, 200, 0, 0, 0, 0, 0, 0, 10, 540, 8, 1200, 8192, 8192, 8, 20, 0, 0, 0, 0, 0, 0, 0, 0, 443, 192.168.1.105, 172.217.16.206, 49210, 6, BENIGN
8500, 450, 5, 270000, 250, 600, 600, 600, 0, 50, 50, 50, 0, 31794117.65, 53529.41, 18.88, 5.2, 50, 2, 8500, 18.88, 5.2, 50, 2, 8000, 1600, 12.0, 2000, 10, 1, 0, 0, 0, 9000, 100, 52941.18, 588.23, 50, 600, 593.4, 25.1, 630.0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 593.4, 600, 50, 9000, 0, 0, 0, 0, 0, 0, 450, 270000, 5, 250, 1024, -1, 450, 20, 0, 0, 0, 0, 0, 0, 0, 0, 80, 172.16.0.5, 192.168.10.50, 51322, 6, DDoS
400, 150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 375000.0, 2.66, 0.5, 5, 1, 400, 2.66, 0.5, 5, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3000, 0, 375000.0, 0.0, 0, 0, 0, 0, 0.0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3000, 0, 0, 0, 0, 0, 0, 150, 0, 0, 0, -1, -1, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 22, 172.16.0.12, 192.168.10.50, 58120, 6, PortScan
950000, 85, 80, 4200, 125000, 80, 40, 49.4, 12.1, 1460, 0, 1562.5, 210.0, 136000.0, 173.68, 5757.5, 120.0, 8000, 100, 950000, 11176.4, 250.0, 15000, 200, 940000, 11750.0, 240.0, 15000, 200, 0, 0, 0, 0, 1700, 1600, 89.47, 84.21, 0, 1460, 783.0, 720.1, 518544.0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 783.0, 49.4, 1562.5, 1700, 0, 0, 0, 0, 0, 0, 85, 4200, 80, 125000, 5840, 5840, 85, 20, 0, 0, 0, 0, 0, 0, 0, 0, 80, 172.16.0.8, 192.168.10.50, 44312, 6, DoS GoldenEye
55000, 4, 4, 240, 480, 60, 60, 60, 0, 120, 120, 120, 0, 13090.9, 145.45, 7857.14, 1200.0, 10000, 5000, 55000, 18333.3, 2000.0, 20000, 10000, 50000, 16666.7, 1800.0, 18000, 10000, 0, 0, 0, 0, 80, 80, 72.72, 72.72, 60, 120, 90.0, 31.62, 1000.0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 90.0, 60, 120, 80, 0, 0, 0, 0, 0, 0, 4, 240, 4, 480, 14600, 14600, 4, 20, 0, 0, 0, 0, 0, 0, 0, 0, 443, 192.168.1.110, 104.16.249.249, 52104, 6, BENIGN`;

export function App() {
  const [flows, setFlows] = useState<NetworkFlow[]>([]);
  const [mode, setMode] = useState<AnalysisMode>('DATASET_ANALYSIS');
  const [isReplaying, setIsReplaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'topology' | 'events' | 'metrics'>('topology');
  const [selectedFlow, setSelectedFlow] = useState<NetworkFlow | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [datasetName, setDatasetName] = useState<string>('Monday-WorkingHours.pcap_ISCX.csv');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Initial setup: Load default CIC-IDS2017 dataset
  useEffect(() => {
    const loaded = parseCSVContent(INITIAL_CSV_SAMPLE);
    setFlows(loaded);
    if (loaded.length > 0) {
      setSelectedFlow(loaded[0]);
    }
  }, []);

  // Demo Replay Stream simulation effect
  useEffect(() => {
    if (mode !== 'DEMO_REPLAY' || !isReplaying) return;

    const interval = setInterval(() => {
      setFlows((prev) => {
        const isAttack = Math.random() < 0.35;
        const attackTypes = ['DDoS', 'PortScan', 'DoS GoldenEye', 'Bot'];
        const chosenType = isAttack ? attackTypes[Math.floor(Math.random() * attackTypes.length)] : 'BENIGN';

        const newFlow: NetworkFlow = {
          id: `replay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          sourceIP: isAttack ? `172.16.0.${Math.floor(Math.random() * 20) + 1}` : `192.168.1.${Math.floor(Math.random() * 100) + 10}`,
          destinationIP: '192.168.10.50',
          sourcePort: Math.floor(Math.random() * 20000) + 40000,
          destinationPort: isAttack && chosenType === 'PortScan' ? Math.floor(Math.random() * 1000) + 20 : 80,
          protocol: 'TCP',
          flowDuration: isAttack ? 2000 : 85000,
          totalFwdPackets: isAttack ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 10) + 2,
          totalBwdPackets: isAttack ? 2 : Math.floor(Math.random() * 8) + 2,
          totalFwdBytes: isAttack ? 300000 : 1200,
          totalBwdBytes: isAttack ? 200 : 2400,
          fwdPacketLenMax: 600,
          fwdPacketLenMin: 20,
          fwdPacketLenMean: 250,
          bwdPacketLenMax: 300,
          bwdPacketLenMin: 40,
          bwdPacketLenMean: 150,
          flowBytesPerSec: isAttack ? 25000000 : 15000,
          flowPacketsPerSec: isAttack ? 40000 : 120,
          flowIatMean: 15,
          finFlagCount: 0,
          synFlagCount: 1,
          rstFlagCount: isAttack ? 1 : 0,
          pshFlagCount: 1,
          ackFlagCount: 1,
          urgFlagCount: 0,
          label: chosenType,
          isSynthetic: true
        };

        // Keep last 100 flows in stream buffer
        return [newFlow, ...prev.slice(0, 99)];
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [mode, isReplaying]);

  // Model Predictions map for all loaded flows
  const predictions = useMemo(() => {
    const map = new Map<string, AnomalyPrediction>();
    flows.forEach((flow) => {
      map.set(flow.id, evaluateFlow(flow));
    });
    return map;
  }, [flows]);

  // Calculate real metrics
  const metrics = useMemo(() => {
    return calculateModelMetrics(flows, predictions);
  }, [flows, predictions]);

  // CSV file upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDatasetName(file.name);
    setMode('DATASET_ANALYSIS');
    setIsReplaying(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSVContent(text);
        if (parsed.length > 0) {
          setFlows(parsed);
          setSelectedFlow(parsed[0]);
          setSelectedNode(null);
          setSelectedEdge(null);
        }
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      {/* Top Live SOC Header */}
      <Header
        mode={mode}
        setMode={setMode}
        isReplaying={isReplaying}
        setIsReplaying={setIsReplaying}
        recordCount={flows.length}
        threatCount={metrics.threatCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFileUpload={handleFileUpload}
        datasetName={datasetName}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 space-y-4">
        {activeTab === 'topology' && (
          <div className="space-y-4">
            <NetworkVisualizer
              flows={flows}
              predictions={predictions}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              selectedEdge={selectedEdge}
              setSelectedEdge={setSelectedEdge}
              onSelectFlow={(flow) => setSelectedFlow(flow)}
            />

            <ThreatPanel
              flow={selectedFlow}
              prediction={selectedFlow ? predictions.get(selectedFlow.id) : undefined}
              onClose={() => setSelectedFlow(null)}
            />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <AlertTimeline
                flows={flows}
                predictions={predictions}
                selectedFlow={selectedFlow}
                onSelectFlow={(flow) => setSelectedFlow(flow)}
              />
            </div>
            <div className="lg:col-span-4">
              <ThreatPanel
                flow={selectedFlow}
                prediction={selectedFlow ? predictions.get(selectedFlow.id) : undefined}
                onClose={() => setSelectedFlow(null)}
              />
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <ModelMetricsView
            metrics={metrics}
            datasetName={datasetName}
          />
        )}
      </main>

      {/* Privacy Modal */}
      <PrivacyNotice
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-[#161b22] border-t border-[#30363d] px-4 py-3 font-mono text-[11px] text-[#8b949e] flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-2">
          <span>CipherWatch AI Visualizer</span>
          <span>&bull;</span>
          <span className="text-[#f0f6fc]">CIC-IDS2017 Encrypted Traffic Engine</span>
        </div>
        <div>
          <span>Bespoke SOC Operator Interface &bull; Zero Payload Inspection</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
