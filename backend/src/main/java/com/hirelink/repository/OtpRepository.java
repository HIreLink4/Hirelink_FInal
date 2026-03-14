package com.hirelink.repository;

import com.hirelink.entity.OtpVerification;
import com.hirelink.entity.OtpVerification.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for OTP verification operations.
 * Provides methods to find valid OTPs and clean up old ones.
 */
@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    /**
     * Find a valid (unused) OTP by identifier, code, and type
     * 
     * @param identifier Phone number or email
     * @param otpCode The 6-digit OTP code
     * @param otpType PHONE or EMAIL
     * @return Optional containing the OTP if found
     */
    Optional<OtpVerification> findByIdentifierAndOtpCodeAndOtpTypeAndIsUsedFalse(
            String identifier, 
            String otpCode, 
            OtpType otpType
    );

    /**
     * Delete all OTPs for a given identifier and type.
     * Called before generating a new OTP to ensure only one active OTP exists.
     * 
     * @param identifier Phone number or email
     * @param otpType PHONE or EMAIL
     */
    @Modifying
    void deleteByIdentifierAndOtpType(String identifier, OtpType otpType);

    /**
     * Find the most recent OTP for an identifier and type
     * 
     * @param identifier Phone number or email
     * @param otpType PHONE or EMAIL
     * @return Optional containing the most recent OTP
     */
    Optional<OtpVerification> findTopByIdentifierAndOtpTypeOrderByCreatedAtDesc(
            String identifier, 
            OtpType otpType
    );
}
