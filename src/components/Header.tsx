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
  VolumeX,
  Radio
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
    <header className="bg-[#0b0f19] border-b border-[#1f293d] text-[#c9d1d9] sticky top-0 z-40 shadow-xl font-mono">
      {/* Top Bar */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & System Status Tag */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#111827] border border-[#00e5ff]/40 rounded text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base tracking-wider text-[#f0f6fc] uppercase">
                  CipherWatch <span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">AI</span>
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] uppercase bg-[#111827] text-[#00ff66] border border-[#00ff66]/30 rounded tracking-widest font-bold">
                  [SYS.ONLINE]
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e]">
                Tactical Encrypted Traffic Anomaly Detection &amp; Visualizer Console
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-[#1f293d] text-xs">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff66] led-green"></span>
            </span>
            <span className="text-[#00ff66] uppercase font-bold tracking-wider">[ENGINE_ACTIVE]</span>
          </div>
        </div>

        {/* View Mode Switcher Tab Buttons */}
        <div className="flex items-center bg-[#111827] border border-[#1f293d] p-1 rounded text-xs">
          <button
            onClick={() => setActiveTab('topology')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all duration-150 ${
              activeTab === 'topology'
                ? 'bg-[#1f293d] text-[#00e5ff] border border-[#00e5ff]/40 font-bold shadow-[0_0_8px_rgba(0,229,255,0.2)]'
                : 'text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>[Topology Map]</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all duration-150 ${
              activeTab === 'events'
                ? 'bg-[#1f293d] text-[#00e5ff] border border-[#00e5ff]/40 font-bold shadow-[0_0_8px_rgba(0,229,255,0.2)]'
                : 'text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>[Threat Log]</span>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all duration-150 ${
              activeTab === 'metrics'
                ? 'bg-[#1f293d] text-[#00e5ff] border border-[#00e5ff]/40 font-bold shadow-[0_0_8px_rgba(0,229,255,0.2)]'
                : 'text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>[Model Metrics]</span>
          </button>
        </div>

        {/* Control Controls & Replay / Dataset Switch */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center space-x-1 px-2.5 py-1 border rounded transition-colors ${
              soundEnabled
                ? 'border-[#00e5ff]/50 bg-[#00e5ff]/10 text-[#00e5ff] font-bold'
                : 'border-[#1f293d] bg-[#111827] text-[#8b949e]'
            }`}
            title={soundEnabled ? 'Threat Audio Warning Beeps Active' : 'Threat Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#00e5ff]" /> : <VolumeX className="w-3.5 h-3.5 text-[#8b949e]" />}
            <span className="hidden sm:inline">{soundEnabled ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
          </button>

          {/* Mode toggle */}
          <div className="flex items-center bg-[#111827] border border-[#1f293d] rounded p-0.5">
            <button
              onClick={() => {
                setMode('DATASET_ANALYSIS');
                setIsReplaying(false);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                mode === 'DATASET_ANALYSIS'
                  ? 'bg-[#1f293d] text-[#00ff66] font-bold border border-[#00ff66]/40'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
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
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                mode === 'DEMO_REPLAY'
                  ? 'bg-[#1f293d] text-[#00e5ff] font-bold border border-[#00e5ff]/40'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>REPLAY</span>
            </button>
          </div>

          {/* Demo Replay Pause/Play if in demo mode */}
          {mode === 'DEMO_REPLAY' && (
            <button
              onClick={() => setIsReplaying(!isReplaying)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border font-bold transition-all ${
                isReplaying
                  ? 'border-[#ffb000] bg-[#ffb000]/10 text-[#ffb000]'
                  : 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
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
            className="flex items-center space-x-1.5 px-3 py-1 bg-[#111827] hover:bg-[#1f293d] border border-[#00e5ff]/40 hover:border-[#00e5ff] rounded text-[#f0f6fc] font-bold transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)] cursor-pointer"
            title="Browse Local Files / Upload CIC-IDS2017 CSV"
          >
            <Upload className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>[ Browse Files ]</span>
          </button>

          {/* Privacy Button */}
          <button
            onClick={onOpenPrivacy}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#111827] hover:bg-[#1f293d] border border-[#1f293d] rounded text-[#8b949e] hover:text-[#f0f6fc]"
            title="Privacy & Non-Decryption Architecture"
          >
            <Lock className="w-3.5 h-3.5 text-[#00ff66]" />
            <span className="hidden sm:inline">PRIVACY</span>
          </button>
        </div>
      </div>

      {/* Metric Telemetry Ticker */}
      <div className="bg-[#111827] border-t border-[#1f293d] px-4 py-1 flex flex-wrap items-center justify-between text-xs text-[#8b949e]">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5">
            <span className="text-[#484f58]">SOURCE_DATASET:</span>
            <span className="text-[#f0f6fc] font-bold">{datasetName}</span>
            {mode === 'DEMO_REPLAY' && (
              <span className="px-1.5 py-0.2 bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 text-[10px] rounded uppercase font-bold flex items-center space-x-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>LIVE STREAM</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[#484f58]">PROCESSED_FLOWS:</span>
            <span className="text-[#00e5ff] font-bold">{recordCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[#484f58]">DETECTED_THREATS:</span>
            <span className={`font-bold ${threatCount > 0 ? 'text-[#ff3344] drop-shadow-[0_0_6px_rgba(255,51,68,0.5)]' : 'text-[#00ff66]'}`}>
              {threatCount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <span className="flex items-center space-x-1 text-[#00ff66]">
            <Cpu className="w-3 h-3" />
            <span>HEURISTIC + SUPERVISED MODEL</span>
          </span>
          <span className="text-[#484f58]">|</span>
          <span className="text-[#8b949e]">ZERO PAYLOAD INSPECTION</span>
        </div>
      </div>
    </header>
  );
};
