# ReceiptAI — ML-Powered Receipt Scanner & Budget Planner

> Built from `SRS_ReceiptScanner_BudgetPlanner.docx`

---

## Getting Started

### 1. Backend (Flask API)
```bash
cd backend
copy .env.example .env
# Edit .env with your Neon/Postgres + Google values
pip install -r requirements.txt
alembic upgrade head
python app.py
# Runs at http://localhost:5000
```

Notes:
- `DATABASE_URL` is required (Neon Postgres connection string)
- `AUTO_CREATE_TABLES=true` is optional for local quick start, but migrations are recommended

### 2. Frontend (React + Vite)
```bash
cd frontend
copy .env.example .env
# Edit .env with your Google client id
npm install
npm run dev
# Runs at http://localhost:5173
```

### Login (required)
- The app now requires sign-in before accessing dashboard/scan/budget pages
- You can also create a new account from the login screen

---

## Project Structure

```
Reciept Scanner/
├── README.md
├── backend/
│   ├── app.py               ← Flask REST API + auth + OCR parsing
│   └── requirements.txt
└── frontend/
    ├── index.html
    └── src/
        ├── App.jsx           ← Root component + sidebar routing
        ├── index.css         ← Design system (dark mode, tokens)
        ├── api.js            ← Axios client → Flask backend
        ├── ToastContext.jsx
        ├── components/
        │   └── Sidebar.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── ScanPage.jsx
            ├── ExpensesPage.jsx
            ├── BudgetPage.jsx
            ├── AnalyticsPage.jsx
            ├── ForecastPage.jsx
            └── AnomaliesPage.jsx
```

---

## Dataset

The backend now starts with a **clean user account state** (no dummy expenses).
All budget charts, analytics, and anomalies are generated from your real scanned
receipts only.

### Receipt Templates Included

| Merchant | Category | Key Items |
|---|---|---|
| McDonald's India | Food & Dining | McChicken × 2, Fries × 2, Coke × 2 |
| Domino's Pizza | Food & Dining | Margherita, Chicken Pepperoni, Garlic Bread |
| KFC India | Food & Dining | Zinger Burger, Popcorn Chicken |
| Café Coffee Day | Food & Dining | Cappuccino × 2, Blueberry Muffin |
| Swiggy Order | Food & Dining | Chicken Biryani, Paneer Butter Masala |
| DMart | Groceries | Aashirvaad Atta, Amul Butter, Surf Excel |
| Reliance Fresh | Groceries | Onions, Tomatoes, Potatoes, Milk |
| Big Bazaar | Groceries | Fortune Rice, MDH Masala, Harpic |
| Uber India | Transportation | Koramangala→MG Road |
| Ola Cabs | Transportation | Whitefield→Airport + Toll |
| BMTC Bus | Transportation | AC Bus Ticket × 2 |
| Indian Oil Petrol Pump | Transportation | Petrol 8.5L |
| Apollo Pharmacy | Healthcare | Crocin, Dolo, Vitamin C, ORS |
| MedPlus | Healthcare | Azithromycin, Limcee, Vicks |
| PVR Cinemas | Entertainment | Gold Class × 2, Popcorn, Pepsi |
| BookMyShow | Entertainment | Arijit Singh Concert × 2 |
| BESCOM | Utilities | Electricity Bill February |
| Jio Fiber | Utilities | 150 Mbps Monthly Plan |
| Airtel Postpaid | Utilities | ₹499 Postpaid Plan |
| Myntra | Shopping | Allen Solly Shirt, Levi's Jeans |
| Amazon India | Shopping | boAt Airdopes, USB-C Cable |
| Decathlon | Shopping | Running Shoes, Dry-Fit T-Shirt |
| Udemy | Education | React + Node.js Course |
| Coursera | Education | Google Data Analytics Certificate |
| MakeMyTrip | Travel | Flight BLR→DEL × 2 |
| OYO Hotels | Travel | Deluxe Room × 2 nights |
| Nykaa | Personal Care | Foundation, Kajal, SPF50 |
| Lakme Salon | Personal Care | Haircut, Hair Spa |
| FedEx India | Miscellaneous | Express Courier |
| VLCC Fitness | Miscellaneous | Monthly Gym Membership |

### To connect a historical dataset
You can import previous transactions into your database and expose them through
the expenses APIs for each user.

---

## ML Pipeline Design (SRS §4)

All ML components below are **simulated** in the current build. The functions are clearly marked in `backend/app.py` — swap each simulation with the real library call.

### 4.1 OCR — PaddleOCR (DBNet + CRNN)
- **Text Detection:** DBNet (Differentiable Binarization) for bounding boxes
- **Text Recognition:** CRNN with CTC loss for character sequence recognition
- **Fallback:** Tesseract 5.0 LSTM-based engine for high-contrast receipts
- **Target Accuracy:** 94%+ on clean receipts, 88%+ on low-quality images

```python
# Production swap in run_ocr_pipeline():
from paddleocr import PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')
result = ocr.ocr(image_path, cls=True)
```

### 4.2 Named Entity Recognition — BERT (fine-tuned on SROIE)
- Model: `bert-base-uncased` fine-tuned on SROIE dataset
- Extracts: Merchant name, Date/Time, Total, Tax, Line items, Address
- F1-Score Target: 0.92+ on key fields

