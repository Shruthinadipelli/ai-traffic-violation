"""
config.py - Application Configuration
======================================
Central configuration for the Flask application.
Manages environment-specific settings (development, testing, production),
database connection strings, secret keys, file upload paths, and
YOLO model parameters.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration shared across all environments."""

    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production")

    # MySQL Database
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DB = os.getenv("MYSQL_DB", "traffic_violations")
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
        f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File Upload Settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    INPUT_FOLDER = os.path.join(os.path.dirname(__file__), "input")
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB max upload

    # YOLO Model Settings
    YOLO_MODEL_PATH = os.getenv(
        "YOLO_MODEL_PATH", "ai_modules/models/yolov8n.pt"
    )
    YOLO_CONFIDENCE_THRESHOLD = float(
        os.getenv("YOLO_CONFIDENCE_THRESHOLD", 0.5)
    )

    # Speed Detection
    SPEED_LIMIT_KMH = int(os.getenv("SPEED_LIMIT_KMH", 60))
    FRAME_RATE = int(os.getenv("FRAME_RATE", 30))
    PIXELS_PER_METER = float(os.getenv("PIXELS_PER_METER", 8.8))

    # QR / Challan
    QR_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "static", "qrcodes")
    CHALLAN_BASE_URL = os.getenv(
        "CHALLAN_BASE_URL", "http://localhost:5000/challan"
    )


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
