"""
models.py - SQLAlchemy Database Models
=======================================
Defines all MySQL tables through SQLAlchemy ORM models:

  - Vehicle:      Stores detected vehicle info and license plates.
  - Violation:    Records each traffic violation (type, speed, evidence).
  - Challan:      Generated e-challans with fines, QR codes, payment status.
  - Camera:       Registered traffic camera locations.

Relationships:
  Vehicle  1 --> N  Violation
  Violation 1 --> 1  Challan
  Camera   1 --> N  Violation
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Camera(db.Model):
    """Registered traffic camera / detection point."""

    __tablename__ = "cameras"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    location_name = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    speed_limit_kmh = db.Column(db.Integer, default=60)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    violations = db.relationship("Violation", backref="camera", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "location_name": self.location_name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "speed_limit_kmh": self.speed_limit_kmh,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class Vehicle(db.Model):
    """Detected vehicle with OCR-extracted license plate."""

    __tablename__ = "vehicles"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    license_plate = db.Column(db.String(20), nullable=False, index=True)
    vehicle_type = db.Column(
        db.String(50), default="car"
    )  # car, truck, motorcycle, bus
    owner_name = db.Column(db.String(255), nullable=True)
    owner_contact = db.Column(db.String(20), nullable=True)
    registered_address = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    violations = db.relationship("Violation", backref="vehicle", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "license_plate": self.license_plate,
            "vehicle_type": self.vehicle_type,
            "owner_name": self.owner_name,
            "owner_contact": self.owner_contact,
            "created_at": self.created_at.isoformat(),
        }


class Violation(db.Model):
    """Individual traffic violation record."""

    __tablename__ = "violations"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    vehicle_id = db.Column(
        db.Integer, db.ForeignKey("vehicles.id"), nullable=False
    )
    camera_id = db.Column(
        db.Integer, db.ForeignKey("cameras.id"), nullable=True
    )
    violation_type = db.Column(
        db.String(100), nullable=False
    )  # speeding, red_light, wrong_lane, no_helmet
    detected_speed_kmh = db.Column(db.Float, nullable=True)
    speed_limit_kmh = db.Column(db.Integer, nullable=True)
    evidence_image_path = db.Column(db.String(500), nullable=True)
    confidence_score = db.Column(db.Float, nullable=True)
    status = db.Column(
        db.String(20), default="pending"
    )  # pending, confirmed, dismissed
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    challan = db.relationship(
        "Challan", backref="violation", uselist=False, lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_id": self.vehicle_id,
            "camera_id": self.camera_id,
            "violation_type": self.violation_type,
            "detected_speed_kmh": self.detected_speed_kmh,
            "speed_limit_kmh": self.speed_limit_kmh,
            "evidence_image_path": self.evidence_image_path,
            "confidence_score": self.confidence_score,
            "status": self.status,
            "detected_at": self.detected_at.isoformat(),
            "vehicle": self.vehicle.to_dict() if self.vehicle else None,
            "challan": self.challan.to_dict() if self.challan else None,
        }


class Challan(db.Model):
    """E-Challan generated for a confirmed violation."""

    __tablename__ = "challans"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    violation_id = db.Column(
        db.Integer,
        db.ForeignKey("violations.id"),
        nullable=False,
        unique=True,
    )
    challan_number = db.Column(
        db.String(50), unique=True, nullable=False, index=True
    )
    fine_amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    payment_status = db.Column(
        db.String(20), default="unpaid"
    )  # unpaid, paid, overdue
    payment_date = db.Column(db.DateTime, nullable=True)
    qr_code_path = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "violation_id": self.violation_id,
            "challan_number": self.challan_number,
            "fine_amount": self.fine_amount,
            "due_date": self.due_date.isoformat(),
            "payment_status": self.payment_status,
            "payment_date": (
                self.payment_date.isoformat() if self.payment_date else None
            ),
            "qr_code_path": self.qr_code_path,
            "created_at": self.created_at.isoformat(),
        }
