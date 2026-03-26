"""
Flask API routes — all prefixed with /api when registered in app.py.

Endpoints
─────────
GET  /video_feed            MJPEG stream with MediaPipe skeleton overlay
GET  /predict               Prediction + live sentence-builder state
POST /sentence/clear        Wipe sentence builder
POST /sentence/backspace    Remove last character
POST /sentence/space        Finalise current word
POST /tts                   Speak text via pyttsx3
POST /capture/start         Begin landmark collection  { label, target }
POST /capture/stop          Stop collection
POST /train                 Train RandomForest classifier
GET  /status                Full app status
"""

from __future__ import annotations

import threading
import time

from flask import Blueprint, Response, jsonify, request

api_bp = Blueprint("api", __name__)

# ── Lazy singletons ───────────────────────────────────────────────────────────
_camera = None
_classifier = None
_sentence = None
_init_lock = threading.Lock()


def _cam():
    global _camera
    if _camera is None:
        with _init_lock:
            if _camera is None:
                from mediapipe_hands import MediaPipeCamera
                _camera = MediaPipeCamera()
    return _camera


def _clf():
    global _classifier
    if _classifier is None:
        from asl_classifier import ASLClassifier
        _classifier = ASLClassifier()
    return _classifier


def _sb():
    global _sentence
    if _sentence is None:
        from sentence_builder import SentenceBuilder
        _sentence = SentenceBuilder()
    return _sentence


# ── Mutable app state ─────────────────────────────────────────────────────────
_col = {"active": False, "label": "", "count": 0, "target": 300}
_trn = {"active": False, "message": "No training run yet.", "result": None}


# ── Video feed ────────────────────────────────────────────────────────────────

def _frame_gen():
    cam = _cam()
    while True:
        jpeg = cam.get_frame_jpeg()
        if jpeg:
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"
        time.sleep(0.030)


@api_bp.route("/video_feed")
def video_feed():
    return Response(_frame_gen(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


# ── Prediction & sentence builder ─────────────────────────────────────────────

@api_bp.route("/predict")
def predict():
    cam, clf, sb = _cam(), _clf(), _sb()
    landmarks = cam.get_landmarks()
    prediction, confidence = clf.predict(landmarks)

    # Only drive the sentence builder when not actively collecting data
    if not _col["active"]:
        sb.update(prediction or "", confidence)

    return jsonify({
        "prediction":     prediction or "",
        "confidence":     round(confidence, 4),
        "hand_detected":  landmarks is not None,
        "sentence_state": sb.get_state(),
    })


@api_bp.route("/sentence/clear", methods=["POST"])
def sentence_clear():
    _sb().clear()
    return jsonify({"ok": True, "state": _sb().get_state()})


@api_bp.route("/sentence/backspace", methods=["POST"])
def sentence_backspace():
    _sb().backspace()
    return jsonify({"ok": True, "state": _sb().get_state()})


@api_bp.route("/sentence/space", methods=["POST"])
def sentence_space():
    _sb().add_space()
    return jsonify({"ok": True, "state": _sb().get_state()})


# ── Text-to-speech ────────────────────────────────────────────────────────────

@api_bp.route("/tts", methods=["POST"])
def tts():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    if not text:
        text = _sb().get_state().get("full_text", "")
    if text:
        _speak(text)
    return jsonify({"ok": True, "text": text})


def _speak(text: str):
    def _worker():
        try:
            import pyttsx3
            engine = pyttsx3.init()
            engine.setProperty("rate", 145)
            engine.setProperty("volume", 0.95)
            engine.say(text)
            engine.runAndWait()
            engine.stop()
        except Exception as exc:
            print(f"[TTS] {exc}")

    threading.Thread(target=_worker, daemon=True).start()


# ── Data collection ───────────────────────────────────────────────────────────

@api_bp.route("/capture/start", methods=["POST"])
def capture_start():
    data = request.get_json(silent=True) or {}
    label = data.get("label", "").strip().upper()
    if not label:
        return jsonify({"error": "label required"}), 400
    if _col["active"]:
        return jsonify({"error": "already collecting"}), 400

    _col.update(active=True, label=label, count=0,
                target=int(data.get("target", 300)))
    threading.Thread(target=_collect_loop, daemon=True).start()
    return jsonify({"ok": True, "label": label, "target": _col["target"]})


@api_bp.route("/capture/stop", methods=["POST"])
def capture_stop():
    _col["active"] = False
    return jsonify({"ok": True, "count": _col["count"]})


def _collect_loop():
    cam, clf = _cam(), _clf()
    while _col["active"] and _col["count"] < _col["target"]:
        lm = cam.get_landmarks()
        if lm is not None:
            clf.add_sample(_col["label"], lm)
            _col["count"] += 1
        time.sleep(0.05)   # collect at ~20 fps
    _col["active"] = False


# ── Training ──────────────────────────────────────────────────────────────────

@api_bp.route("/train", methods=["POST"])
def train():
    if _trn["active"]:
        return jsonify({"error": "training already in progress"}), 400
    _trn.update(active=True, message="Training…", result=None)
    threading.Thread(target=_train_loop, daemon=True).start()
    return jsonify({"ok": True})


def _train_loop():
    success, msg = _clf().train()
    _trn.update(active=False, message=msg,
                result="success" if success else "error")


# ── Status ────────────────────────────────────────────────────────────────────

@api_bp.route("/status")
def status():
    clf = _clf()
    return jsonify({
        "collecting":    dict(_col),
        "training":      dict(_trn),
        "model_ready":   clf.is_trained(),
        "labels":        clf.get_labels(),
        "sample_counts": clf.get_sample_counts(),
    })
