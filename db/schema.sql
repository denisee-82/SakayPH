-- SakayPH database (MySQL / MariaDB). Import once in phpMyAdmin or:
--   mysql -u root -p < db/schema.sql

CREATE DATABASE IF NOT EXISTS sakayph
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sakayph;

-- One row per commuter search or "I rode this" tap.
-- Deliberately holds NO personal data: no user id, no IP, no device.
CREATE TABLE IF NOT EXISTS events (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    type       ENUM('search','boarding') NOT NULL,
    route      VARCHAR(60) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_route_time (route, created_at),
    KEY idx_type_time  (type, created_at)
) ENGINE=InnoDB;

-- Transport office staff who can open the dashboard.
CREATE TABLE IF NOT EXISTS staff (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(120) NOT NULL DEFAULT '',
    office        VARCHAR(120) NOT NULL DEFAULT '',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Anti-spam counter (hashed IP per minute). Kept separate from events
-- so events stay anonymous. Old rows are purged automatically.
CREATE TABLE IF NOT EXISTS rate_limits (
    ip_hash      CHAR(64) NOT NULL,
    window_start DATETIME NOT NULL,
    hits         SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (ip_hash, window_start)
) ENGINE=InnoDB;
