"""
app.py - Flask Application Factory
====================================
Entry point for the Flask backend. Initialises the Flask app using the
factory pattern, registers all blueprints (routes), binds SQLAlchemy,
sets up CORS for the React frontend, and creates database tables on
first run.
"""

import os
from flask import Flask
from flask_cors import CORS
from config import config_map
from models import db
from routes.violations import violations_bp
from routes.challans import challans_bp
from routes.analytics import analytics_bp
from routes.detection import detection_bp
from routes.dashboard import dashboard_bp


def create_app(config_name: str | None = None) -> Flask:
    """Application factory that returns a configured Flask instance."""

    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    # Initialise extensions
    db.init_app(app)

    # Enable CORS for React frontend (Next.js dev server)
    CORS(app, origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ], supports_credentials=True)

    # Register API blueprints
    app.register_blueprint(violations_bp, url_prefix="/api/violations")
    app.register_blueprint(challans_bp, url_prefix="/api/challans")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(detection_bp, url_prefix="/api/detection")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    # Create tables if they don't exist
    with app.app_context():
        db.create_all()

    # Ensure upload / QR directories exist
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["QR_OUTPUT_DIR"], exist_ok=True)

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=5000, debug=True)
