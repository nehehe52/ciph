import React from 'react';
import { ShieldCheck, Lock, EyeOff, X } from 'lucide-react';

interface PrivacyNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-2xl w-full p-6 text-xs font-mono space-y-4 text-[#c9d1d9] shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
          <div className="flex items-center space-x-2 text-[#58a6ff]">
            <Lock className="w-5 h-5" />
            <h2 className="font-bold text-sm text-[#f0f6fc] uppercase tracking-wider">
              Privacy &amp; Non-Decryption Architecture Disclosure
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#21262d] rounded text-[#8b949e] hover:text-[#f0f6fc]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Notice Points */}
        <div className="space-y-3">
          <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded space-y-1.5">
            <span className="text-[#3fb950] font-bold uppercase flex items-center space-x-1.5">
              <EyeOff className="w-4 h-4" />
              <span>Metadata-Only Analysis Policy</span>
            </span>
            <p className="text-[#8b949e] leading-relaxed">
              CipherWatch AI strictly evaluates non-content transport layer telemetry (e.g., packet arrival time deltas, forward/backward byte distributions, packet length variance, and IP header metrics).
            </p>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded space-y-1.5">
            <span className="text-[#58a6ff] font-bold uppercase flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Payload Decryption Guarantee</span>
            </span>
            <ul className="list-disc list-inside text-[#8b949e] space-y-1 leading-relaxed">
              <li>No TLS/SSL certificate interception or man-in-the-middle proxying.</li>
              <li>No packet payload inspection or credential harvesting.</li>
              <li>Fully compliant with end-to-end user data privacy and SOC2 isolation boundaries.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#21262d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#f0f6fc] font-bold rounded"
          >
            Acknowledge &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
