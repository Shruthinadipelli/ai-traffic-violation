-- seed.sql - Sample Data for Development
-- ========================================
-- Populates the database with test cameras, vehicles,
-- violations, and challans for dashboard development.

USE traffic_violations;

-- ─── Sample Cameras ────────────────────────────
INSERT INTO cameras (location_name, latitude, longitude, speed_limit_kmh) VALUES
  ('NH-48 Toll Plaza',       19.0760, 72.8777, 80),
  ('MG Road Junction',       12.9716, 77.5946, 60),
  ('Ring Road Sector 15',    28.6139, 77.2090, 60),
  ('Eastern Express Highway', 19.0330, 73.0297, 80),
  ('Anna Salai Signal',      13.0827, 80.2707, 50);

-- ─── Sample Vehicles ──────────────────────────
INSERT INTO vehicles (license_plate, vehicle_type, owner_name, owner_contact) VALUES
  ('MH12AB1234', 'car',        'Rajesh Kumar',   '9876543210'),
  ('KA05CD5678', 'motorcycle', 'Priya Sharma',   '9123456780'),
  ('DL08EF9012', 'truck',      'Vikram Singh',   '9988776655'),
  ('TN09GH3456', 'car',        'Ananya Reddy',   '9001122334'),
  ('MH14JK7890', 'bus',        'State Transport', '1800123456');

-- ─── Sample Violations ────────────────────────
INSERT INTO violations (vehicle_id, camera_id, violation_type, detected_speed_kmh, speed_limit_kmh, confidence_score, status) VALUES
  (1, 1, 'speeding',    102.5, 80, 0.94, 'confirmed'),
  (2, 2, 'red_light',   NULL,  60, 0.88, 'confirmed'),
  (3, 3, 'speeding',    85.3,  60, 0.91, 'pending'),
  (4, 4, 'wrong_lane',  NULL,  80, 0.76, 'pending'),
  (1, 5, 'speeding',    68.0,  50, 0.85, 'confirmed'),
  (5, 1, 'speeding',    95.0,  80, 0.92, 'pending'),
  (2, 3, 'no_helmet',   NULL,  60, 0.89, 'confirmed');

-- ─── Sample Challans ──────────────────────────
INSERT INTO challans (violation_id, challan_number, fine_amount, due_date, payment_status) VALUES
  (1, 'CH-A1B2C3D4E5', 2000.00, '2026-03-25 00:00:00', 'paid'),
  (2, 'CH-F6G7H8I9J0', 5000.00, '2026-03-28 00:00:00', 'unpaid'),
  (5, 'CH-K1L2M3N4O5', 2000.00, '2026-03-30 00:00:00', 'unpaid'),
  (7, 'CH-P6Q7R8S9T0', 1000.00, '2026-04-01 00:00:00', 'overdue');
