# ReceiptAI - Modern Receipt Scanner & Budget Planner

ReceiptAI is a premium, full-stack application that seamlessly bridges physical and digital financial tracking. Leveraging **Machine Learning-driven OCR (EasyOCR)**, it allows users to scan their receipts, automatically extract merchant data, line items, and taxes, and predict spend categories. The platform then uses sophisticated charting and predictive modeling to offer **real-time 30-day budget forecasts** and anomaly detection. 

Following a complete design overhaul, ReceiptAI features a state-of-the-art **Shadcn-inspired UI** wrapped in a modern, animated dark theme.

---

## 🔥 Key Features

### Premium User Experience
* **Shadcn UI Aesthetics:** Highly polished interface utilizing soft glassmorphism, responsive CSS grid-based layouts, and customized translucent components.
* **Animated Top Nav Pill:** A modern floating top-navigation system engineered with `framer-motion` for buttery smooth tab transitions.
* **Smart Spinners:** Custom animated loaders that dynamically react to application states and processing delays.

### Machine Learning Core
* **Receipt Scanning:** Instantaneously parse uploaded receipt images using `EasyOCR` built on PyTorch.
* **Intelligent Extraction:** Automatically categorizes purchases, separates taxes from net totals, and isolates itemized quantities and prices.
* **Anomaly Detection:** Rule-based algorithm designed to alert users immediately if a scanned receipt drastically exceeds average historical transaction thresholds.
* **Rolling 30-Day Forecast:** Live predictive analytics calculate real-time trends using dynamic historical data rather than manual date windows. 

### Extensive Spend Management 
* **Custom Budget Tracking:** Completely customizable budget limits per-category tracking (e.g. strict budgets for Entertainment/Dining, optional for Healthcare).
* **Deep Analytics Dashboard:** Visualized financial footprints modeled natively using `recharts` (Area splines, Bar charts, interactive categorical Pie rings).
* **Expense Moderation:** Search, filter, inspect, and delete extracted historical records with ease.

### Secure Ecosystem
* **Multi-Auth Pipelines:** Integrated robust Email/Password routines alongside token-based **Google OAuth** SSO integration.
* **Per-User Silos:** Secured Postgres database guaranteeing absolute financial isolation for user documents via JWT authorization mechanisms.

---

## 🛠️ Technology Stack

**Frontend Architecture:**
* **React + Vite** (Ultra-fast HMR and frontend bundling)
* **Tailwind CSS V3** (Custom extensive styling layer without Preflight conflicts)
* **Framer Motion** (Spring physics and dynamic layout animations)
* **Recharts** (Performance-first analytical charting)
* **Lucide-React** (Lightweight scalable icon packages)
* **Google OAuth SDK**

**Backend Architecture:**
* **Python + Flask**
* **Flask-CORS** (Secure cross-origin definitions)
* **SQLAlchemy ORM** (Model mapping and relational querying)
* **Alembic** (Reliable remote database migrations)
* **EasyOCR & PyTorch** (Optical character recognition engine and modeling operations)
* **Pillow & NumPy** (Image sanitization and matrix processing prior to inference)

**Infrastructure:**
* **PostgreSQL (Neon)** - Serverless and highly accessible backing.
