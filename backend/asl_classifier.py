"""
Landmark-based ASL gesture classifier using RandomForest on 63-dim MediaPipe
hand landmark vectors.  No GPU required.  Typical training time < 5 seconds.
"""
from __future__ import annotations

import os
import pickle

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

MODEL_PATH = "asl_model.pkl"


class ASLClassifier:
    def __init__(self):
        self.model: RandomForestClassifier | None = None
        self.le = LabelEncoder()
        self.training_data: dict[str, list] = {}   # label → [63-dim arrays]
        self._load()

    # ── Data collection ───────────────────────────────────────────────────

    def add_sample(self, label: str, landmarks: np.ndarray):
        label = label.upper().strip()
        self.training_data.setdefault(label, []).append(landmarks.tolist())

    def get_sample_counts(self) -> dict[str, int]:
        return {k: len(v) for k, v in self.training_data.items()}

    def delete_label(self, label: str):
        self.training_data.pop(label.upper(), None)
        if self.model is not None:
            # Force retrain to remove class
            self.model = None
            self._save()

    # ── Training ──────────────────────────────────────────────────────────

    def train(self) -> tuple[bool, str]:
        if not self.training_data:
            return False, "No training data collected."

        counts = self.get_sample_counts()
        under = {k: v for k, v in counts.items() if v < 30}
        if under:
            return False, (
                f"Too few samples for: {', '.join(f'{k}({v})' for k, v in under.items())}. "
                "Need at least 30 per gesture."
            )

        X, y = [], []
        for label, samples in self.training_data.items():
            for s in samples:
                X.append(s)
                y.append(label)

        X = np.array(X, dtype=np.float32)
        y_enc = self.le.fit_transform(y)

        self.model = RandomForestClassifier(
            n_estimators=250,
            max_depth=None,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=-1,
        )
        self.model.fit(X, y_enc)
        self._save()

        classes = list(self.le.classes_)
        total = len(X)
        return True, (
            f"Trained on {total} samples across {len(classes)} gestures: "
            + ", ".join(classes)
        )

    # ── Inference ─────────────────────────────────────────────────────────

    def predict(self, landmarks: np.ndarray | None) -> tuple[str | None, float]:
        if self.model is None or landmarks is None:
            return None, 0.0
        proba = self.model.predict_proba([landmarks])[0]
        idx = int(np.argmax(proba))
        confidence = float(proba[idx])
        label = str(self.le.inverse_transform([idx])[0])
        return label, confidence

    def is_trained(self) -> bool:
        return self.model is not None

    def get_labels(self) -> list[str]:
        if self.model is not None:
            return list(self.le.classes_)
        return sorted(self.training_data.keys())

    # ── Persistence ───────────────────────────────────────────────────────

    def _save(self):
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(
                {"model": self.model, "le": self.le,
                 "training_data": self.training_data},
                f,
            )

    def _load(self):
        if not os.path.exists(MODEL_PATH):
            return
        try:
            with open(MODEL_PATH, "rb") as f:
                data = pickle.load(f)
            self.model = data.get("model")
            self.le = data.get("le", LabelEncoder())
            self.training_data = data.get("training_data", {})
        except Exception as e:
            print(f"[classifier] could not load saved model: {e}")
