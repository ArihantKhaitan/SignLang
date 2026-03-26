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


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    print(f"[SignLang AI] Backend running on http://localhost:{port}")
    app.run(debug=True, host="0.0.0.0", port=port, threaded=True)
