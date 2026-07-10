# SignLang AI

Real-time fingerspelling recognition for **ASL, BSL and ISL** that runs **entirely in your browser** — no Python backend, no server, no GPU required. Hand tracking via MediaPipe (WebAssembly), classification via custom-trained neural networks evaluated in plain JavaScript.

**Built by [Arihant Khaitan](https://github.com/ArihantKhaitan) with [Claude](https://claude.ai)**

---

## Features

| Feature | Description |
|---|---|
| **Live Interpreter** | Webcam sign recognition at 30–60 fps with a hand-skeleton overlay, in three languages: ASL (one-handed), BSL and ISL (two-handed). Hold a sign to register a letter; pause to end a word. |
| **Practice mode** | Type a word, and the interpreter shows each sign to copy — it advances automatically when you sign each letter correctly. |
| **Text-to-Sign Player** | Type any sentence and watch it fingerspelled letter-by-letter in ASL, BSL or ISL. |
| **Learn** | Reference cards for the alphabet and numbers in all three languages, animated ASL phrase signs, and a quiz mode. |
| **Text-to-Speech** | Completed words and sentences are read aloud with the browser's built-in speech engine. |

### Languages

| | Hands | Letters recognised | Digits recognised | Source data |
|---|---|---|---|---|
| **ASL** American Sign Language | 1 | A–Z | — (reference images for 1–10) | 10.8k photos ([Marxulia](https://huggingface.co/datasets/Marxulia/asl_sign_languages_alphabets_v03)) |
| **BSL** British Sign Language | 2 | A–Z except H, J, Y (motion) | 0–10 | 30.5k landmark samples ([datMaul](https://github.com/datMaul/BSL_Numbers_and_Alphabet_Recognition)) |
| **ISL** Indian Sign Language | 2 | A–Z except H, J, V | 0–9 | 9.1k photos ([akritRihal](https://huggingface.co/datasets/akritRihal/Indian_Sign_Language_dataset)) |

Reference imagery in Learn / Practice / Sign Player: ASL letters use Lifeprint animated GIFs and ASL numbers use tiles from Lifeprint's number chart; BSL signs are skeleton diagrams rendered from the median hand pose of the training data; ISL signs are photos from the training dataset. All assets are served locally from `frontend/public/signs/`.

---

## How the recognition works

1. **Hand tracking** — MediaPipe's `HandLandmarker` (Tasks API, WASM) finds 21 3-D landmarks per hand per frame, directly in the browser (one hand for ASL, two for BSL/ISL).
2. **Normalization** — landmarks are centered (wrist for ASL; mean of both wrists for BSL/ISL), scaled by hand size, and two-hand slots are ordered left-to-right. Features are position- and distance-invariant.
3. **Classification** — a small MLP per language, trained with mirror + rotation augmentation so both left- and right-handed signing works.
4. **Stabilization** — a majority-vote smoother over recent frames plus a hold-to-register timer turns noisy per-frame predictions into reliable letters.

The classifiers were trained offline with scikit-learn and exported to JSON; inference is a hand-rolled matrix multiply in [mlp.js](frontend/src/lib/mlp.js) — no TensorFlow.js needed.

The training pipeline guarantees that **the exact same landmark normalization** is used at training time (Python) and inference time (JavaScript) — a mismatch there is the classic reason landmark classifiers silently fail. The JS implementation is verified against the Python reference on held-out samples.

BSL reference diagrams in Learn/practice are skeleton renders of the median hand pose per letter from the training data; ISL references are photos from the dataset.

---

## Tech Stack

**Frontend** — React 19, Vite, `@mediapipe/tasks-vision`, Tailwind CSS, React Router, Lucide Icons

**ML pipeline (offline)** — MediaPipe HandLandmarker for landmark extraction, scikit-learn MLP, exported to JSON

---

## Project Structure

```
SignLang/
├── frontend/
│   ├── public/
│   │   ├── models/hand_landmarker.task   # MediaPipe hand model (offline)
│   │   └── wasm/                         # MediaPipe WASM runtime (offline)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── handLandmarker.js   # MediaPipe Tasks setup
│   │   │   ├── classifier.js       # MLP inference + smoothing
│   │   │   ├── sentenceBuilder.js  # hold-to-register sentence logic
│   │   │   ├── drawHand.js         # glowing skeleton renderer
│   │   │   └── tts.js              # Web Speech API
│   │   ├── model/aslModel.json     # trained MLP weights (A–Z)
│   │   ├── components/
│   │   └── pages/                  # Dashboard, Interpreter, Learn, SignPlayer
│   └── vite.config.js
└── run.bat                         # One-click launcher (Windows)
```

---

## Setup & Run

### Prerequisites
- Node.js **18+**
- A webcam

```bash
cd frontend
npm install --ignore-scripts
npm run dev
```

Or on Windows, just double-click **run.bat**.

Open **http://localhost:3010**, allow camera access, and sign.

> Everything — hand tracking, classification, speech — runs locally in the browser. No video ever leaves your machine.

---

## Usage

1. Open **Interpreter** and allow camera access.
2. Make an ASL alphabet sign. The skeleton overlay turns green as a letter registers.
3. Hold a sign ~1.2 s to add the letter; pause ~2 s to finish a word.
4. Use **Del / Space / Speak / Clear** buttons for corrections, or toggle auto-speak.
5. **J** and **Z** involve motion in real ASL — hold their final pose to register them.

---

## Retraining the model (optional)

The model was trained on the [Marxulia ASL alphabets dataset](https://huggingface.co/datasets/Marxulia/asl_sign_languages_alphabets_v03) (10.8k images, 26 classes). To retrain: extract landmarks with MediaPipe's `HandLandmarker`, normalize (wrist-centered, scaled by max landmark distance), augment (mirror + ±12° rotation + noise), train an MLP, and export `coefs_`/`intercepts_` to `frontend/src/model/aslModel.json`.

---

## License

MIT
