# 🚜 Caterpillar Equipment Rental Tracking & Operational Intelligence Control Tower

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

An enterprise-grade Fleet Management & Operational Intelligence Control Tower built for **Caterpillar Heavy Machinery Rental Operations**. Designed to optimize fleet utilization, automate predictive maintenance, enforce rental contract compliance, and streamline check-in/check-out workflows across jobsites.

---

## 🌟 Key Capabilities & Architectural Highlights

### 1. 5-Stage Operational Intelligence Pipeline
* **Track**: Real-time CAN-bus telematics ingestion (Engine Hours, RPM, Fuel % & DEF, Hydraulic Relief PSI, Battery Voltage, Vibration G-force).
* **Understand**: Automated anomaly and deviation signal detection:
  - `Signal 1 (Underutilization)`: Zero hours clocked during paid active rental lease.
  - `Signal 2 (Excessive Idle)`: Machines burning idle fuel (>9 hrs/day) with low work output.
  - `Signal 3 (Contract Breach)`: Unauthorized weekend / off-hours machinery operation.
* **Predict**: Regional demand forecasting across heavy equipment categories and jobsites with confidence scoring.
* **Recommend**: Context-aware AI recommendations for fleet rebalancing, contract extensions, and maintenance triage.
* **Act**: One-click actionable execution (`REASSIGN`, `EXTEND`, `INVESTIGATE`, `RETURN`, `PRE-POSITION`).

### 2. Caterpillar Problem Statement Benchmark (`EQX1001`–`EQX1007`)
* Built-in toggle between the **Official 7-Asset Benchmark Dataset** and the **Full Multi-Regional Fleet**.
* Pre-configured test assets evaluating Slide 41 scenarios with real-time simulated telemetry jitter.

### 3. GPS Geospatial Map & Geofence Intelligence
* Live multi-site interactive map with site clusters, radius overlays, and active asset positioning.
* Real-time geofence violation detection and unauthorized movement alerts.

### 4. Digital Equipment Check-In / Check-Out Wizard
* Multi-step inspection workflow:
  - Hour meter & fuel / DEF level logging.
  - 6-point visual walkaround inspection checklist (Hydraulics, Undercarriage/Tires, Cabin, Safety devices, Electrical).
  - Pre-existing damage photo logging & severity grading.
  - Digital inspector signature & PDF export generation.

### 5. Remote ECM Over-The-Air (OTA) Control Terminal
* Force GPS Heartbeat refresh.
* On-demand CAN-bus telemetry polling.
* Remote ignition immobilization & lockout control.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (Industrial Caterpillar Theme) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State & Data** | Context API + Reactive Telemetry Simulation Engine |

---

##  Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, pnpm, or bun

### Installation

1. **Clone the repository / branch:**
   ```bash
   git clone -b Tharun/control-tower https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
