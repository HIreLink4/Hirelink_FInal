-- ============================================================================
-- HIRELINK DATABASE SCHEMA
-- Local Service Provider Platform
-- Version: 1.0
-- Created: January 2026
-- Database: MySQL 8.0+
-- ============================================================================

-- ============================================================================
-- DATABASE CREATION
-- ============================================================================
CREATE DATABASE IF NOT EXISTS hirelink_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hirelink_db;

-- ============================================================================
-- DROP EXISTING TABLES (for fresh installation)
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS booking_status_history;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS provider_availability;
DROP TABLE IF EXISTS provider_service_areas;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS provider_documents;
DROP TABLE IF EXISTS service_providers;
DROP TABLE IF EXISTS user_addresses;
DROP TABLE IF EXISTS otp_verifications;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admin_audit_logs;
DROP TABLE IF EXISTS system_settings;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- TABLE: users
-- Description: Stores all user accounts (customers, providers, admins)
-- ============================================================================
CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Information
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    profile_image_url VARCHAR(500),
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
    
    -- User Type & Status
    user_type ENUM('CUSTOMER', 'PROVIDER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    account_status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION') DEFAULT 'PENDING_VERIFICATION',
    
    -- Verification Flags
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    
    -- Preferences
    preferred_language ENUM('EN', 'HI', 'TA', 'TE', 'BN', 'MR', 'GU', 'KN', 'ML') DEFAULT 'EN',
    notification_preferences JSON,
    
    -- Security
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_users_phone (phone),
    INDEX idx_users_email (email),
    INDEX idx_users_type (user_type),
    INDEX idx_users_status (account_status),
    INDEX idx_users_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: user_sessions
