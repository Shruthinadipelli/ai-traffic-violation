"""
routes/analytics.py - Dashboard Analytics API
================================================
Aggregated data endpoints consumed by the React dashboard:

GET  /api/analytics/summary        Total counts, revenue, recent trends
GET  /api/analytics/by-type        Violations grouped by type
GET  /api/analytics/by-camera      Violations grouped by camera location
GET  /api/analytics/timeline       Daily violation counts for chart
"""

from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from sqlalchemy import func
from models import db, Violation, Challan, Camera, Vehicle

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/summary", methods=["GET"])
def summary():
    """High-level KPI numbers for the dashboard header cards."""
    total_violations = Violation.query.count()
    pending = Violation.query.filter_by(status="pending").count()
    confirmed = Violation.query.filter_by(status="confirmed").count()
    total_fines = (
        db.session.query(func.coalesce(func.sum(Challan.fine_amount), 0)).scalar()
    )
    paid_fines = (
        db.session.query(func.coalesce(func.sum(Challan.fine_amount), 0))
        .filter(Challan.payment_status == "paid")
        .scalar()
    )
    total_vehicles = Vehicle.query.count()

    return jsonify(
        {
            "total_violations": total_violations,
            "pending_violations": pending,
            "confirmed_violations": confirmed,
            "total_fines": float(total_fines),
            "collected_fines": float(paid_fines),
            "total_vehicles_detected": total_vehicles,
        }
    )


@analytics_bp.route("/by-type", methods=["GET"])
def by_type():
    """Violations grouped by violation type for pie / bar charts."""
    results = (
        db.session.query(
            Violation.violation_type, func.count(Violation.id)
        )
        .group_by(Violation.violation_type)
        .all()
    )
    return jsonify(
        [{"type": r[0], "count": r[1]} for r in results]
    )


@analytics_bp.route("/by-camera", methods=["GET"])
def by_camera():
    """Violations grouped by camera for location heat analysis."""
    results = (
        db.session.query(
            Camera.location_name, func.count(Violation.id)
        )
        .join(Violation, Violation.camera_id == Camera.id)
        .group_by(Camera.location_name)
        .all()
    )
    return jsonify(
        [{"location": r[0], "count": r[1]} for r in results]
    )


@analytics_bp.route("/timeline", methods=["GET"])
def timeline():
    """Daily violation count for the last 30 days (line chart)."""
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    results = (
        db.session.query(
            func.date(Violation.detected_at), func.count(Violation.id)
        )
        .filter(Violation.detected_at >= thirty_days_ago)
        .group_by(func.date(Violation.detected_at))
        .order_by(func.date(Violation.detected_at))
        .all()
    )
    return jsonify(
        [{"date": str(r[0]), "count": r[1]} for r in results]
    )
