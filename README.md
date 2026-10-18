# Data-Driven Optimization of Delivery Logistics in Supply Chain

An enterprise full-stack web application designed for analyzing, predicting, simulating, and optimizing complex multimodal delivery operations across nationwide supply chains.

Built using **React**, **TypeScript**, and **Tailwind CSS** on the frontend, and **Python FastAPI** with **Scikit-Learn** on the backend. The application is powered exclusively by the dataset `Logistics_Delivery_Dataset_with_coords.csv` (25,000 shipments, 63 raw attributes + 11 engineered features).

---

## Architecture Overview

```
logistics-optimization-app/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entrypoint & middleware
│   │   ├── data_store.py            # In-memory dataframe and model cache
│   │   └── routes/
│   │       ├── overview.py          # Module 1: KPIs, monthly trends & fleet share
│   │       ├── quality.py           # Module 2: Missing values, validation & IQR outliers
│   │       ├── prediction.py        # Module 3: Scikit-learn delay prediction & metrics
│   │       ├── routes_geo.py        # Module 4: GPS coordinates, corridors & route types
│   │       ├── performance.py       # Module 5: 3PL partners, powertrain, weather & traffic
│   │       ├── whatif.py            # Module 6: Interactive scenario simulation
│   │       ├── optimization.py      # Module 7: Strategic recommendations & ROI
│   │       └── deliveries.py        # Module 8: Searchable data explorer & CSV export
│   ├── data/
│   │   ├── raw/                     # Original preserved dataset (read-only)
│   │   └── cleaned/                 # Cleaned dataset & data_quality_report.json
│   ├── ml/
│   │   ├── model_trainer.py         # Leakage-free training script
│   │   └── models/                  # Serialized delay_classifier.joblib & metadata
│   ├── pipeline/
│   │   └── data_pipeline.py         # Automated ETL, validation & feature engineering
│   ├── requirements.txt             # Python dependencies
│   └── run_backend.py               # Uvicorn server launcher
├── frontend/
│   ├── src/
│   │   ├── components/              # Modular UI components for all 8 modules
│   │   │   ├── Navbar.tsx
│   │   │   ├── OverviewModule.tsx
│   │   │   ├── DataQualityModule.tsx
│   │   │   ├── DelayPredictionModule.tsx
│   │   │   ├── RouteRegionalMapModule.tsx
│   │   │   ├── PerformanceModule.tsx
│   │   │   ├── WhatIfAnalysisModule.tsx
│   │   │   ├── OptimizationModule.tsx
│   │   │   └── DeliveriesExplorerModule.tsx
│   │   ├── services/
│   │   │   └── api.ts               # API client service
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interface contracts
│   │   ├── App.tsx                  # Root dashboard layout
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Tailwind directives & styles
│   ├── index.html                   # HTML template with Leaflet assets
│   ├── package.json                 # React 18, Vite, Recharts, Lucide, Leaflet
│   ├── tailwind.config.js           # Modern theme tokens
│   └── vite.config.ts               # Vite proxy to backend port 8000
├── start_all.bat                    # One-click launcher for both services
├── start_backend.bat                # Backend launcher script
├── start_frontend.bat               # Frontend launcher script
└── README.md                        # Documentation
```

---

## 8 Core Functional Modules

### 1. Overview Dashboard
- **Key Performance Indicators (KPIs)**: Total deliveries (25,000), on-time delivery rate (73.32%), delay rate (26.68%), average delivery duration (27.58 hrs), total delivery cost (₹21.62M), net profit (₹1.05M), and total carbon emissions (562.8 metric tonnes).
- **Monthly Trajectory Chart**: Dual-axis visualization comparing delivery volume against delay rates across calendar months.
- **Fleet Modality Share**: Interactive donut chart detailing vehicle mix (Truck, Van, EV Van, Bike, EV Bike).
- **Logistics Partner Reliability**: Summary table comparing 3PL vendors on volume, delay %, customer rating, and unit economics.

### 2. Data Quality & Pipeline Integrity
- **Pipeline Preservation**: Original raw dataset is preserved unchanged in `backend/data/raw/`, and the cleaned dataset is saved separately in `backend/data/cleaned/`.
- **Quality Score Gauge**: Composite 100.0% data quality score based on completeness, uniqueness, and rule validity.
- **Rule Validation**: Automated checks for unique delivery IDs, positive transit distances/weights, geographic coordinate bounds, rating bounds [1.0, 5.0], and index scales [0, 100].
- **Tukey IQR Outlier Screening**: Interactive table reporting Q1, Q3, IQR, lower/upper bounds, and outlier percentages for continuous operational variables.