```python
# Production swap:
from transformers import pipeline
ner = pipeline("ner", model="your-sroie-finetuned-bert")
entities = ner(ocr_text)
```

### 4.3 Expense Classification — SVM + Random Forest Ensemble
- Features: TF-IDF vectors of OCR text + amount
- Categories: 11 classes (Food & Dining, Groceries, Transportation, etc.)
- Method: Soft-voting ensemble of LinearSVC + RandomForestClassifier

```python
# Production swap in classify_expense():
import joblib
clf = joblib.load('models/expense_classifier.pkl')
prediction = clf.predict([tfidf_features])
```

### 4.4 Budget Forecasting — LSTM + ARIMA

#### LSTM
- Input: 90-day rolling window of daily spend per category
- Architecture: 2-layer LSTM (128 units → 64 units) + Dense output
- Optimizer: Adam, MSE loss, Dropout 0.2
- Output: 30-day ahead spend forecast per category

#### ARIMA / SARIMA
- Used for seasonal patterns (monthly salary cycles, holiday spending)
- Parameter selection: Auto-ARIMA via AIC/BIC criteria
- SARIMA covers weekly + monthly seasonality

```python
# Production swap in generate_forecast():
import tensorflow as tf
model = tf.keras.models.load_model('models/lstm_forecast.h5')
forecast = model.predict(rolling_window_input)
```

### 4.5 Anomaly Detection — Isolation Forest
- Algorithm: Sklearn IsolationForest (unsupervised)
- Contamination: 5% (tunable per user)
- Trigger: Score fires when `amount > 2.5× category_average`
- Generates real-time alerts per transaction

```python
# Production swap in detect_anomaly():
from sklearn.ensemble import IsolationForest
model = IsolationForest(contamination=0.05)
model.fit(category_amounts)
score = model.decision_function([[amount]])
```

---

## Image Preprocessing Pipeline (SRS §3.2.1)

Before OCR, each uploaded receipt image goes through:

1. **Grayscale conversion** + CLAHE (adaptive histogram equalization)
2. **Deskewing** via Hough Line Transform (corrects ±30°)
3. **Gaussian blur** for noise reduction
4. **Otsu's binarization** for clean black/white text
5. **Perspective correction** for angled photos
6. **Resolution normalization** to 300 DPI

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System status |
| `POST` | `/api/auth/register` | Register new account |
| `POST` | `/api/auth/login` | Login and get bearer token |
| `GET` | `/api/auth/me` | Validate current session |
| `POST` | `/api/auth/logout` | Logout current session |
| `POST` | `/api/receipts/scan` | Scan receipt (base64 image body) |
| `GET` | `/api/expenses` | List expenses (`?category=&limit=`) |
| `DELETE` | `/api/expenses/<id>` | Delete expense |
| `GET` | `/api/budget` | Budget summary per category |
| `PUT` | `/api/budget/<category>` | Update budget limit `{ "limit": 5000 }` |
| `GET` | `/api/settings/budget-config` | Get user budget settings config |
| `PUT` | `/api/settings/budget-config` | Save enabled categories + limits |
| `GET` | `/api/analytics/summary` | Aggregated analytics |
| `GET` | `/api/forecast` | 30-day forecast per category |
| `GET` | `/api/anomalies` | Flagged anomalous transactions |

### Budget setup behavior
- Budget categories are now user-configured in `Settings`
- `Budget Manager` requires setup before showing budget cards
- `Healthcare` can be enabled or disabled by the user (optional category)

---

## Design System (SRS §8.2)

| Token | Value | Usage |
|---|---|---|
| Primary | `#2563EB` | Buttons, active nav, charts |
| Success | `#10B981` | Good budget status, positive trends |
| Warning | `#F59E0B` | Approaching limit, medium anomaly |
| Error | `#EF4444` | Over budget, high anomaly |
| Font | Inter (Google Fonts) | All text |
| Spacing | 8px base grid | All padding/margin |
| Theme | Dark mode | `--bg: #0A0F1E` |

---

## Production Dependencies (SRS §9.3)

```
# ML / Backend
paddlepaddle >= 2.5
paddleocr >= 2.7
transformers >= 4.35     # BERT / HuggingFace
tensorflow >= 2.13       # LSTM forecasting
scikit-learn >= 1.3      # SVM, Random Forest, Isolation Forest
spacy >= 3.6             # NLP preprocessing
pmdarima >= 2.0          # Auto-ARIMA

# Infrastructure
postgresql >= 15          # Structured expense storage
redis >= 7.0              # API response caching
mlflow                    # Model tracking & monitoring
```

---

## References (SRS §1.5)

- IEEE Std 830-1998 — IEEE Recommended Practice for SRS
- [SROIE Dataset](https://rrc.cvc.uab.es/?ch=13) — ICDAR 2019 Scanned Receipts Competition
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) — DBNet + CRNN OCR engine
- [scikit-learn](https://scikit-learn.org/) — SVM, Random Forest, Isolation Forest
- [TensorFlow/Keras](https://www.tensorflow.org/) — LSTM forecasting model
- Receipt-200K — Large-scale receipt recognition dataset
