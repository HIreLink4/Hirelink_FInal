-- ============================================================================
-- MIGRATION: OTP Authentication Support
-- Run this SQL against your hirelink_db database
-- ============================================================================

USE hirelink_db;

-- ============================================================================
-- 1. Add new columns to users table for Google OAuth
-- ============================================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'LOCAL' AFTER password_hash,
ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) AFTER auth_provider;

-- Make password_hash nullable (for OTP and Google users)
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- Add index for Google ID lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- ============================================================================
-- 2. Create OTP Verifications table
-- ============================================================================
DROP TABLE IF EXISTS otp_verifications;

CREATE TABLE otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(150) NOT NULL,
    otp_type VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier_type (identifier, otp_type),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Verification
-- ============================================================================
SELECT 'Migration completed successfully!' AS Status;

DESCRIBE otp_verifications;

