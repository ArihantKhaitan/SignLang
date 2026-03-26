"""
Bootstrap the ASL classifier from the HuggingFace dataset
  Siruyy/asl-static-landmarks-v1
which contains MediaPipe hand-landmark features for 26 ASL letters.

The dataset has 86 features; the first 63 are the raw x,y,z coordinates
of the 21 hand landmarks (same order as our normalised landmark pipeline).
We train a RandomForest on those 63 features so the model is drop-in
compatible with our live mediapipe_hands.py extractor.
"""

import os, io, logging, urllib.request
import numpy as np

log = logging.getLogger(__name__)

LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")  # index 0-25

HF_BASE = "https://huggingface.co/datasets/Siruyy/asl-static-landmarks-v1/resolve/main"
FILES = {
    "X_train": f"{HF_BASE}/X_train.npy",
    "y_train": f"{HF_BASE}/y_train.npy",
    "X_test":  f"{HF_BASE}/X_test.npy",
    "y_test":  f"{HF_BASE}/y_test.npy",
}


def _download_npy(url: str) -> np.ndarray:
    log.info(f"Downloading {url}")
    with urllib.request.urlopen(url, timeout=30) as resp:
        return np.load(io.BytesIO(resp.read()), allow_pickle=True)


def bootstrap(classifier) -> bool:
    """
    Download the dataset, train the classifier, and persist it.
    Returns True on success.
    """
    try:
        log.info("[Bootstrap] Downloading ASL landmark dataset from HuggingFace…")

        X_train = _download_npy(FILES["X_train"])
        y_train = _download_npy(FILES["y_train"])
        X_test  = _download_npy(FILES["X_test"])
        y_test  = _download_npy(FILES["y_test"])

        # The dataset has 86 features; first 63 = raw x,y,z of 21 landmarks.
        # Our pipeline also produces 63 normalised landmark values → compatible.
        X_train63 = X_train[:, :63].astype(np.float32)
        X_test63  = X_test[:, :63].astype(np.float32)

        # Convert integer labels 0-25 → letter strings
        y_train_str = np.array([LETTERS[i] for i in y_train.astype(int)])
        y_test_str  = np.array([LETTERS[i] for i in y_test.astype(int)])

        log.info(f"[Bootstrap] Training on {len(X_train63)} samples, {len(set(y_train_str))} classes…")

        # Inject samples into the classifier's training_data dict
        classifier.training_data = {}
        for X_row, label in zip(X_train63, y_train_str):
            if label not in classifier.training_data:
                classifier.training_data[label] = []
            classifier.training_data[label].append(X_row.tolist())

        success, msg = classifier.train()
        if not success:
            log.error(f"[Bootstrap] Training failed: {msg}")
            return False

        # Quick accuracy check on test split
        correct = sum(
            classifier.predict(x.tolist())[0] == lbl
            for x, lbl in zip(X_test63, y_test_str)
        )
        acc = correct / len(y_test_str) * 100
        log.info(f"[Bootstrap] Done — test accuracy {acc:.1f}% ({correct}/{len(y_test_str)})")
        print(f"[Bootstrap] ASL bootstrap model ready — {acc:.1f}% accuracy on held-out test set")
        return True

    except Exception as e:
        log.error(f"[Bootstrap] Failed: {e}")
        print(f"[Bootstrap] Could not load pre-trained model: {e}")
        return False
