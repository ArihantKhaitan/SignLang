from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from routes import api_bp

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app)

app.register_blueprint(api_bp, url_prefix="/api")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


def _auto_bootstrap():
    """Download and train ASL model on first run if no model exists."""
    model_path = os.path.join(os.path.dirname(__file__), "asl_model.pkl")
    if os.path.exists(model_path):
        return
    print("[SignLang AI] No model found — bootstrapping from HuggingFace ASL dataset…")
    try:
        from asl_classifier import ASLClassifier
        from bootstrap_model import bootstrap
        clf = ASLClassifier()
        bootstrap(clf)
    except Exception as e:
        print(f"[SignLang AI] Bootstrap skipped: {e}")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    print(f"[SignLang AI] Backend running on http://localhost:{port}")
    _auto_bootstrap()
    app.run(debug=True, host="0.0.0.0", port=port, threaded=True)
