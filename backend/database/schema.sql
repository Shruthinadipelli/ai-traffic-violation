-- schema.sql - MySQL Database Schema
-- ====================================
-- Run this script to initialise the database:
--   mysql -u root -p traffic_violations < database/schema.sql
--
-- Tables: cameras, vehicles, violations, challans

CREATE DATABASE IF NOT EXISTS traffic_violations
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE traffic_violations;

-- ─── Cameras ───────────────────────────────────
CREATE TABLE IF NOT EXISTS cameras (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  location_name   VARCHAR(255) NOT NULL,
  latitude        DOUBLE       NULL,
  longitude       DOUBLE       NULL,
  speed_limit_kmh INT          DEFAULT 60,
  is_active       BOOLEAN      DEFAULT TRUE,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── Vehicles ──────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  license_plate      VARCHAR(20)  NOT NULL,
  vehicle_type       VARCHAR(50)  DEFAULT 'car',
  owner_name         VARCHAR(255) NULL,
  owner_contact      VARCHAR(20)  NULL,
  registered_address TEXT         NULL,
  created_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_plate (license_plate)
) ENGINE=InnoDB;

-- ─── Violations ────────────────────────────────
CREATE TABLE IF NOT EXISTS violations (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id          INT          NOT NULL,
  camera_id           INT          NULL,
  violation_type      VARCHAR(100) NOT NULL,
  detected_speed_kmh  DOUBLE       NULL,
  speed_limit_kmh     INT          NULL,
  evidence_image_path VARCHAR(500) NULL,
  confidence_score    DOUBLE       NULL,
  status              VARCHAR(20)  DEFAULT 'pending',
  detected_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (camera_id)  REFERENCES cameras(id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─── Challans (E-Fines) ───────────────────────
CREATE TABLE IF NOT EXISTS challans (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  violation_id    INT          NOT NULL UNIQUE,
  challan_number  VARCHAR(50)  NOT NULL UNIQUE,
  fine_amount     DOUBLE       NOT NULL,
  due_date        DATETIME     NOT NULL,
  payment_status  VARCHAR(20)  DEFAULT 'unpaid',
  payment_date    DATETIME     NULL,
  qr_code_path    VARCHAR(500) NULL,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (violation_id) REFERENCES violations(id) ON DELETE CASCADE,
  INDEX idx_challan_number (challan_number)
) ENGINE=InnoDB;
