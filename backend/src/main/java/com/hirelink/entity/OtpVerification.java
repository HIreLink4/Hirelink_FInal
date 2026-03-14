package com.hirelink.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity for storing OTP verification codes.
 * Used for both phone (SMS) and email verification.
 */
@Entity
@Table(name = "otp_verifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The identifier can be either a phone number or email address
     * depending on the OTP type
     */
    @Column(nullable = false, length = 150)
    private String identifier;

    @Enumerated(EnumType.STRING)
    @Column(name = "otp_type", nullable = false)
    private OtpType otpType;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_used")
    @Builder.Default
    private Boolean isUsed = false;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * OTP Type enum - PHONE for SMS, EMAIL for email verification
     */
    public enum OtpType {
        PHONE,
        EMAIL
    }

    /**
     * Check if the OTP has expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Check if OTP is valid (not used and not expired)
     */
    public boolean isValid() {
        return !isUsed && !isExpired();
    }
}
