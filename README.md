# SignLang AI

A full two-way ASL sign language system — live gesture recognition, animated learning dictionary, text-to-sign player, and custom model training. Built with a cinematic dark UI inspired by the Horizon aesthetic.

**Built by [Arihant Khaitan](https://github.com/ArihantKhaitan) with [Claude](https://claude.ai)**

---

## Features

| Feature | Description |
|---|---|
| **Live Interpreter** | Webcam-based real-time ASL recognition via MediaPipe + RandomForest. Builds full sentences hands-free with hold-detection and auto-spacing. |
| **Text-to-Sign Player** | Type any sentence and watch it fingerspelled letter-by-letter using animated ASL GIFs. Adjustable playback speed. |
| **Learn ASL** | Animated reference cards for the full A–Z alphabet, numbers 0–9, and common phrases. Includes an interactive quiz mode. |
| **Data Collection** | Capture custom gesture samples directly from your webcam with a live progress bar. |
| **Model Training** | Train a personal RandomForest classifier on your collected data in under 5 seconds. No GPU required. |
| **Text-to-Speech** | Hit Speak to hear the interpreted sentence read aloud via the system TTS engine. |

---

## Tech Stack

**Backend** — Python 3.13, Flask, MediaPipe Tasks API (`HandLandmarker`), scikit-learn (RandomForest), OpenCV, pyttsx3

**Frontend** — React 18, Vite, Tailwind CSS, React Router, Lucide Icons

**ML Pipeline** — 63-dim normalized hand landmark vectors (21 × x/y/z), centered at wrist, scaled by wrist→middle-MCP distance. RandomForest with 250 estimators.

---

## Project Structure

```
SignLang/
├── backend/
│   ├── app.py                  # Flask entry point (port 8001)
│   ├── routes.py               # All API routes
│   ├── mediapipe_hands.py      # MediaPipe Tasks API camera + landmark extraction
│   ├── asl_classifier.py       # RandomForest classifier wrapper
│   ├── sentence_builder.py     # Hold-detection sentence builder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StarField.jsx   # Canvas animated starfield
│   │   │   ├── HeroBackground.jsx  # SVG mountains + nebula + light beam
│   │   │   └── CameraView.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Cinematic hero landing
│   │   │   ├── Interpreter.jsx
│   │   │   ├── Learn.jsx
│   │   │   ├── SignPlayer.jsx
│   │   │   ├── DataCollection.jsx
│   │   │   └── Training.jsx
│   │   └── App.jsx
│   ├── index.html
│   └── vite.config.js
├── legacy_code/                # Original forked scripts (archived)
└── run.bat                     # One-click launcher (Windows)
```

---

## Setup & Installation

### Prerequisites
- Python **3.13** (tested; 3.10+ should work)
- Node.js **18+**
- A webcam

### 1 — Clone the repo

```bash
git clone https://github.com/ArihantKhaitan/SignLang.git
cd SignLang
```

### 2 — Backend

```bash
cd backend
pip install -r requirements.txt
```

> On first run, `mediapipe_hands.py` will automatically download the `hand_landmarker.task` model (~3 MB) from Google's CDN.

### 3 — Frontend

```bash
cd frontend
npm install --ignore-scripts
```

> `--ignore-scripts` avoids an esbuild postinstall issue on newer Node/Python versions.

### 4 — Run

**Windows (one click):**
```
run.bat
```

**Manual:**
```bash
# Terminal 1 — backend
cd backend && python app.py

# Terminal 2 — frontend
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3010 |
| Backend API | http://localhost:8001 |

---

## Usage Guide

### Collecting gesture data
1. Open **Collect** in the nav
2. Pick a letter (A–Z) or type a custom label
3. Set sample count (300 recommended) and click **Start Capture**
4. Hold the sign steady in front of your camera
5. Repeat for each gesture you want the model to recognise

### Training
1. Go to **Train** — you'll see a bar chart of your collected samples
2. Click **Start Training** — the model trains in under 5 seconds
3. A green status pill confirms the model is active

### Using the interpreter
1. Open **Interpreter** — the live camera feed starts immediately
2. Make an ASL sign and hold it for **1.5 seconds** to register a letter
3. Pause for **2 seconds** to end a word
4. Use the **Del / Space / Speak / Clear** buttons, or train SPACE and DEL signs for fully hands-free operation

### Learning ASL
- Browse the **Alphabet**, **Numbers**, and **Phrases** tabs for animated reference cards
- Click any card to open the full detail view with tips and similar-sign comparisons
- Take the **Quiz** to test yourself with 10 random multiple-choice questions

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/video_feed` | MJPEG camera stream |
| GET | `/api/predict` | Current prediction + sentence state |
| GET | `/api/status` | Model status, sample counts, labels |
| POST | `/api/capture/start` | Start data collection `{label, target}` |
| POST | `/api/capture/stop` | Stop data collection |
| POST | `/api/train` | Train the classifier |
| POST | `/api/tts` | Text-to-speech `{text}` |
| POST | `/api/sentence/clear` | Clear sentence |
| POST | `/api/sentence/backspace` | Delete last character |
| POST | `/api/sentence/space` | Insert word space |

---

## Troubleshooting

**Camera not showing**
- Make sure the backend is running on port 8001
- The Vite proxy forwards `/api/*` to the backend — no CORS issues in dev

**`module 'mediapipe' has no attribute 'solutions'`**
- This means you have mediapipe ≥ 0.10.33 which removed the legacy `solutions` API
- The code already uses the Tasks API (`mp.tasks.vision.HandLandmarker`) — just make sure you installed from `requirements.txt`

**`npm install` fails**
- Use `npm install --ignore-scripts` to skip the esbuild postinstall script

**Python version conflicts**
- If `python` on your PATH is not 3.13, edit `run.bat` to use the full path to your Python 3.13 executable

---

## License

MIT
