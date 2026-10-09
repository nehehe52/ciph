# CipherWatch AI — Encrypted Network Traffic Anomaly Detection Platform

CipherWatch AI is a bespoke, high-density Security Operations Center (SOC) visualizer and machine learning engine for encrypted network flow analysis and anomaly detection using the CIC-IDS2017 dataset.

---

## 🚀 Key Features

- **High-Density SOC Interface:** Styled with deep graphite surfaces (`#0d1117`, `#161b22`, `#21262d`), crisp monospaced telemetry data, and clear severity indicators (INFO, LOW, MEDIUM, HIGH).
- **Web Audio API Caution Beeps:** Synthesizes real-time double-beep warning audio alerts when high-severity network threats or suspicious flow details are detected.
- **Automated Firewall Rule Simulator:** Allows SOC analysts to generate `iptables` drop rules and toggle IP blocking/isolation directly from the Threat Telemetry panel.
- **Raw Packet Header Preview:** Renders transport frame hex dumps constructed strictly from IP/TCP header fields without payload decryption.
- **Incident Report Export:** One-click JSON incident report exporter detailing raw feature metrics, signature triggers, and analyst defensive recommendations.
- **CIC-IDS2017 Dataset Parser:** Fully compatible CSV loader with whitespace header trimming, NaN/missing value sanitization, and metric extraction (`src/lib/datasetLoader.ts`).
- **Real Model Metrics:** Calculates real, non-fabricated evaluation metrics (Accuracy, Precision, Recall, F1-Score) and Confusion Matrix breakdowns (`TP`, `FP`, `TN`, `FN`).
- **Interactive Network Topology:** Visualizes host nodes and connection edges dynamically filtered by IP/port telemetry, anomaly score sensitivity slider (0% - 90%), and protocol quick filters (TCP, UDP, ICMP).
- **Evidence-First Threat Event Timeline:** Filterable, searchable event log with monospaced timestamps and interactive row selection.
- **Dual Mode & Privacy Compliance:** Static `DATASET ANALYSIS` and real-time `DEMO REPLAY` mode with strict metadata-only non-decryption privacy disclosures.

---

## 🛠️ Windows PowerShell Quickstart Setup

Follow these commands in Windows PowerShell to set up and launch CipherWatch AI:

```powershell
# 1. Clone or navigate to the repository directory
cd C:\Users\avani\OneDrive\Desktop\ciph

# 2. Install dependencies
npm install

# 3. Launch the development server
npm run dev
```

The application will launch locally at `http://localhost:5173/`.

---

## 🏗️ Production Build & Verification

To verify the production build and type checking:

```powershell
# Run TypeScript compilation and Vite production build
npm run build
```

---

## 📂 CIC-IDS2017 Dataset Files

Pre-populated sample CIC-IDS2017 dataset CSV files are located in `MachineLearningCVE/`:
- `Monday-WorkingHours.pcap_ISCX.csv`
- `Wednesday-workingHours.pcap_ISCX.csv`

You can also load custom CIC-IDS2017 CSV files directly using the **"Browse Local Files"** button in the header bar.
