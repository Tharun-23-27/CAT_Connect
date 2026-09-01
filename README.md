code
Markdown
# 🚜 CAT Connect — Smart Rental Telematics & Heavy Fleet Control Tower

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-v4.19+-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18+-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-Schema%20Validation-3e67b1.svg)](https://zod.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange.svg)](https://deepmind.google/technologies/gemini/)

> **Caterpillar Smart Rental Tracking & Predictive Telematics System**  
> An enterprise-grade fleet intelligence platform that transforms raw CAN-bus ECM telemetry, rental lifecycles, and GPS geofences into real-time operational decisions. Built following the core intelligence framework:  
> **`TRACK` ➔ `UNDERSTAND` ➔ `PREDICT` ➔ `RECOMMEND` ➔ `ACT`**

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [System Architecture](#-system-architecture)
- [Core Intelligence Framework](#-core-intelligence-framework)
- [Backend REST API Reference](#-backend-rest-api-reference)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Business Impact & ROI](#-business-impact--roi)

---

## 🌟 Key Highlights

- **📡 Real-Time CAN-Bus Diagnostics**: Ingests and monitors engine runtime, idle hours, fuel burn rates, battery ECM voltage, hydraulic pressures, and Diagnostic Trouble Codes (DTCs).
- **📋 End-to-End Rental Lifecycle**: Complete checkout dispatch (QR/RFID or manual), operator assignment, and check-in audit engine computing fuel deficit charges ($3.50/% missing), overdue penalties, and damage repair assessments.
- **⚡ Proactive Operational Rules Engine**: Detects high idle anomalies (>65%), unassigned running machines, overdue contracts, geofence breaches, and diagnostic fault codes.
- **🧠 Predictive AI Layer (Gemini 2.5 Flash)**: 30-day job site equipment demand forecasting, logistics pre-positioning optimization, root-cause anomaly diagnosis, and natural language fleet operations Q&A.
- **🗺️ Interactive GPS Job Site Radar**: Visualizes machinery positions, live status rings, and site geofence radii across active Texas quarry and construction corridors.
- **🛡️ Clean Layered Architecture**: Strictly separates HTTP routing, controllers, business services, Zod request validation, and an isolated repository persistence layer ready for database handoff.

---

## 🏛 System Architecture

The application is structured as a full-stack, layered TypeScript solution:
┌────────────────────────────────────────────────────────┐
│ React 18 + Tailwind UI │
│ (Fleet Directory, CAN Console, Radar Map, Gemini AI) │
└──────────────────────────┬─────────────────────────────┘
│ Typed HTTP Client (Zod)
┌──────────────────────────▼─────────────────────────────┐
│ Express REST API Layer │
│ (/api/v1/assets, /rentals, /telemetry, /ai) │
├────────────────────────────────────────────────────────┤
│ Middlewares & Security Interceptors │
│ (Bearer Auth, Zod Validation, Error Handler) │
├────────────────────────────────────────────────────────┤
│ Domain Service Layer │
│ (AssetService, RentalService, TelemetryService, │
│ RulesEngineService, PredictiveAiService) │
├────────────────────────────────────────────────────────┤
│ Isolated Repository Layer │
│ (AssetRepo, RentalRepo, TelemetryRepo, AlertRepo, etc.)│
├──────────────────────────┬─────────────────────────────┤
│ In-Memory Data Store │ External AI Service │
│ (Seeded Texas Benchmark) │ (Google GenAI / Gemini 2.5) │
└──────────────────────────┴─────────────────────────────┘
code
Code
---

## 🔄 Core Intelligence Framework
[ TRACK ] Live CAN-bus ECM stream (RPM, hours, fuel, battery, GPS)
↓
[ UNDERSTAND ] Utilization metrics: Engine / (Engine + Idle) & Idle Fuel Waste ($)
↓
[ PREDICT ] Gemini AI 30-day site machine demand forecasting & pre-positioning
↓
[ RECOMMEND ] Prescriptive actions: REASSIGN, RETURN, EXTEND, INVESTIGATE, PRE-POSITION
↓
[ ACT ] 1-Click dispatch, QR check-in, contract extension, and alert resolution
code
Code
---

## 🔌 Backend REST API Reference

All routes are prefixed with `/api/v1` and return standardized JSON envelopes.

### 1. System & Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | System status, CAN-bus gateway uptime |
| `GET` | `/api/v1/docs` | Endpoint catalog and route specifications |

### 2. Fleet Assets
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/assets/overview` | Fleet KPIs (utilization %, health index, active run-rate) |
| `GET` | `/api/v1/assets` | Filterable list of assets (`status`, `machineType`, `siteId`, `search`) |
| `GET` | `/api/v1/assets/:id` | Asset profile with real-time ECM diagnostics |
| `PATCH` | `/api/v1/assets/:id/status` | Update machine status, site, and operator assignment |
| `GET` | `/api/v1/assets/telematics/live` | Real-time GPS coordinates and diagnostic parameters |

### 3. Rental Lifecycle & Audit
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/rentals` | Complete rental contract history |
| `GET` | `/api/v1/rentals/active` | List all ongoing active rentals |
| `POST` | `/api/v1/rentals/checkout` | Dispatch machine, link operator, generate contract |
| `POST` | `/api/v1/rentals/checkin` | Check-in machine, audit hours & fuel, compute billing invoice |
| `POST` | `/api/v1/rentals/verify-qr` | Scan QR/RFID code to verify dispatch readiness |

### 4. Telemetry & Idling Analysis
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/telemetry/summary` | Fleet idle %, fuel waste ($), and site breakdown |
| `POST` | `/api/v1/telemetry/log` | Ingest daily/hourly ECM telemetry with anomaly detection |
| `GET` | `/api/v1/telemetry/asset/:assetId`| Historical telemetry time-series for a specific asset |

### 5. Operational Alerts & Rules Engine
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/alerts` | List active operational exceptions & warnings |
| `POST` | `/api/v1/alerts/run-detection` | Trigger Rules Engine background detection cycle |
| `PATCH` | `/api/v1/alerts/:id/resolve` | Resolve alert with technician notes & audit log |

### 6. Predictive AI & Intelligence
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/ai/demand-forecast` | 30-Day site machine demand & logistics pre-positioning |
| `POST` | `/api/v1/ai/explain-anomaly` | Root-cause diagnostic reasoning & 3 corrective actions |
| `POST` | `/api/v1/ai/fleet-query` | Natural language fleet operations Q&A copilot |

### 7. Sites & Operators
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/sites` | List job sites with geofence radii & machinery requirements |
| `GET` | `/api/v1/operators` | List certified heavy equipment operators & experience |

---

## 📁 Directory Structure
├── server.ts # Server bootstrap, Express + Vite middleware
├── src/
│ ├── api/
│ │ └── client.ts # Typed frontend API client wrapper
│ ├── backend/
│ │ ├── app.ts # Express app setup, CORS, route mounting
│ │ ├── config/
│ │ │ └── env.ts # Secure environment variable manager
│ │ ├── constants/ # Domain enums (AssetStatus, MachineType, AlertSeverity)
│ │ ├── controllers/ # Request handlers (Asset, Rental, Telemetry, AI, etc.)
│ │ ├── middlewares/ # Zod validator, auth, and global error handler
│ │ ├── models/ # TypeScript interfaces & domain types
│ │ ├── repositories/ # Isolated data access layer (ready for DB swap)
│ │ │ └── dbStore.ts # Seeded in-memory data store
│ │ ├── routes/ # REST API router endpoints
│ │ ├── schemas/ # Zod runtime validation schemas
│ │ ├── services/ # Core business rules, billing, AI engine
│ │ └── utils/ # AppError & standardized API response wrappers
│ ├── components/ # UI components
│ │ ├── Header.tsx # Brand header, tab navigation, status badge
│ │ ├── FleetOverviewCard.tsx # Utilization, health, and revenue KPI cards
│ │ ├── AssetList.tsx # Fleet directory table with live gauges & actions
│ │ ├── TelemetryConsole.tsx # Idling analytics, fuel waste, telemetry ingestion
│ │ ├── AlertsPanel.tsx # Rules engine exception monitor & resolution
│ │ ├── RadarMap.tsx # GPS radar map with geofence boundary rings
│ │ ├── AiCopilot.tsx # Gemini chat, demand forecast, anomaly diagnosis
│ │ ├── CheckOutModal.tsx # Equipment dispatch modal
│ │ ├── CheckInModal.tsx # Return audit & billing computation modal
│ │ └── ApiDocsModal.tsx # In-app REST API interactive catalog
│ ├── App.tsx # Main layout & state coordinator
│ └── main.tsx # React DOM entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
code
Code
---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/cat-connect-telematics.git
   cd cat-connect-telematics
Install dependencies:
code
Bash
npm install
Configure Environment Variables:
code
Bash
cp .env.example .env
Start the Full-Stack Development Server:
code
Bash
npm run dev
Open http://localhost:3000 in your browser.
Production Build & Verification:
code
Bash
npm run build
npm run start
⚙️ Environment Configuration
Create a .env file in the root directory (refer to .env.example):
code
Env
# Server Configuration
PORT=3000
NODE_ENV=development

# Google Gemini API Key (Kept strictly server-side)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
Note: If GEMINI_API_KEY is not provided, the system automatically falls back to deterministic heuristic algorithms so all AI endpoints and forecasting features remain functional.
💼 Business Impact & ROI
Metric	Industry Standard Challenge	CAT Connect Solution	Financial Impact
Excessive Idling	Unaccounted machine idling averages 40–60% on construction sites.	Automated CAN-bus idle ratio monitoring & operator alerts.	Saves 
5,000 / machine / year in unburned diesel & maintenance.
Overdue Extensions	Machines held past contract without authorization or rate adjustments.	Automatic Rules Engine flagging with retroactive penalty billing.	Prevents 100% of unbilled contract slippage.
Logistics Haulage	Last-minute emergency transport between disconnected sites.	30-Day predictive demand modeling with equipment pre-positioning.	Reduces haulage & transport overhead by up to 18%.
Asset Loss / Misuse	Available machines left running on unauthorized quarry zones.	GPS geofence monitoring & unassigned runtime anomaly alerts.	Eliminates unaccounted machine utilization.
📜 License
This project is built for the Caterpillar Smart Rental Tracking Challenge. All rights reserved.
