"""
routes/violations.py - Violations REST API
============================================
CRUD endpoints for traffic violations.

GET    /api/violations          List all violations (paginated, filterable)
GET    /api/violations/<id>     Get a single violation with evidence
POST   /api/violations          Create a violation manually
PATCH  /api/violations/<id>     Update status (confirm / dismiss)
DELETE /api/violations/<id>     Delete a violation record
"""

from flask import Blueprint, request, jsonify
from models import db, Violation, Vehicle

violations_bp = Blueprint("violations", __name__)


@violations_bp.route("/", methods=["GET"])
def list_violations():
    """Return paginated violations with optional filters."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status = request.args.get("status")
    violation_type = request.args.get("type")

    query = Violation.query.order_by(Violation.detected_at.desc())

    if status:
        query = query.filter_by(status=status)
    if violation_type:
        query = query.filter_by(violation_type=violation_type)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "violations": [v.to_dict() for v in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
        }
    )


@violations_bp.route("/<int:violation_id>", methods=["GET"])
def get_violation(violation_id):
    """Return a single violation with full details."""
    violation = Violation.query.get_or_404(violation_id)
    return jsonify(violation.to_dict())


@violations_bp.route("/", methods=["POST"])
def create_violation():
    """Manually create a violation record."""
    data = request.get_json()
    vehicle = Vehicle.query.filter_by(
        license_plate=data["license_plate"]
    ).first()

    if not vehicle:
        vehicle = Vehicle(
            license_plate=data["license_plate"],
            vehicle_type=data.get("vehicle_type", "car"),
        )
        db.session.add(vehicle)
        db.session.flush()

    violation = Violation(
        vehicle_id=vehicle.id,
        camera_id=data.get("camera_id"),
        violation_type=data["violation_type"],
        detected_speed_kmh=data.get("detected_speed_kmh"),
        speed_limit_kmh=data.get("speed_limit_kmh"),
        evidence_image_path=data.get("evidence_image_path"),
        confidence_score=data.get("confidence_score"),
    )
    db.session.add(violation)
    db.session.commit()

    return jsonify(violation.to_dict()), 201


@violations_bp.route("/<int:violation_id>", methods=["PATCH"])
def update_violation(violation_id):
    """Update violation status (confirm / dismiss)."""
    violation = Violation.query.get_or_404(violation_id)
    data = request.get_json()

    if "status" in data:
        violation.status = data["status"]

    db.session.commit()
    return jsonify(violation.to_dict())


@violations_bp.route("/<int:violation_id>", methods=["DELETE"])
def delete_violation(violation_id):
    """Remove a violation record."""
    violation = Violation.query.get_or_404(violation_id)
    db.session.delete(violation)
    db.session.commit()
    return jsonify({"message": "Violation deleted"}), 200
