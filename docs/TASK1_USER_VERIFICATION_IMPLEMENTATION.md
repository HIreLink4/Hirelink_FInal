# TASK 1: User Verification System Implementation
## OTP Authentication + Google OAuth

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication Methods Available](#authentication-methods-available)
3. [System Architecture](#system-architecture)
4. [OTP Authentication Flow](#otp-authentication-flow)
5. [Google OAuth Flow](#google-oauth-flow)
6. [Password-Based Login](#password-based-login)
7. [Gmail SMTP Configuration](#gmail-smtp-configuration)
8. [Google OAuth Configuration](#google-oauth-configuration)
9. [SMS OTP Implementation](#sms-otp-implementation)
10. [Database Changes](#database-changes)
11. [Security Considerations](#security-considerations)
12. [Configuration Summary](#configuration-summary)

---

## Overview

The HireLink application implements a modern, multi-method authentication system that provides users with flexible login options while maintaining security. The system supports:

- **Phone OTP**: One-time password sent via SMS (mock implementation for development)
- **Email OTP**: One-time password sent via Gmail SMTP
- **Google OAuth**: Single sign-on using Google accounts
- **Password Login**: Traditional phone/email + password for verified users

This implementation replaces the traditional password-only authentication with a verification-first approach, where users must first verify their identity via OTP or Google before optionally setting a password for convenience.

---

## Authentication Methods Available

### Login Page Tabs

The login interface presents four authentication options:

| Tab | Method | Description |
|-----|--------|-------------|
| **Phone** | SMS OTP | User enters phone number, receives 6-digit OTP via SMS |
| **Email** | Email OTP | User enters email, receives 6-digit OTP via Gmail |
| **Password** | Phone/Email + Password | For verified users who have set a password |
| **Google** | OAuth 2.0 | One-click login using Google account |

### User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIRST-TIME USER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Option A: OTP Login                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Enter   │───▶│  Receive │───▶│  Verify  │───▶│  Account │  │
│  │  Phone/  │    │   OTP    │    │   OTP    │    │  Created │  │
│  │  Email   │    │          │    │          │    │          │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                       │          │
│                                                       ▼          │
│                                              ┌──────────────┐    │
│                                              │ Set Password │    │
│                                              │  (Optional)  │    │
│                                              └──────────────┘    │
│                                                                  │
│  Option B: Google OAuth                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │  Click   │───▶│  Google  │───▶│  Account │                   │
│  │  Google  │    │  Auth    │    │  Created │                   │
│  │  Button  │    │          │    │          │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    RETURNING USER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • Login via OTP (Phone or Email)                               │
│  • Login via Password (if set)                                  │
│  • Login via Google (if previously linked)                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Login.jsx  │  │ authStore.js│  │      api.js            │  │
│  │  (UI/Forms) │  │ (State Mgmt)│  │  (HTTP Requests)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              GoogleOAuthProvider (main.jsx)                 ││
│  │              Wraps entire app for Google OAuth              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTP/JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Spring Boot)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ AuthController  │───▶│   AuthService   │                     │
│  │                 │    │                 │                     │
│  │ POST /send-otp  │    │ • sendPhoneOtp  │                     │
│  │ POST /verify-otp│    │ • sendEmailOtp  │                     │
│  │ POST /google    │    │ • verifyOtp     │                     │
│  │ POST /login     │    │ • googleLogin   │                     │
│  │ POST /set-pass  │    │ • login         │                     │
│  └─────────────────┘    └────────┬────────┘                     │
│                                  │                               │
│         ┌────────────────────────┼────────────────────────┐     │
│         │                        │                        │     │
│         ▼                        ▼                        ▼     │
│  ┌─────────────┐         ┌─────────────┐         ┌───────────┐ │
│  │ SmsService  │         │EmailService │         │ JwtService│ │
│  │ (Mock OTP)  │         │(Gmail SMTP) │         │  (Tokens) │ │
│  └─────────────┘         └─────────────┘         └───────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JPA/Hibernate
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE (MySQL)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────────────────────┐│
│  │     users       │         │      otp_verifications          ││
│  │                 │         │                                 ││
│  │ • user_id       │         │ • id                            ││
│  │ • phone         │         │ • identifier (phone/email)      ││
│  │ • email         │         │ • otp_type (PHONE/EMAIL)        ││
│  │ • password_hash │         │ • otp_code (6 digits)           ││
│  │ • auth_provider │         │ • expires_at                    ││
│  │ • google_id     │         │ • is_used                       ││
│  │ • is_verified   │         │ • created_at                    ││
│  └─────────────────┘         └─────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## OTP Authentication Flow

### Phone OTP Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  User    │         │ Frontend │         │ Backend  │         │ Database │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Enter Phone     │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │ 2. POST /send-otp  │                    │
     │                    │    {phone: "..."}  │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │                    │                    │ 3. Generate OTP    │
     │                    │                    │    (6 random digits)
     │                    │                    │                    │
     │                    │                    │ 4. Store OTP       │
     │                    │                    │───────────────────▶│
     │                    │                    │                    │
     │                    │                    │ 5. Log OTP to      │
     │                    │                    │    Console (Mock)  │
     │                    │                    │                    │
     │                    │ 6. Success Response│                    │
     │                    │◀───────────────────│                    │
     │                    │                    │                    │
     │ 7. Show OTP Input  │                    │                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
     │ 8. Enter OTP Code  │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │ 9. POST /verify-otp│                    │
     │                    │    {phone, otp}    │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │                    │                    │ 10. Validate OTP   │
     │                    │                    │◀───────────────────│
     │                    │                    │                    │
     │                    │                    │ 11. Create/Find    │
     │                    │                    │     User           │
     │                    │                    │───────────────────▶│
     │                    │                    │                    │
     │                    │                    │ 12. Generate JWT   │
     │                    │                    │                    │
     │                    │ 13. Auth Response  │                    │
     │                    │     (tokens, user) │                    │
     │                    │◀───────────────────│                    │
     │                    │                    │                    │
     │ 14. Redirect Home  │                    │                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
```

### Email OTP Flow

The email OTP flow is identical to phone OTP, except:
- Step 5: Instead of logging to console, sends actual email via Gmail SMTP
- Email contains a formatted HTML message with the 6-digit OTP code
- OTP validity period: 10 minutes

### OTP Specifications

| Property | Value |
|----------|-------|
| OTP Length | 6 digits |
| OTP Format | Numeric only (100000-999999) |
| Expiry Time | 10 minutes |
| Single Use | Yes (marked as used after verification) |
| Resend Cooldown | 60 seconds (frontend enforced) |

---

## Google OAuth Flow

### Authentication Sequence

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  User    │         │ Frontend │         │  Google  │         │ Backend  │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Click Google    │                    │                    │
     │    Login Button    │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │ 2. Open Google     │                    │
     │                    │    OAuth Popup     │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │ 3. Select Google   │                    │                    │
     │    Account         │                    │                    │
     │─────────────────────────────────────────▶                    │
     │                    │                    │                    │
     │                    │ 4. Return ID Token │                    │
     │                    │    (JWT credential)│                    │
     │                    │◀───────────────────│                    │
     │                    │                    │                    │
     │                    │ 5. Decode JWT      │                    │
     │                    │    (get user info) │                    │
     │                    │                    │                    │
     │                    │ 6. POST /google    │                    │
     │                    │    {googleId,      │                    │
     │                    │     email, name,   │                    │
     │                    │     imageUrl}      │                    │
     │                    │─────────────────────────────────────────▶
     │                    │                    │                    │
     │                    │                    │    7. Find/Create  │
     │                    │                    │       User         │
     │                    │                    │                    │
     │                    │                    │    8. Generate JWT │
     │                    │                    │                    │
     │                    │ 9. Auth Response   │                    │
     │                    │    (tokens, user)  │                    │
     │                    │◀────────────────────────────────────────│
     │                    │                    │                    │
     │ 10. Redirect Home  │                    │                    │
     │◀───────────────────│                    │                    │
```

### Google User Handling

When a user logs in with Google, the system:

1. **New User**: Creates a new account with:
   - Email from Google
   - Name from Google profile
   - Profile image URL from Google
   - Auth provider set to "GOOGLE"
   - Email automatically verified
   - No password required

2. **Existing Email**: If email already exists in database:
   - Links Google ID to existing account
   - Updates auth provider to "GOOGLE"
   - Imports profile image if not set

3. **Returning Google User**: Simply logs in and generates new JWT tokens

---

## Password-Based Login

### For Verified Users

After a user verifies via OTP, they can optionally set a password:

1. Navigate to Profile page
2. Security section shows "Set Password" option
3. Enter and confirm new password (minimum 8 characters)
4. Password is hashed using BCrypt before storage

### Password Login Flow

```
User enters phone/email + password
          │
          ▼
    ┌─────────────┐
    │ Find user   │
    │ by phone or │
    │ email       │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐     No      ┌─────────────────────┐
    │ Has password│────────────▶│ Error: Use OTP to   │
    │ set?        │             │ login first         │
    └──────┬──────┘             └─────────────────────┘
           │ Yes
           ▼
    ┌─────────────┐     No      ┌─────────────────────┐
    │ Password    │────────────▶│ Error: Invalid      │
    │ matches?    │             │ credentials         │
    └──────┬──────┘             └─────────────────────┘
           │ Yes
           ▼
    ┌─────────────┐
    │ Generate    │
    │ JWT tokens  │
    └──────┬──────┘
           │
           ▼
      Login Success
```

---

## Gmail SMTP Configuration

### How Email OTP Works

The system uses Gmail's SMTP server to send OTP emails. This requires:

1. **Gmail Account**: A Gmail account to send emails from
2. **App Password**: A 16-character application-specific password (not the regular Gmail password)

### Setting Up Gmail App Password

1. Go to Google Account settings (myaccount.google.com)
2. Navigate to Security → 2-Step Verification (must be enabled)
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Configuration Properties

The following properties must be set in `application.properties` or `application-local.properties`:

| Property | Value | Description |
|----------|-------|-------------|
| spring.mail.host | smtp.gmail.com | Gmail SMTP server |
| spring.mail.port | 587 | TLS port |
| spring.mail.username | your-email@gmail.com | Sender email |
| spring.mail.password | xxxx-xxxx-xxxx-xxxx | App password |
| spring.mail.properties.mail.smtp.auth | true | Enable authentication |
| spring.mail.properties.mail.smtp.starttls.enable | true | Enable TLS |

### Email Content

When an OTP is sent, the email contains:
- Subject: "HireLink - Your Verification Code"
- Body: HTML formatted message with the 6-digit OTP
- Expiry notice: "Code expires in 10 minutes"

---

## Google OAuth Configuration

### Google Cloud Console Setup

1. **Create Project**:
   - Go to Google Cloud Console (console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable APIs**:
   - Enable "Google+ API" (for profile info)
   - Enable "Google Identity Services"

3. **Configure OAuth Consent Screen**:
   - Choose "External" user type
   - Fill in application name, support email
   - Add scopes: email, profile, openid

4. **Create OAuth Credentials**:
   - Go to Credentials → Create Credentials → OAuth Client ID
   - Application type: Web application
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - Your production domain
   - Add authorized redirect URIs if needed

5. **Get Client ID**:
   - Copy the Client ID (ends with .apps.googleusercontent.com)

### Frontend Configuration

The Google Client ID is configured via environment variable:

| File | Variable | Value |
|------|----------|-------|
| frontend/.env | VITE_GOOGLE_CLIENT_ID | Your Google Client ID |

The `GoogleOAuthProvider` wraps the entire React application in `main.jsx`, providing Google authentication context to all components.

### Libraries Used

| Library | Purpose |
|---------|---------|
| @react-oauth/google | React components for Google OAuth |
| jwt-decode | Decode Google's ID token to extract user info |

---

## SMS OTP Implementation

### Current Implementation: Mock/Console

For development purposes, SMS OTP uses a **mock implementation** that logs the OTP to the server console instead of sending actual SMS messages.

### How It Works

1. User requests OTP for their phone number
2. System generates a 6-digit random code
3. Code is stored in database with expiry time
4. **Instead of sending SMS**: Code is printed to server console
5. Developer can see the OTP in terminal logs

### Console Output Example

```
====================================
📱 SMS OTP (Development Mode)
====================================
Phone: +919876543210
OTP: 847293
====================================
```

### Production SMS Integration

For production, the `SmsService` can be updated to integrate with SMS providers:

| Provider | Description |
|----------|-------------|
| Twilio | Global SMS provider with API |
| AWS SNS | Amazon Simple Notification Service |
| MSG91 | India-focused SMS gateway |
| Nexmo/Vonage | International SMS API |

The mock implementation allows full testing of the OTP flow without incurring SMS costs during development.

---

## Database Changes

### New Table: otp_verifications

This table stores temporary OTP codes for verification.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| identifier | VARCHAR(150) | NOT NULL | Phone number or email |
| otp_type | VARCHAR(20) | NOT NULL | 'PHONE' or 'EMAIL' |
| otp_code | VARCHAR(6) | NOT NULL | 6-digit OTP code |
| expires_at | DATETIME | NOT NULL | Expiration timestamp |
| is_used | TINYINT(1) | DEFAULT 0 | Whether OTP has been used |
| created_at | DATETIME | DEFAULT NOW | Creation timestamp |

**Indexes:**
- `idx_identifier_type` on (identifier, otp_type) - For quick lookups
- `idx_expires_at` on (expires_at) - For cleanup queries

### Modified Table: users

The following columns were added or modified:

| Column | Type | Change | Description |
|--------|------|--------|-------------|
| auth_provider | VARCHAR(20) | ADDED | 'LOCAL' or 'GOOGLE' |
| google_id | VARCHAR(100) | ADDED | Google account ID |
| password_hash | VARCHAR(255) | MODIFIED | Now nullable (for OTP/Google users) |
| phone | VARCHAR(15) | MODIFIED | Now nullable (for email-only users) |

### SQL Migration Script

The migration script `database/migration_otp_auth.sql` performs:

1. Adds `auth_provider` column with default 'LOCAL'
2. Adds `google_id` column for Google OAuth users
3. Modifies `password_hash` to allow NULL values
4. Modifies `phone` to allow NULL values
5. Creates index on `google_id` for faster lookups
6. Creates `otp_verifications` table with proper indexes

### Manual SQL Commands Required

Due to Hibernate's limitations with `ddl-auto=update`, the following commands may need to be run manually:

```sql
-- Make password_hash nullable
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- Make phone nullable  
ALTER TABLE users MODIFY COLUMN phone VARCHAR(15) NULL;
```

---

## Security Considerations

### OTP Security

| Measure | Implementation |
|---------|----------------|
| Short Expiry | OTPs expire after 10 minutes |
| Single Use | OTPs are marked as used after verification |
| Secure Generation | Uses SecureRandom for cryptographic randomness |
| Rate Limiting | 60-second cooldown between OTP requests (frontend) |
| Cleanup | Old OTPs are deleted when new ones are generated |

### Password Security

| Measure | Implementation |
|---------|----------------|
| Hashing | BCrypt with default strength factor |
| Minimum Length | 8 characters enforced |
| No Plain Storage | Only hash stored in database |

### JWT Token Security

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access Token | 24 hours | API authentication |
| Refresh Token | 7 days | Obtain new access tokens |

### Google OAuth Security

| Measure | Description |
|---------|-------------|
| ID Token Verification | Token is decoded to extract user info |
| Google ID Storage | Used to identify returning Google users |
| Email Linking | Existing accounts can be linked to Google |

---

## Configuration Summary

### Backend (application.properties)

| Configuration | Purpose |
|---------------|---------|
| spring.mail.* | Gmail SMTP settings for email OTP |
| spring.datasource.* | MySQL database connection |
| jwt.secret | Secret key for JWT signing |
| jwt.access-expiration | Access token validity |
| jwt.refresh-expiration | Refresh token validity |

### Backend (application-local.properties)

| Configuration | Purpose |
|---------------|---------|
| MAIL_USERNAME | Gmail address for sending OTPs |
| MAIL_PASSWORD | Gmail app password |

### Frontend (.env)

| Configuration | Purpose |
|---------------|---------|
| VITE_API_URL | Backend API base URL |
| VITE_GOOGLE_CLIENT_ID | Google OAuth Client ID |

---

## Summary

The User Verification System implementation provides:

1. **Multiple Authentication Options**: Phone OTP, Email OTP, Google OAuth, and Password
2. **Verification-First Approach**: Users verify identity before setting optional password
3. **Seamless User Experience**: Single login page with tabbed interface
4. **Security**: BCrypt passwords, JWT tokens, expiring OTPs
5. **Flexibility**: Users can login via their preferred method
6. **Development-Friendly**: Mock SMS for easy testing

This implementation follows modern authentication practices while maintaining simplicity for both users and developers.
