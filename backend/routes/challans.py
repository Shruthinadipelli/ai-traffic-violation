"""
routes/challans.py - E-Challan REST API
=========================================
Manages electronic traffic challans (fines).

GET    /api/challans             List all challans (filterable by payment status)
GET    /api/challans/<number>    Lookup challan by its unique number
POST   /api/challans             Generate a new e-challan for a violation
PATCH  /api/challans/<id>/pay    Mark a challan as paid
"""

import uuid
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from models import db, Challan, Violation
from services.qr_generator import generate_challan_qr

challans_bp = Blueprint("challans", __name__)


FINE_SCHEDULE = {
    "speeding": 2000.0,
    "red_light": 5000.0,
    "wrong_lane": 1000.0,
    "no_helmet": 1000.0,
    "no_seatbelt": 1000.0,
    "illegal_parking": 500.0,
}


@challans_bp.route("/", methods=["GET"])
def list_challans():
    """Return challans with optional payment status filter."""
    status = request.args.get("payment_status")
    query = Challan.query.order_by(Challan.created_at.desc())

    if status:
        query = query.filter_by(payment_status=status)

    challans = query.all()
    return jsonify([c.to_dict() for c in challans])


@challans_bp.route("/<string:challan_number>", methods=["GET"])
def get_challan(challan_number):
    """Lookup challan by its unique number (used by QR scan)."""
    challan = Challan.query.filter_by(challan_number=challan_number).first_or_404()
    return jsonify(challan.to_dict())


@challans_bp.route("/", methods=["POST"])
def create_challan():
    """Generate an e-challan for a confirmed violation."""
    data = request.get_json()
    violation_id = data["violation_id"]

    violation = Violation.query.get_or_404(violation_id)

    if violation.challan:
        return jsonify({"error": "Challan already exists for this violation"}), 400

    challan_number = f"CH-{uuid.uuid4().hex[:10].upper()}"
    fine_amount = FINE_SCHEDULE.get(violation.violation_type, 1000.0)
    due_date = datetime.utcnow() + timedelta(days=30)

    # Generate QR code
    qr_path = generate_challan_qr(
        challan_number=challan_number,
        base_url=current_app.config["CHALLAN_BASE_URL"],
        output_dir=current_app.config["QR_OUTPUT_DIR"],
    )

    challan = Challan(
        violation_id=violation_id,
        challan_number=challan_number,
        fine_amount=fine_amount,
        due_date=due_date,
        qr_code_path=qr_path,
    )

    violation.status = "confirmed"
    db.session.add(challan)
    db.session.commit()

    return jsonify(challan.to_dict()), 201


@challans_bp.route("/<int:challan_id>/pay", methods=["PATCH"])
def pay_challan(challan_id):
    """Mark a challan as paid."""
    challan = Challan.query.get_or_404(challan_id)
    challan.payment_status = "paid"
    challan.payment_date = datetime.utcnow()
    db.session.commit()
    return jsonify(challan.to_dict())
