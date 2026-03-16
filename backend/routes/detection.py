"""
routes/detection.py - Real-Time Detection API
================================================
Handles image / video frame uploads for AI processing.

POST  /api/detection/frame     Upload a single frame for YOLO + OCR processing
POST  /api/detection/video     Upload a video clip for batch processing
"""

import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from services.vehicle_detector import VehicleDetector
from services.plate_recognizer import PlateRecognizer
from services.speed_calculator import SpeedCalculator
from models import db, Vehicle, Violation

detection_bp = Blueprint("detection", __name__)

detector = VehicleDetector()
recognizer = PlateRecognizer()
speed_calc = SpeedCalculator()


@detection_bp.route("/frame", methods=["POST"])
def process_frame():
    """
    Accept a single image frame, run YOLO detection,
    extract license plates via OCR, and estimate speed
    if sequential frames are provided.
    """
    if "frame" not in request.files:
        return jsonify({"error": "No frame uploaded"}), 400

    file = request.files["frame"]
    camera_id = request.form.get("camera_id", type=int)
    frame_index = request.form.get("frame_index", 0, type=int)
    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # Step 1 - Detect vehicles with YOLO
    detections = detector.detect(filepath)

    results = []
    for det in detections:
        # Step 2 - Run OCR on the detected region
        plate_text = recognizer.read_plate(filepath, det["bbox"])

        if not plate_text:
            continue

        # Step 3 - Calculate speed (requires consecutive frames)
        speed = speed_calc.calculate(
            vehicle_id=plate_text,
            bbox=det["bbox"],
            frame_index=frame_index,
            fps=current_app.config["FRAME_RATE"],
            pixels_per_meter=current_app.config["PIXELS_PER_METER"],
        )

        speed_limit = current_app.config["SPEED_LIMIT_KMH"]
        is_violation = speed is not None and speed > speed_limit

        # Step 4 - Store violation if detected
        if is_violation:
            vehicle = Vehicle.query.filter_by(license_plate=plate_text).first()
            if not vehicle:
                vehicle = Vehicle(
                    license_plate=plate_text,
                    vehicle_type=det.get("class_name", "car"),
                )
                db.session.add(vehicle)
                db.session.flush()

            violation = Violation(
                vehicle_id=vehicle.id,
                camera_id=camera_id,
                violation_type="speeding",
                detected_speed_kmh=round(speed, 1),
                speed_limit_kmh=speed_limit,
                evidence_image_path=filepath,
                confidence_score=det["confidence"],
            )
            db.session.add(violation)
            db.session.commit()

        results.append(
            {
                "plate": plate_text,
                "speed_kmh": round(speed, 1) if speed else None,
                "is_violation": is_violation,
                "vehicle_class": det.get("class_name"),
                "confidence": det["confidence"],
            }
        )

    return jsonify({"detections": results, "frame_processed": filename})
