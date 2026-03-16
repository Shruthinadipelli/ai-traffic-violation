"""
routes/dashboard.py - Unified Dashboard API
=============================================
Combines data from violations, challans, analytics, and cameras
into a single payload for the React dashboard to consume.

GET  /api/dashboard    Full dashboard data (stats, violations, challans, charts)
"""

from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from sqlalchemy import func
from models import db, Violation, Challan, Camera, Vehicle

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/", methods=["GET"])
def get_dashboard():
    """
    Return a single combined JSON payload with:
      - stats: KPI summary cards
      - violations: recent violations with vehicle & camera info
      - challans: all challans with violation references
      - charts: timeline, by-type, and by-camera aggregations
    """

    # ── Stats ────────────────────────────────────
    total_violations = Violation.query.count()
    pending = Violation.query.filter_by(status="pending").count()
    confirmed = Violation.query.filter_by(status="confirmed").count()
    dismissed = Violation.query.filter_by(status="dismissed").count()
    total_vehicles = Vehicle.query.count()
    total_challans = Challan.query.count()

    total_fines = float(
        db.session.query(func.coalesce(func.sum(Challan.fine_amount), 0)).scalar()
    )
    collected_fines = float(
        db.session.query(func.coalesce(func.sum(Challan.fine_amount), 0))
        .filter(Challan.payment_status == "paid")
        .scalar()
    )

    stats = {
        "total_violations": total_violations,
        "vehicles_detected": total_vehicles,
        "pending_review": pending,
        "challans_issued": total_challans,
        "fines_collected": collected_fines,
        "resolved": dismissed + confirmed,
    }

    # ── Violations ───────────────────────────────
    violations_query = (
        Violation.query
        .order_by(Violation.detected_at.desc())
        .limit(50)
        .all()
    )
    violations_list = []
    for v in violations_query:
        vehicle = Vehicle.query.get(v.vehicle_id)
        camera = Camera.query.get(v.camera_id) if v.camera_id else None
        violations_list.append({
            "id": f"V-{v.id:03d}",
            "plate": vehicle.license_plate if vehicle else "UNKNOWN",
            "type": v.violation_type,
            "speed": str(v.detected_speed_kmh) if v.detected_speed_kmh else None,
            "limit": str(v.speed_limit_kmh) if v.speed_limit_kmh else None,
            "camera": camera.location_name if camera else "Unknown Camera",
            "confidence": v.confidence_score or 0.0,
            "status": v.status,
            "time": v.detected_at.strftime("%Y-%m-%d %H:%M") if v.detected_at else "",
        })

    # ── Challans ─────────────────────────────────
    challans_query = Challan.query.order_by(Challan.created_at.desc()).all()
    challans_list = []
    for c in challans_query:
        violation = Violation.query.get(c.violation_id)
        vehicle = Vehicle.query.get(violation.vehicle_id) if violation else None
        challans_list.append({
            "challanNumber": c.challan_number,
            "violationId": f"V-{c.violation_id:03d}",
            "plate": vehicle.license_plate if vehicle else "UNKNOWN",
            "type": violation.violation_type.replace("_", " ").title() if violation else "Unknown",
            "fine": c.fine_amount,
            "dueDate": c.due_date.strftime("%Y-%m-%d") if c.due_date else "",
            "status": c.payment_status,
        })

    # ── Charts: Timeline ─────────────────────────
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    timeline_results = (
        db.session.query(
            func.date(Violation.detected_at), func.count(Violation.id)
        )
        .filter(Violation.detected_at >= thirty_days_ago)
        .group_by(func.date(Violation.detected_at))
        .order_by(func.date(Violation.detected_at))
        .all()
    )
    timeline = [{"date": str(r[0]), "count": r[1]} for r in timeline_results]

    # ── Charts: By Type ──────────────────────────
    type_results = (
        db.session.query(Violation.violation_type, func.count(Violation.id))
        .group_by(Violation.violation_type)
        .all()
    )
    by_type = [
        {"type": r[0].replace("_", " ").title(), "count": r[1]}
        for r in type_results
    ]

    # ── Charts: By Camera ────────────────────────
    camera_results = (
        db.session.query(Camera.location_name, func.count(Violation.id))
        .join(Violation, Violation.camera_id == Camera.id)
        .group_by(Camera.location_name)
        .all()
    )
    by_camera = [{"name": r[0], "value": r[1]} for r in camera_results]

    return jsonify({
        "stats": stats,
        "violations": violations_list,
        "challans": challans_list,
        "charts": {
            "timeline": timeline,
            "by_type": by_type,
            "by_camera": by_camera,
        },
    })
