"""
services/speed_calculator.py - Vehicle Speed Estimation
=========================================================
Estimates vehicle speed by tracking bounding box displacement
across consecutive video frames.

Algorithm:
  1. Store the centroid of each vehicle's bounding box per frame.
  2. When the same vehicle (matched by license plate) appears in
     the next frame, compute pixel displacement.
  3. Convert pixel displacement to real-world meters using a
     calibration constant (pixels_per_meter).
  4. Derive speed: distance / time, where time = 1 / FPS.

Limitations:
  - Assumes a fixed, calibrated camera angle.
  - Accuracy depends on consistent frame rate and pixel scale.
  - Best suited for straight road segments.

Usage:
    calc = SpeedCalculator()
    speed = calc.calculate("MH12AB1234", [100, 200, 300, 400], frame_index=1)
    # 72.5  (km/h) or None if first sighting
"""

import math


class SpeedCalculator:
    """Track vehicles across frames and estimate speed."""

    def __init__(self):
        # Stores {vehicle_id: {"centroid": (cx, cy), "frame": int}}
        self._tracks: dict[str, dict] = {}

    @staticmethod
    def _centroid(bbox: list[int]) -> tuple[float, float]:
        """Return the centre point of a bounding box."""
        x1, y1, x2, y2 = bbox
        return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)

    def calculate(
        self,
        vehicle_id: str,
        bbox: list[int],
        frame_index: int,
        fps: int = 30,
        pixels_per_meter: float = 8.8,
    ) -> float | None:
        """
        Estimate vehicle speed between current and previous frame.

        Args:
            vehicle_id:       Unique ID (license plate text).
            bbox:             Current bounding box [x1, y1, x2, y2].
            frame_index:      Sequential frame number.
            fps:              Camera frames per second.
            pixels_per_meter: Calibration constant for the camera.

        Returns:
            Speed in km/h, or None if this is the first sighting.
        """
        current_centroid = self._centroid(bbox)

        if vehicle_id in self._tracks:
            prev = self._tracks[vehicle_id]
            prev_centroid = prev["centroid"]
            frame_diff = frame_index - prev["frame"]

            if frame_diff <= 0:
                self._tracks[vehicle_id] = {
                    "centroid": current_centroid,
                    "frame": frame_index,
                }
                return None

            # Euclidean pixel displacement
            pixel_dist = math.sqrt(
                (current_centroid[0] - prev_centroid[0]) ** 2
                + (current_centroid[1] - prev_centroid[1]) ** 2
            )

            # Convert to real distance
            meters = pixel_dist / pixels_per_meter

            # Time elapsed
            seconds = frame_diff / fps

            # Speed in km/h
            speed_mps = meters / seconds
            speed_kmh = speed_mps * 3.6

            self._tracks[vehicle_id] = {
                "centroid": current_centroid,
                "frame": frame_index,
            }
            return speed_kmh

        # First sighting - store and return None
        self._tracks[vehicle_id] = {
            "centroid": current_centroid,
            "frame": frame_index,
        }
        return None

    def reset(self):
        """Clear all tracking data (e.g. between video clips)."""
        self._tracks.clear()
