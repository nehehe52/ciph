import React, { useRef } from 'react';
import {
  Shield,
  Activity,
  Play,
  Pause,
  Upload,
  Database,
  Lock,
  Cpu,
  BarChart3,
  Network,
  ListFilter,
  Volume2,
  VolumeX
} from 'lucide-react';
import { AnalysisMode } from '../types';

interface HeaderProps {
  mode: AnalysisMode;
  setMode: (mode: AnalysisMode) => void;
  isReplaying: boolean;
  setIsReplaying: (val: boolean) => void;
  recordCount: number;
  threatCount: number;
  activeTab: 'topology' | 'events' | 'metrics';
  setActiveTab: (tab: 'topology' | 'events' | 'metrics') => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  datasetName: string;
  onOpenPrivacy: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  isReplaying,
  setIsReplaying,
  recordCount,
  threatCount,
  activeTab,
  setActiveTab,
  onFileUpload,
  datasetName,
  onOpenPrivacy,
  soundEnabled,
  onToggleSound
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <header className="bg-[#0d1117] border-b border-[#30363d] text-[#c9d1d9] sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#161b22] border border-[#30363d] rounded text-[#58a6ff]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base tracking-wide text-[#f0f6fc] uppercase font-mono">
                  CipherWatch <span className="text-[#58a6ff]">AI</span>
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-[#21262d] text-[#8b949e] border border-[#30363d] rounded">
                  v2.4-SOC
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e]">
                Encrypted Traffic Anomaly Detection &amp; Telemetry SOC Visualizer
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-[#30363d] text-xs font-mono">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]"></span>
            </span>
            <span className="text-[#3fb950] uppercase font-semibold">Engine Active</span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#161b22] border border-[#30363d] p-1 rounded font-mono text-xs">
          <button
            onClick={() => setActiveTab('topology')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'topology'
                ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d] font-semibold'
                : 'text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Network Topology</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'events'
                ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d] font-semibold'
                : 'text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Threat Events</span>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'metrics'
                ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d] font-semibold'
                : 'text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Model Performance</span>
          </button>
        </div>

        {/* Control Controls & Replay / Dataset switch */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center space-x-1 px-2.5 py-1 border rounded transition-colors ${
              soundEnabled
                ? 'border-[#58a6ff]/40 bg-[#58a6ff]/10 text-[#58a6ff]'
                : 'border-[#30363d] bg-[#161b22] text-[#8b949e]'
            }`}
            title={soundEnabled ? 'Threat Alert Beeps Active' : 'Threat Alert Beeps Muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#58a6ff]" /> : <VolumeX className="w-3.5 h-3.5 text-[#8b949e]" />}
            <span className="hidden sm:inline">{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          {/* Mode toggle */}
          <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded p-0.5">
            <button
              onClick={() => {
                setMode('DATASET_ANALYSIS');
                setIsReplaying(false);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded ${
                mode === 'DATASET_ANALYSIS'
                  ? 'bg-[#21262d] text-[#3fb950] font-semibold border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>DATASET</span>
            </button>
            <button
              onClick={() => {
                setMode('DEMO_REPLAY');
                setIsReplaying(true);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded ${
                mode === 'DEMO_REPLAY'
                  ? 'bg-[#21262d] text-[#58a6ff] font-semibold border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>DEMO REPLAY</span>
            </button>
          </div>

          {/* Demo Replay Pause/Play if in demo mode */}
          {mode === 'DEMO_REPLAY' && (
            <button
              onClick={() => setIsReplaying(!isReplaying)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded border transition-colors ${
                isReplaying
                  ? 'border-[#d29922] bg-[#d29922]/10 text-[#d29922]'
                  : 'border-[#3fb950] bg-[#3fb950]/10 text-[#3fb950]'
              }`}
            >
              {isReplaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isReplaying ? 'PAUSE STREAM' : 'STREAM REPLAY'}</span>
            </button>
          )}

          {/* File Upload Trigger with Hidden HTML Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            accept=".csv,text/csv"
            className="hidden"
            aria-label="Upload CSV Dataset"
          />
          <button
            type="button"
            onClick={handleBrowseClick}
            className="flex items-center space-x-1.5 px-3 py-1 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded text-[#c9d1d9] transition-colors cursor-pointer"
            title="Browse Local Files / Upload CIC-IDS2017 CSV"
          >
            <Upload className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>Browse Local Files</span>
          </button>

          {/* Privacy Button */}
          <button
            onClick={onOpenPrivacy}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded text-[#8b949e] hover:text-[#c9d1d9]"
            title="Privacy & Non-Decryption Architecture"
          >
            <Lock className="w-3.5 h-3.5 text-[#3fb950]" />
            <span className="hidden sm:inline">PRIVACY METADATA</span>
          </button>
        </div>
      </div>

      {/* Metric Telemetry Ticker */}
      <div className="bg-[#161b22] border-t border-[#21262d] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono text-[#8b949e]">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5">
            <span className="text-[#484f58]">SOURCE DATASET:</span>
            <span className="text-[#f0f6fc] font-semibold">{datasetName}</span>
            {mode === 'DEMO_REPLAY' && (
              <span className="px-1.5 py-0.2 bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/30 text-[10px] rounded uppercase font-bold">
                REPLAY ACTIVE
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[#484f58]">PROCESSED FLOWS:</span>
            <span className="text-[#58a6ff] font-bold">{recordCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[#484f58]">DETECTED THREATS:</span>
            <span className={`font-bold ${threatCount > 0 ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>
              {threatCount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <span className="flex items-center space-x-1 text-[#3fb950]">
            <Cpu className="w-3 h-3" />
            <span>HEURISTIC + SUPERVISED MODEL</span>
          </span>
          <span className="text-[#484f58]">|</span>
          <span className="text-[#8b949e]">TLS/TCP METADATA ONLY</span>
        </div>
      </div>
    </header>
  );
};