### 3. Delivery Delay ML Prediction
- **Zero Data Leakage**: Excludes all post-trip feedback (actual delivery duration, late penalty fees, recorded GPS deviation, and customer satisfaction ratings). Only features known at dispatch are used.
- **Model Evaluation**: Trained using an 80/20 stratified split:
  - **Accuracy**: 92.42%
  - **Precision**: 81.39%
  - **Recall**: 92.80%
  - **F1-Score**: 86.73%
  - **ROC-AUC**: 97.83%
- **Interactive Prediction Form**: Allows dispatchers to input planned consignment parameters and returns real-time delay probability, risk classification (Low / Moderate / High), contributing risk drivers, and actionable dispatch mitigations.

### 4. Route & Regional Geographic Analysis (GIS)
- **Interactive Network Map**: Built with Leaflet, plotting:
  - 5 Central Logistics Warehouses (Mumbai, Nagpur, Kolkata, Delhi, Bangalore)
  - 12 Source Dispatch Hubs & Destination Cities
  - 20 Regional Hubs with road quality indices and delivery density
  - Top 15 busiest transport corridors with polyline color-coding (Green for low delay, Red for severe delay)
- **Route Dynamics**: Comparative breakdown of velocity, road quality, and stops between Highway, Urban, and Rural routes.
- **Multi-Stop Escalation**: Step-wise curve demonstrating delay escalation from 1 to 6 stops.

### 5. Logistics Performance Analysis
- **3PL Partner Scorecard**: Multi-metric comparison of Delhivery, Xpressbees, Shadowfax, DHL, Amazon Logistics, and regional couriers.
- **Fleet & Powertrain**: Internal combustion vs Electric Vehicle (EV) economics, fuel costs, and carbon abatement.
- **Weather Impact**: Severe weather correlation against transit delay minutes and GPS route deviations.
- **Traffic & Congestion**: Delays during peak rush hours vs off-peak windows.

### 6. Interactive What-If Scenario Simulator
- **Simulation Tagging**: Clear visual indicators distinguishing simulated scenarios from empirical baseline data.
- **Side-by-Side Comparison**: Modify distance, traffic level, weather condition, vehicle modality, and waypoint stops.
- **Telemetry Deltas**: Instant side-by-side computation of changes in delivery time (hrs), delay probability (%), operating cost (₹), fuel expense (₹), and carbon emissions (kg).

### 7. Supply Chain Optimization Strategies
- **Data-Backed Recommendations**:
  1. *Fleet Electrification on Sub-120km Urban Corridors* (slash emissions by 78% and fuel cost by 65%).
  2. *Peak Congestion & Rush-Hour Window Shifting* (mitigate late delivery penalties).
  3. *Multi-Stop Routing Rationalization* (cap stops to 2-3 to prevent compounding delays).
  4. *Vehicle Capacity Utilization Consolidation* (enforce 75% load threshold to reverse negative margins).
- **Projected Impact**: Annual cost savings of ₹3.82M, 142.6 Tonnes CO2 abated, and a 24.5% reduction in delay rate.

### 8. Deliveries Explorer & CSV Export
- **Searchable Table**: Real-time text search across delivery ID, source city, destination city, region, and partner.
- **Multi-Dimension Filters**: Filter by partner, vehicle type, traffic level, weather, operational zone, and delay status.
- **Pagination & Sorting**: Fast server-side pagination with dynamic column sorting.
- **Streaming CSV Export**: One-click download of the active filtered query or full dataset.

---

## Setup & Running Instructions

### Prerequisites
- Python 3.10+ (Python 3.13 tested)
- Node.js 18+ & npm 9+ (Node 22.16 tested)

### 1. Launching via One-Click Batch Script (Windows)
Double-click `start_all.bat` in the project root directory. This will automatically open two terminal windows:
- Terminal 1: FastAPI Backend (`http://127.0.0.1:8000`)
- Terminal 2: Vite React Frontend (`http://localhost:5173`)

---

### 2. Manual Startup Instructions

#### Step A: Backend Setup
```powershell
cd backend

# Install dependencies (already installed if using local Python 3.13)
pip install -r requirements.txt

# Run the automated data pipeline (cleans data & generates data_quality_report.json)
python pipeline/data_pipeline.py

# Train the ML delay prediction model
python ml/model_trainer.py

# Start the FastAPI server
python run_backend.py
```
Backend API will be accessible at `http://127.0.0.1:8000`.
Interactive Swagger API documentation is available at `http://127.0.0.1:8000/docs`.

#### Step B: Frontend Setup
```powershell
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Vite development server
npm run dev
```
Frontend Dashboard will be accessible at `http://localhost:5173`.
#   D a t a - D r i v e n - O p t i m i z a t i o n - o f - D e l i v e r y - L o g i s t i c s - i n - S u p p l y - C h a i n  
 