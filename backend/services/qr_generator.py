"""
services/qr_generator.py - QR Code Generation for E-Challans
==============================================================
Generates a QR code image that encodes a URL pointing to the
e-challan payment / details page. The QR is saved as a PNG
and the file path is stored in the database.

Usage:
    path = generate_challan_qr(
        challan_number="CH-A1B2C3D4E5",
        base_url="https://traffic.gov/challan",
        output_dir="static/qrcodes",
    )
    # "static/qrcodes/CH-A1B2C3D4E5.png"
"""

import os
import qrcode
from qrcode.constants import ERROR_CORRECT_H


def generate_challan_qr(
    challan_number: str,
    base_url: str = "http://localhost:5000/challan",
    output_dir: str = "static/qrcodes",
) -> str:
    """
    Create a QR code PNG for an e-challan.

    The encoded data is a URL: {base_url}/{challan_number}
    which the violator can scan to view / pay the fine.

    Args:
        challan_number: Unique challan identifier.
        base_url:       Root URL of the challan portal.
        output_dir:     Directory to save the QR image.

    Returns:
        File path of the generated QR code image.
    """
    os.makedirs(output_dir, exist_ok=True)

    url = f"{base_url}/{challan_number}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    filename = f"{challan_number}.png"
    filepath = os.path.join(output_dir, filename)
    img.save(filepath)

    return filepath
