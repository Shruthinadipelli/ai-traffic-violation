"""
services/plate_recognizer.py - License Plate OCR
===================================================
Uses EasyOCR to extract text from the license plate region
of a detected vehicle. The bounding box from the YOLO detector
is used to crop the plate area before running OCR for accuracy.

Preprocessing pipeline:
  1. Crop the vehicle bounding box from the full frame.
  2. Convert to grayscale.
  3. Apply adaptive thresholding for contrast.
  4. Run EasyOCR text detection.
  5. Clean and validate the plate string.

Usage:
    recognizer = PlateRecognizer()
    plate_text = recognizer.read_plate("frame.jpg", [x1, y1, x2, y2])
    # "MH12AB1234"
"""

import re
import cv2
import easyocr
import numpy as np


class PlateRecognizer:
    """Extract license plate text from a vehicle image region."""

    def __init__(self, languages: list[str] | None = None):
        """
        Args:
            languages: OCR languages. Defaults to English.
        """
        if languages is None:
            languages = ["en"]
        self.reader = easyocr.Reader(languages, gpu=False)

    def _preprocess(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance the plate region for better OCR accuracy.

        Steps:
          - Convert to grayscale
          - Apply bilateral filter to reduce noise
          - Adaptive threshold for high contrast
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        filtered = cv2.bilateralFilter(gray, 11, 17, 17)
        thresh = cv2.adaptiveThreshold(
            filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        return thresh

    @staticmethod
    def _clean_plate_text(raw_text: str) -> str | None:
        """
        Remove non-alphanumeric characters and validate the plate
        has a minimum plausible length (>= 4 characters).
        """
        cleaned = re.sub(r"[^A-Za-z0-9]", "", raw_text).upper()
        if len(cleaned) >= 4:
            return cleaned
        return None

    def read_plate(
        self, image_path: str, bbox: list[int]
    ) -> str | None:
        """
        Crop the bounding box region, preprocess, and run OCR.

        Args:
            image_path: Path to the full camera frame.
            bbox:       [x1, y1, x2, y2] vehicle bounding box.

        Returns:
            Cleaned license plate string or None if unreadable.
        """
        image = cv2.imread(image_path)
        if image is None:
            return None

        x1, y1, x2, y2 = bbox
        # Add padding around the plate region
        h, w = image.shape[:2]
        pad = 10
        crop = image[
            max(0, y1 - pad) : min(h, y2 + pad),
            max(0, x1 - pad) : min(w, x2 + pad),
        ]

        if crop.size == 0:
            return None

        processed = self._preprocess(crop)
        results = self.reader.readtext(processed, detail=0)

        if not results:
            return None

        # Concatenate all detected text segments
        raw = " ".join(results)
        return self._clean_plate_text(raw)