-- Description: Manages user authentication sessions and JWT tokens
-- ============================================================================
CREATE TABLE user_sessions (
    session_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Token Information
    access_token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    
    -- Session Details
    device_type ENUM('WEB', 'ANDROID', 'IOS', 'DESKTOP') DEFAULT 'WEB',
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Expiration
    access_token_expires_at TIMESTAMP NOT NULL,
    refresh_token_expires_at TIMESTAMP NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMP NULL,
    revoked_reason VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_access_token (access_token_hash),
    INDEX idx_sessions_refresh_token (refresh_token_hash),
    INDEX idx_sessions_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: otp_verifications
-- Description: Stores OTP codes for phone/email verification
-- ============================================================================
CREATE TABLE otp_verifications (
    otp_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Target
    identifier VARCHAR(150) NOT NULL, -- phone or email
    identifier_type ENUM('PHONE', 'EMAIL') NOT NULL,
    
    -- OTP Details
    otp_code VARCHAR(10) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose ENUM('REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'PHONE_CHANGE', 'EMAIL_CHANGE') NOT NULL,
    
    -- Attempts & Expiration
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    expires_at TIMESTAMP NOT NULL,
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_otp_identifier (identifier, identifier_type),
    INDEX idx_otp_expires (expires_at),
    INDEX idx_otp_purpose (purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: user_addresses
-- Description: Stores multiple addresses for each user
-- ============================================================================
CREATE TABLE user_addresses (
    address_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Address Type
    address_type ENUM('HOME', 'WORK', 'OTHER') DEFAULT 'HOME',
    address_label VARCHAR(50),
    
    -- Address Details
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    
    -- Geolocation
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Flags
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_addresses_user (user_id),
    INDEX idx_addresses_pincode (pincode),
    INDEX idx_addresses_location (latitude, longitude),
    INDEX idx_addresses_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: service_providers
-- Description: Extended profile for service provider users
-- ============================================================================
CREATE TABLE service_providers (
    provider_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    
    -- Business Information
    business_name VARCHAR(200),
    business_description TEXT,
    tagline VARCHAR(255),
    
    -- Experience & Skills
    experience_years INT UNSIGNED DEFAULT 0,
    specializations JSON, -- Array of specialization strings
    certifications JSON, -- Array of certification objects
    
    -- Location & Service Area
    base_latitude DECIMAL(10, 8),
    base_longitude DECIMAL(11, 8),
    base_address TEXT,
    base_pincode VARCHAR(6),
    service_radius_km INT UNSIGNED DEFAULT 10,
    
    -- KYC Information (Encrypted)
    aadhaar_number_encrypted VARCHAR(500),
    aadhaar_name VARCHAR(100),
    pan_number_encrypted VARCHAR(500),
    pan_name VARCHAR(100),
    
    -- KYC Status
    kyc_status ENUM('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED') DEFAULT 'NOT_SUBMITTED',
    kyc_verified_at TIMESTAMP NULL,
    kyc_rejection_reason TEXT,
    kyc_expiry_date DATE,
    
    -- Ratings & Statistics
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_ratings INT UNSIGNED DEFAULT 0,
    total_reviews INT UNSIGNED DEFAULT 0,
    total_bookings INT UNSIGNED DEFAULT 0,
    completed_bookings INT UNSIGNED DEFAULT 0,
    cancelled_bookings INT UNSIGNED DEFAULT 0,
    completion_rate DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Financial
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    pending_payout DECIMAL(12, 2) DEFAULT 0.00,
    wallet_balance DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    availability_status ENUM('ONLINE', 'OFFLINE', 'BUSY', 'ON_BREAK') DEFAULT 'OFFLINE',
    auto_accept_bookings BOOLEAN DEFAULT FALSE,
    max_concurrent_bookings INT UNSIGNED DEFAULT 3,
    
    -- Profile Completion
    profile_completion_percentage INT UNSIGNED DEFAULT 0,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_providers_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_providers_user (user_id),
    INDEX idx_providers_location (base_latitude, base_longitude),
    INDEX idx_providers_pincode (base_pincode),
    INDEX idx_providers_rating (average_rating DESC),
    INDEX idx_providers_kyc (kyc_status),
    INDEX idx_providers_availability (is_available, availability_status),
    INDEX idx_providers_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: provider_documents
-- Description: Stores KYC and other verification documents
-- ============================================================================
CREATE TABLE provider_documents (
    document_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT UNSIGNED NOT NULL,
    
    -- Document Information
    document_type ENUM('AADHAAR_FRONT', 'AADHAAR_BACK', 'PAN_CARD', 'ADDRESS_PROOF', 
                       'BUSINESS_LICENSE', 'CERTIFICATION', 'PROFILE_PHOTO', 'WORK_SAMPLE') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    document_size_bytes BIGINT UNSIGNED,
    mime_type VARCHAR(100),
    
    -- Verification
    verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    verified_by BIGINT UNSIGNED,
    verified_at TIMESTAMP NULL,
    rejection_reason TEXT,
    
    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATE,
    
    -- Foreign Keys
    CONSTRAINT fk_documents_provider FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    CONSTRAINT fk_documents_verifier FOREIGN KEY (verified_by) 
        REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_documents_provider (provider_id),
    INDEX idx_documents_type (document_type),
    INDEX idx_documents_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: service_categories
-- Description: Master list of service categories
-- ============================================================================
CREATE TABLE service_categories (
    category_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Category Information
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_slug VARCHAR(100) NOT NULL UNIQUE,
    category_description TEXT,
    category_icon VARCHAR(255),
    category_image_url VARCHAR(500),
    
    -- Hierarchy
    parent_category_id BIGINT UNSIGNED,
    category_level INT UNSIGNED DEFAULT 1,
    display_order INT UNSIGNED DEFAULT 0,
    
    -- Pricing Guidelines
    min_base_price DECIMAL(10, 2),
    max_base_price DECIMAL(10, 2),
    price_unit ENUM('PER_HOUR', 'PER_VISIT', 'PER_SQFT', 'FIXED') DEFAULT 'PER_VISIT',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_category_id) 
        REFERENCES service_categories(category_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_categories_slug (category_slug),
    INDEX idx_categories_parent (parent_category_id),
    INDEX idx_categories_active (is_active),
    INDEX idx_categories_featured (is_featured),
    INDEX idx_categories_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: services
-- Description: Services offered by providers
-- ============================================================================
CREATE TABLE services (
    service_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    
    -- Service Information
    service_name VARCHAR(200) NOT NULL,
    service_description TEXT,
    service_highlights JSON, -- Array of highlight strings
    
    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    price_type ENUM('FIXED', 'HOURLY', 'PER_SQFT', 'STARTING_FROM', 'NEGOTIABLE') DEFAULT 'FIXED',
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    
    -- Duration
    estimated_duration_minutes INT UNSIGNED,
    min_duration_minutes INT UNSIGNED,
    max_duration_minutes INT UNSIGNED,
    
    -- Requirements
    advance_booking_hours INT UNSIGNED DEFAULT 2,
    cancellation_hours INT UNSIGNED DEFAULT 24,
    materials_included BOOLEAN DEFAULT FALSE,
    materials_description TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Statistics
    times_booked INT UNSIGNED DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_services_provider FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    CONSTRAINT fk_services_category FOREIGN KEY (category_id) 
        REFERENCES service_categories(category_id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_services_provider (provider_id),
    INDEX idx_services_category (category_id),
    INDEX idx_services_price (base_price),
    INDEX idx_services_active (is_active),
    INDEX idx_services_rating (average_rating DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: provider_service_areas
-- Description: Defines geographical areas where providers offer services
-- ============================================================================
CREATE TABLE provider_service_areas (
    area_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT UNSIGNED NOT NULL,
    
    -- Area Definition
    pincode VARCHAR(6) NOT NULL,
    city VARCHAR(100),
    area_name VARCHAR(100),
    
    -- Additional Charges
    additional_travel_charge DECIMAL(10, 2) DEFAULT 0.00,
    is_primary_area BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_service_areas_provider FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_service_areas_provider (provider_id),
    INDEX idx_service_areas_pincode (pincode),
    UNIQUE INDEX idx_service_areas_unique (provider_id, pincode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: provider_availability
-- Description: Weekly availability schedule for providers
-- ============================================================================
CREATE TABLE provider_availability (
    availability_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT UNSIGNED NOT NULL,
    
    -- Schedule
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Break Time
    break_start TIME,
    break_end TIME,
    
    -- Status
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Foreign Keys
    CONSTRAINT fk_availability_provider FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_availability_provider (provider_id),
    INDEX idx_availability_day (day_of_week),
    UNIQUE INDEX idx_availability_unique (provider_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: bookings
-- Description: Service booking records
-- ============================================================================
CREATE TABLE bookings (
    booking_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(20) NOT NULL UNIQUE,
    
    -- Parties Involved
    user_id BIGINT UNSIGNED NOT NULL,
    provider_id BIGINT UNSIGNED NOT NULL,
    service_id BIGINT UNSIGNED NOT NULL,
    
    -- Schedule
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    scheduled_end_time TIME,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    
    -- Location
    service_address_id BIGINT UNSIGNED,
    service_address TEXT NOT NULL,
    service_landmark VARCHAR(255),
    service_pincode VARCHAR(6) NOT NULL,
    service_latitude DECIMAL(10, 8),
    service_longitude DECIMAL(11, 8),
    
    -- Issue Details
    issue_title VARCHAR(255),
    issue_description TEXT,
    issue_images JSON, -- Array of image URLs
    urgency_level ENUM('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY') DEFAULT 'MEDIUM',
    
    -- Pricing
    estimated_amount DECIMAL(10, 2),
    material_cost DECIMAL(10, 2) DEFAULT 0.00,
    labor_cost DECIMAL(10, 2) DEFAULT 0.00,
    travel_charge DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(10, 2),
    
    -- Status
    booking_status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'IN_PROGRESS', 
                        'PAUSED', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED') DEFAULT 'PENDING',
    
    -- Cancellation
    cancelled_by ENUM('USER', 'PROVIDER', 'ADMIN', 'SYSTEM'),
    cancellation_reason TEXT,
    cancellation_charge DECIMAL(10, 2) DEFAULT 0.00,
    cancelled_at TIMESTAMP NULL,
    
    -- Provider Response
    provider_response_at TIMESTAMP NULL,
    provider_notes TEXT,
    
    -- Completion
    work_summary TEXT,
    completion_images JSON, -- Array of image URLs
    user_signature_url VARCHAR(500),
    
    -- Ratings (denormalized for quick access)
    user_rating DECIMAL(3, 2),
    provider_rating DECIMAL(3, 2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_provider FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) 
        REFERENCES services(service_id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_address FOREIGN KEY (service_address_id) 
        REFERENCES user_addresses(address_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_bookings_number (booking_number),
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_provider (provider_id),
    INDEX idx_bookings_service (service_id),
    INDEX idx_bookings_status (booking_status),
    INDEX idx_bookings_scheduled (scheduled_date, scheduled_time),
    INDEX idx_bookings_pincode (service_pincode),
    INDEX idx_bookings_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: booking_status_history
-- Description: Audit trail of booking status changes
-- ============================================================================
CREATE TABLE booking_status_history (
    history_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    
    -- Status Change
    previous_status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'IN_PROGRESS', 
                         'PAUSED', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED'),
    new_status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'IN_PROGRESS', 
                    'PAUSED', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED') NOT NULL,
    
    -- Who Changed
    changed_by_user_id BIGINT UNSIGNED,
    changed_by_role ENUM('USER', 'PROVIDER', 'ADMIN', 'SYSTEM') NOT NULL,
    
    -- Details
    change_reason TEXT,
    additional_data JSON,
    
    -- Timestamp
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_status_history_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_status_history_user FOREIGN KEY (changed_by_user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_status_history_booking (booking_id),
    INDEX idx_status_history_status (new_status),
    INDEX idx_status_history_changed (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: reviews
-- Description: User reviews for completed bookings
-- ============================================================================
CREATE TABLE reviews (
    review_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL UNIQUE,
    
    -- Parties
    reviewer_id BIGINT UNSIGNED NOT NULL, -- user who wrote review
    reviewee_provider_id BIGINT UNSIGNED NOT NULL, -- provider being reviewed
    
    -- Ratings (1-5 scale)
    overall_rating DECIMAL(3, 2) NOT NULL,
    quality_rating DECIMAL(3, 2),
    punctuality_rating DECIMAL(3, 2),
    professionalism_rating DECIMAL(3, 2),
    value_for_money_rating DECIMAL(3, 2),
    
    -- Review Content
    review_title VARCHAR(255),
    review_text TEXT,
    review_images JSON, -- Array of image URLs
    
    -- Provider Response
    provider_response TEXT,
    provider_responded_at TIMESTAMP NULL,
    
    -- Moderation
    moderation_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED') DEFAULT 'PENDING',
    moderated_by BIGINT UNSIGNED,
    moderated_at TIMESTAMP NULL,
    moderation_notes TEXT,
    
    -- Visibility
    is_visible BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Helpfulness
    helpful_count INT UNSIGNED DEFAULT 0,
    not_helpful_count INT UNSIGNED DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_provider FOREIGN KEY (reviewee_provider_id) 
        REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_moderator FOREIGN KEY (moderated_by) 
        REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_reviews_booking (booking_id),
    INDEX idx_reviews_provider (reviewee_provider_id),
    INDEX idx_reviews_reviewer (reviewer_id),
    INDEX idx_reviews_rating (overall_rating DESC),
    INDEX idx_reviews_status (moderation_status),
    INDEX idx_reviews_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: payments
-- Description: Payment records for bookings
-- ============================================================================
CREATE TABLE payments (
    payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_number VARCHAR(30) NOT NULL UNIQUE,
    booking_id BIGINT UNSIGNED NOT NULL,
    
    -- Payer & Payee
    payer_user_id BIGINT UNSIGNED NOT NULL,
    payee_provider_id BIGINT UNSIGNED NOT NULL,
    
    -- Amount Details
    gross_amount DECIMAL(12, 2) NOT NULL,
    platform_fee DECIMAL(12, 2) DEFAULT 0.00,
    payment_gateway_fee DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    net_amount DECIMAL(12, 2) NOT NULL,
    
    -- Currency
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Payment Method
    payment_method ENUM('UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 
                        'WALLET', 'CASH', 'BANK_TRANSFER') NOT NULL,
    payment_method_details JSON,
    
    -- Gateway Information
    payment_gateway ENUM('RAZORPAY', 'PAYTM', 'PHONEPE', 'CASH', 'OTHER') NOT NULL,
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    gateway_signature VARCHAR(500),
    
    -- Status
    payment_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 
                        'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED') DEFAULT 'PENDING',
    
    -- Payout to Provider
    payout_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'ON_HOLD') DEFAULT 'PENDING',
    payout_amount DECIMAL(12, 2),
    payout_reference VARCHAR(100),
    payout_completed_at TIMESTAMP NULL,
    
    -- Refund
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    refund_reason TEXT,
    refund_reference VARCHAR(100),
    refunded_at TIMESTAMP NULL,
    
    -- Timestamps
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_payer FOREIGN KEY (payer_user_id) 
        REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_payee FOREIGN KEY (payee_provider_id) 
        REFERENCES service_providers(provider_id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_payments_number (payment_number),
    INDEX idx_payments_booking (booking_id),
    INDEX idx_payments_payer (payer_user_id),
    INDEX idx_payments_payee (payee_provider_id),
    INDEX idx_payments_status (payment_status),
    INDEX idx_payments_gateway (gateway_payment_id),
    INDEX idx_payments_initiated (initiated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: payment_transactions
-- Description: Individual transaction records for payments
-- ============================================================================
CREATE TABLE payment_transactions (
    transaction_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT UNSIGNED NOT NULL,
    
    -- Transaction Details
    transaction_type ENUM('CHARGE', 'REFUND', 'PAYOUT', 'FEE', 'ADJUSTMENT') NOT NULL,
    transaction_reference VARCHAR(100),
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Status
    transaction_status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL,
    failure_reason TEXT,
    
    -- Gateway Response
    gateway_response JSON,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_transactions_payment FOREIGN KEY (payment_id) 
        REFERENCES payments(payment_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_transactions_payment (payment_id),
    INDEX idx_transactions_type (transaction_type),
    INDEX idx_transactions_status (transaction_status),
    INDEX idx_transactions_reference (transaction_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: conversations
-- Description: Chat conversations between users and providers
-- ============================================================================
CREATE TABLE conversations (
    conversation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED,
    
    -- Participants
    user_id BIGINT UNSIGNED NOT NULL,
    provider_id BIGINT UNSIGNED NOT NULL,
    
    -- Last Message Info (denormalized for listing)
    last_message_text TEXT,
    last_message_at TIMESTAMP NULL,
    last_message_by ENUM('USER', 'PROVIDER'),
    
    -- Unread Counts
    user_unread_count INT UNSIGNED DEFAULT 0,
    provider_unread_count INT UNSIGNED DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_conversations_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE SET NULL,
    CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_provider FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_conversations_user (user_id),
    INDEX idx_conversations_provider (provider_id),
    INDEX idx_conversations_booking (booking_id),
    INDEX idx_conversations_updated (updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: messages
-- Description: Individual messages within conversations
-- ============================================================================
CREATE TABLE messages (
    message_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    
    -- Sender
    sender_id BIGINT UNSIGNED NOT NULL,
    sender_type ENUM('USER', 'PROVIDER', 'SYSTEM') NOT NULL,
    
    -- Content
    message_type ENUM('TEXT', 'IMAGE', 'FILE', 'LOCATION', 'BOOKING_UPDATE', 'SYSTEM') DEFAULT 'TEXT',
    message_text TEXT,
    attachment_url VARCHAR(500),
    attachment_type VARCHAR(50),
    attachment_name VARCHAR(255),
    
    -- Location (if message_type is LOCATION)
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    
    -- Timestamps
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) 
        REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_messages_conversation (conversation_id),
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_sent (sent_at),
    INDEX idx_messages_unread (conversation_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: notifications
-- Description: Push notifications and in-app notifications
-- ============================================================================
CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Notification Content
    notification_type ENUM('BOOKING_CREATED', 'BOOKING_ACCEPTED', 'BOOKING_REJECTED', 
                           'BOOKING_CANCELLED', 'BOOKING_COMPLETED', 'BOOKING_REMINDER',
                           'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PAYOUT_COMPLETED',
                           'NEW_REVIEW', 'NEW_MESSAGE', 'PROMOTION', 'SYSTEM', 'OTHER') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Reference
    reference_type ENUM('BOOKING', 'PAYMENT', 'REVIEW', 'MESSAGE', 'PROMOTION', 'OTHER'),
    reference_id BIGINT UNSIGNED,
    
    -- Action
    action_url VARCHAR(500),
    action_data JSON,
    
    -- Delivery Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_type (notification_type),
    INDEX idx_notifications_unread (user_id, is_read),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: system_settings
-- Description: Application configuration and settings
-- ============================================================================
CREATE TABLE system_settings (
    setting_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Setting Information
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    
    -- Categorization
    category VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Flags
    is_public BOOLEAN DEFAULT FALSE,
    is_editable BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_settings_key (setting_key),
    INDEX idx_settings_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: admin_audit_logs
-- Description: Audit trail for admin actions
-- ============================================================================
CREATE TABLE admin_audit_logs (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Admin User
    admin_user_id BIGINT UNSIGNED NOT NULL,
    
    -- Action Details
    action_type VARCHAR(100) NOT NULL,
    action_description TEXT NOT NULL,
    
    -- Target
    target_type VARCHAR(50),
    target_id BIGINT UNSIGNED,
    
    -- Changes
    old_values JSON,
    new_values JSON,
    
    -- Request Info
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamp
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_audit_admin (admin_user_id),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_target (target_type, target_id),
    INDEX idx_audit_performed (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update provider rating after review
DELIMITER //
CREATE TRIGGER trg_update_provider_rating
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE service_providers sp
    SET 
        average_rating = (
            SELECT AVG(overall_rating) 
            FROM reviews 
            WHERE reviewee_provider_id = NEW.reviewee_provider_id 
            AND moderation_status = 'APPROVED'
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE reviewee_provider_id = NEW.reviewee_provider_id 
            AND moderation_status = 'APPROVED'
        )
    WHERE sp.provider_id = NEW.reviewee_provider_id;
END//
DELIMITER ;

-- Trigger: Update provider booking stats after booking status change
DELIMITER //
CREATE TRIGGER trg_update_provider_stats
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status != OLD.booking_status THEN
        IF NEW.booking_status = 'COMPLETED' THEN
            UPDATE service_providers 
            SET 
                completed_bookings = completed_bookings + 1,
                completion_rate = (completed_bookings + 1) * 100.0 / NULLIF(total_bookings, 0)
            WHERE provider_id = NEW.provider_id;
        ELSEIF NEW.booking_status = 'CANCELLED' THEN
            UPDATE service_providers 
            SET 
                cancelled_bookings = cancelled_bookings + 1,
                completion_rate = completed_bookings * 100.0 / NULLIF(total_bookings, 0)
            WHERE provider_id = NEW.provider_id;
        END IF;
    END IF;
END//
DELIMITER ;

-- Trigger: Increment total bookings count
DELIMITER //
CREATE TRIGGER trg_increment_booking_count
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE service_providers 
    SET total_bookings = total_bookings + 1
    WHERE provider_id = NEW.provider_id;
    
    UPDATE services 
    SET times_booked = times_booked + 1
    WHERE service_id = NEW.service_id;
END//
DELIMITER ;

-- Trigger: Generate booking number
DELIMITER //
CREATE TRIGGER trg_generate_booking_number
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
        SET NEW.booking_number = CONCAT('HL', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 100000), 5, '0'));
    END IF;
END//
DELIMITER ;

-- Trigger: Generate payment number
DELIMITER //
CREATE TRIGGER trg_generate_payment_number
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        SET NEW.payment_number = CONCAT('PAY', DATE_FORMAT(NOW(), '%Y%m%d%H%i'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
    END IF;
END//
DELIMITER ;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Find nearby providers
DELIMITER //
CREATE PROCEDURE sp_find_nearby_providers(
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8),
    IN p_radius_km INT,
    IN p_category_id BIGINT UNSIGNED,
    IN p_limit INT
)
BEGIN
    SELECT 
        sp.provider_id,
        u.name AS provider_name,
        sp.business_name,
        sp.average_rating,
        sp.total_reviews,
        sp.experience_years,
        sp.base_latitude,
        sp.base_longitude,
        (6371 * ACOS(
            COS(RADIANS(p_latitude)) * COS(RADIANS(sp.base_latitude)) *
            COS(RADIANS(sp.base_longitude) - RADIANS(p_longitude)) +
            SIN(RADIANS(p_latitude)) * SIN(RADIANS(sp.base_latitude))
        )) AS distance_km
    FROM service_providers sp
    INNER JOIN users u ON sp.user_id = u.user_id
    INNER JOIN services s ON sp.provider_id = s.provider_id
    WHERE sp.is_available = TRUE
      AND sp.kyc_status = 'VERIFIED'
      AND u.account_status = 'ACTIVE'
      AND s.category_id = p_category_id
      AND s.is_active = TRUE
    HAVING distance_km <= p_radius_km
    ORDER BY distance_km ASC, sp.average_rating DESC
    LIMIT p_limit;
END//
DELIMITER ;

-- Procedure: Get provider earnings summary
DELIMITER //
CREATE PROCEDURE sp_get_provider_earnings(
    IN p_provider_id BIGINT UNSIGNED,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        COUNT(*) AS total_completed_bookings,
        SUM(p.net_amount) AS total_earnings,
        SUM(p.platform_fee) AS total_platform_fees,
        AVG(p.net_amount) AS average_booking_value,
        MAX(p.net_amount) AS highest_booking_value
    FROM payments p
    INNER JOIN bookings b ON p.booking_id = b.booking_id
    WHERE p.payee_provider_id = p_provider_id
      AND p.payment_status = 'COMPLETED'
      AND b.scheduled_date BETWEEN p_start_date AND p_end_date;
END//
DELIMITER ;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Provider details with ratings
CREATE VIEW vw_provider_details AS
SELECT 
    sp.provider_id,
    u.user_id,
    u.name AS provider_name,
    u.phone,
    u.email,
    u.profile_image_url,
    sp.business_name,
    sp.business_description,
    sp.experience_years,
    sp.base_latitude,
    sp.base_longitude,
    sp.base_pincode,
    sp.service_radius_km,
    sp.kyc_status,
    sp.average_rating,
    sp.total_reviews,
    sp.total_bookings,
    sp.completed_bookings,
    sp.completion_rate,
    sp.is_available,
    sp.availability_status,
    sp.created_at
FROM service_providers sp
INNER JOIN users u ON sp.user_id = u.user_id
WHERE u.account_status = 'ACTIVE';

-- View: Booking details with all related info
CREATE VIEW vw_booking_details AS
SELECT 
    b.booking_id,
    b.booking_number,
    b.scheduled_date,
    b.scheduled_time,
    b.booking_status,
    b.estimated_amount,
    b.final_amount,
    b.issue_description,
    b.service_address,
    b.service_pincode,
    b.created_at,
    u.user_id,
    u.name AS customer_name,
    u.phone AS customer_phone,
    sp.provider_id,
    pu.name AS provider_name,
    pu.phone AS provider_phone,
    sp.business_name,
    sp.average_rating AS provider_rating,
    s.service_id,
    s.service_name,
    sc.category_name
FROM bookings b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN service_providers sp ON b.provider_id = sp.provider_id
INNER JOIN users pu ON sp.user_id = pu.user_id
INNER JOIN services s ON b.service_id = s.service_id
INNER JOIN service_categories sc ON s.category_id = sc.category_id;

-- View: Daily booking statistics
CREATE VIEW vw_daily_booking_stats AS
SELECT 
    DATE(created_at) AS booking_date,
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN booking_status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_bookings,
    SUM(CASE WHEN booking_status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_bookings,
    SUM(CASE WHEN booking_status = 'PENDING' THEN 1 ELSE 0 END) AS pending_bookings,
    SUM(final_amount) AS total_revenue,
    AVG(final_amount) AS average_booking_value
FROM bookings
GROUP BY DATE(created_at)
ORDER BY booking_date DESC;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
