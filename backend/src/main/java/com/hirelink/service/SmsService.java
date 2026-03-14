package com.hirelink.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service for sending SMS messages.
 * 
 * MOCK IMPLEMENTATION: This is a development-only implementation that logs
 * the OTP to the console instead of actually sending SMS.
 * 
 * For production, replace this with:
 * - Twilio (https://www.twilio.com/)
 * - AWS SNS (https://aws.amazon.com/sns/)
 * - or any other SMS gateway provider
 */
@Service
@Slf4j
public class SmsService {

    /**
     * Send an OTP to the given phone number.
     * 
     * MOCK: In development, this logs the OTP to the console.
     * Check your Spring Boot logs to see the OTP code.
     * 
     * @param phoneNumber The phone number to send the OTP to
     * @param otp The 6-digit OTP code
     */
    public void sendOtp(String phoneNumber, String otp) {
        // ================================================================
        // MOCK IMPLEMENTATION - Development Only
        // ================================================================
        // In production, replace this with actual SMS sending logic
        // Example with Twilio:
        // 
        // Message.creator(
        //     new PhoneNumber(phoneNumber),
        //     new PhoneNumber(twilioPhoneNumber),
        //     "Your HireLink verification code is: " + otp
        // ).create();
        // ================================================================

        log.info("");
        log.info("╔══════════════════════════════════════════════════════════════╗");
        log.info("║                    📱 SMS OTP (MOCK)                          ║");
        log.info("╠══════════════════════════════════════════════════════════════╣");
        log.info("║  Phone: {}", padRight(phoneNumber, 48) + "║");
        log.info("║  OTP:   {}", padRight(otp, 48) + "║");
        log.info("╠══════════════════════════════════════════════════════════════╣");
        log.info("║  ⚠️  This is a MOCK SMS. Check logs for the OTP code.        ║");
        log.info("║  For production, integrate with Twilio or AWS SNS.          ║");
        log.info("╚══════════════════════════════════════════════════════════════╝");
        log.info("");
    }

    /**
     * Helper method to pad string for log formatting
     */
    private String padRight(String s, int n) {
        return String.format("%-" + n + "s", s);
    }

    /**
     * Verify phone number format.
     * 
     * @param phoneNumber The phone number to verify
     * @return true if the format is valid
     */
    public boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return false;
        }
        // Basic validation: 10-15 digits, optionally starting with +
        return phoneNumber.matches("^[+]?[0-9]{10,15}$");
    }
}
