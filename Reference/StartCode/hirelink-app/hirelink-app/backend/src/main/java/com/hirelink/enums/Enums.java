package com.hirelink.enums;

public class Enums {
    
    public enum UserType {
        CUSTOMER, PROVIDER, ADMIN, SUPER_ADMIN
    }
    
    public enum AccountStatus {
        ACTIVE, INACTIVE, SUSPENDED, BANNED, PENDING_VERIFICATION
    }
    
    public enum Gender {
        MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
    }
    
    public enum Language {
        EN, HI, TA, TE, BN, MR, GU, KN, ML
    }
    
    public enum DeviceType {
        WEB, ANDROID, IOS, DESKTOP
    }
    
    public enum AddressType {
        HOME, WORK, OTHER
    }
    
    public enum KycStatus {
        NOT_SUBMITTED, PENDING, VERIFIED, REJECTED, EXPIRED
    }
    
    public enum AvailabilityStatus {
        ONLINE, OFFLINE, BUSY, ON_BREAK
    }
    
    public enum DayOfWeek {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
    }
    
    public enum DocumentType {
        AADHAAR_FRONT, AADHAAR_BACK, PAN_CARD, ADDRESS_PROOF, 
        BUSINESS_LICENSE, CERTIFICATION, PROFILE_PHOTO, WORK_SAMPLE
    }
    
    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED
    }
    
    public enum PriceUnit {
        PER_HOUR, PER_VISIT, PER_SQFT, FIXED
    }
    
    public enum PriceType {
        FIXED, HOURLY, PER_SQFT, STARTING_FROM, NEGOTIABLE
    }
    
    public enum BookingStatus {
        PENDING, ACCEPTED, REJECTED, CONFIRMED, IN_PROGRESS, 
        PAUSED, COMPLETED, CANCELLED, DISPUTED, REFUNDED
    }
    
    public enum UrgencyLevel {
        LOW, MEDIUM, HIGH, EMERGENCY
    }
    
    public enum CancelledBy {
        USER, PROVIDER, ADMIN, SYSTEM
    }
    
    public enum PaymentMethod {
        UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING, WALLET, CASH, BANK_TRANSFER
    }
    
    public enum PaymentGateway {
        RAZORPAY, PAYTM, PHONEPE, CASH, OTHER
    }
    
    public enum PaymentStatus {
        PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED
    }
    
    public enum PayoutStatus {
        PENDING, PROCESSING, COMPLETED, FAILED, ON_HOLD
    }
    
    public enum TransactionType {
        CHARGE, REFUND, PAYOUT, FEE, ADJUSTMENT
    }
    
    public enum TransactionStatus {
        PENDING, SUCCESS, FAILED
    }
    
    public enum ModerationStatus {
        PENDING, APPROVED, REJECTED, FLAGGED
    }
    
    public enum MessageType {
        TEXT, IMAGE, FILE, LOCATION, BOOKING_UPDATE, SYSTEM
    }
    
    public enum SenderType {
        USER, PROVIDER, SYSTEM
    }
    
    public enum NotificationType {
        BOOKING_CREATED, BOOKING_ACCEPTED, BOOKING_REJECTED, 
        BOOKING_CANCELLED, BOOKING_COMPLETED, BOOKING_REMINDER,
        PAYMENT_RECEIVED, PAYMENT_FAILED, PAYOUT_COMPLETED,
        NEW_REVIEW, NEW_MESSAGE, PROMOTION, SYSTEM, OTHER
    }
    
    public enum ReferenceType {
        BOOKING, PAYMENT, REVIEW, MESSAGE, PROMOTION, OTHER
    }
    
    public enum OtpPurpose {
        REGISTRATION, LOGIN, PASSWORD_RESET, PHONE_CHANGE, EMAIL_CHANGE
    }
    
    public enum IdentifierType {
        PHONE, EMAIL
    }
}
