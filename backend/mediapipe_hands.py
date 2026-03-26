"""
MediaPipe Hands — Tasks API (mediapipe ≥ 0.10, Python 3.12/3.13 compatible).

The legacy mp.solutions.hands API was removed in recent builds; this module
uses the Tasks-based HandLandmarker instead. The model file (~3 MB) is
downloaded automatically on first run.
"""
import cv2
import numpy as np
import threading
import time
import urllib.request
import os

import mediapipe as mp

BaseOptions          = mp.tasks.BaseOptions
HandLandmarker       = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
RunningMode          = mp.tasks.vision.RunningMode

MODEL_URL  = ("https://storage.googleapis.com/mediapipe-models/"
              "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "hand_landmarker.task")

# Hand skeleton connections (MediaPipe 21-point layout)
_CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),           # thumb
    (0,5),(5,6),(6,7),(7,8),           # index
    (0,9),(9,10),(10,11),(11,12),      # middle
    (0,13),(13,14),(14,15),(15,16),    # ring
    (0,17),(17,18),(18,19),(19,20),    # pinky
    (5,9),(9,13),(13,17),(0,17),       # palm base
]


def _ensure_model():
    if not os.path.exists(MODEL_PATH):
        print("[MediaPipe] Downloading hand_landmarker.task (~3 MB)…")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("[MediaPipe] Download complete.")


class MediaPipeCamera:
    """
    Background-threaded webcam capture using the MediaPipe Tasks
    HandLandmarker.  Thread-safe: call get_frame_jpeg() / get_landmarks()
    from any thread.
    """

    def __init__(self, camera_index: int = 0):
        _ensure_model()
        self._lock = threading.Lock()
        self._latest_jpeg: bytes | None = None
        self._latest_landmarks: np.ndarray | None = None
        self._hand_detected: bool = False
        self._running = True

        self._thread = threading.Thread(
            target=self._capture_loop, args=(camera_index,), daemon=True
        )
        self._thread.start()

    # ── Public API ────────────────────────────────────────────────────────

    def get_frame_jpeg(self) -> bytes | None:
        with self._lock:
            return self._latest_jpeg

    def get_landmarks(self) -> np.ndarray | None:
        with self._lock:
            return self._latest_landmarks.copy() \
                if self._latest_landmarks is not None else None

    def is_hand_detected(self) -> bool:
        with self._lock:
            return self._hand_detected

    def release(self):
        self._running = False

    # ── Internal ─────────────────────────────────────────────────────────

    def _capture_loop(self, camera_index: int):
        cap = cv2.VideoCapture(camera_index)

        options = HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=MODEL_PATH),
            running_mode=RunningMode.IMAGE,
            num_hands=1,
            min_hand_detection_confidence=0.65,
        )

        with HandLandmarker.create_from_options(options) as detector:
            while self._running:
                ok, frame = cap.read()
                if not ok:
                    time.sleep(0.02)
                    continue

                frame = cv2.flip(frame, 1)
                h, w = frame.shape[:2]

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

                try:
                    result = detector.detect(mp_image)
                except Exception as exc:
                    print(f"[MediaPipe] detection error: {exc}")
                    time.sleep(0.05)
                    continue

                landmarks: np.ndarray | None = None
                hand_detected = False

                if result.hand_landmarks:
                    hand_detected = True
                    lm_list = result.hand_landmarks[0]   # first hand

                    # Pixel coordinates
                    pts = [(int(lm.x * w), int(lm.y * h)) for lm in lm_list]

                    # Draw skeleton
                    for a, b in _CONNECTIONS:
                        cv2.line(frame, pts[a], pts[b], (70, 70, 190), 1)
                    for i, pt in enumerate(pts):
                        r = 6 if i == 0 else 4
                        cv2.circle(frame, pt, r, (99, 102, 241), -1)

                    # Bounding box
                    xs, ys = zip(*pts)
                    pad = 24
                    x1 = max(0, min(xs) - pad);  y1 = max(0, min(ys) - pad)
                    x2 = min(w, max(xs) + pad);  y2 = min(h, max(ys) + pad)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (99, 102, 241), 2)

                    landmarks = self._extract(lm_list)
                else:
                    # Guide box
                    cx, cy, s = w // 2, h // 2, 200
                    cv2.rectangle(frame,
                                  (cx - s, cy - s), (cx + s, cy + s),
                                  (55, 55, 55), 1)
                    cv2.putText(frame, "Show your hand here",
                                (cx - s + 10, cy - s - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (85, 85, 85), 1)

                _, jpeg = cv2.imencode(
                    ".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 82]
                )

                with self._lock:
                    self._latest_jpeg    = jpeg.tobytes()
                    self._latest_landmarks = landmarks
                    self._hand_detected  = hand_detected

                time.sleep(0.030)   # ≈ 33 fps

        cap.release()

    @staticmethod
    def _extract(lm_list) -> np.ndarray:
        """
        63-dim normalised landmark vector.
        Centre at wrist (lm 0); scale by wrist → middle-finger MCP (lm 9).
        """
        coords = np.array(
            [[lm.x, lm.y, lm.z] for lm in lm_list], dtype=np.float32
        )
        coords -= coords[0]
        scale = np.linalg.norm(coords[9]) + 1e-6
        coords /= scale
        return coords.flatten()
