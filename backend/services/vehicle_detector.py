"""
services/vehicle_detector.py - YOLO Vehicle Detection
=======================================================
Wraps the Ultralytics YOLOv8 model to detect vehicles in
camera frames. Returns bounding boxes, class names, and
confidence scores for each detected vehicle.

Supported vehicle classes (COCO dataset IDs):
  2 = car, 3 = motorcycle, 5 = bus, 7 = truck

Usage:
    detector = VehicleDetector("path/to/yolov8n.pt")
    results  = detector.detect("frame.jpg")
    # [{"bbox": [x1, y1, x2, y2], "class_name": "car", "confidence": 0.92}, ...]
"""

import os
from ultralytics import YOLO

# COCO class IDs that correspond to vehicles
VEHICLE_CLASS_IDS = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

DEFAULT_MODEL = os.path.join(
    os.path.dirname(__file__), "..", "ai_modules", "models", "yolov8n.pt"
)


class VehicleDetector:
    """Detect vehicles in an image using YOLOv8."""

    def __init__(self, model_path: str = DEFAULT_MODEL, confidence: float = 0.5):
        """
        Args:
            model_path:  Path to the .pt weights file.
            confidence:  Minimum confidence threshold.
        """
        self.confidence = confidence
        self.model = YOLO(model_path)

    def detect(self, image_path: str) -> list[dict]:
        """
        Run inference on a single image.

        Returns:
            List of detection dicts with keys:
              bbox           [x1, y1, x2, y2] pixel coordinates
              class_name     "car" | "motorcycle" | "bus" | "truck"
              confidence     float 0-1
        """
        results = self.model(image_path, conf=self.confidence, verbose=False)
        detections = []

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                if class_id not in VEHICLE_CLASS_IDS:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()
                detections.append(
                    {
                        "bbox": [int(x1), int(y1), int(x2), int(y2)],
                        "class_name": VEHICLE_CLASS_IDS[class_id],
                        "confidence": round(float(box.conf[0]), 3),
                    }
                )

        return detections
