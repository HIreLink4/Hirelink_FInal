package com.hirelink.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@hirelink.com}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("HireLink - Your Verification Code");
            message.setText(buildOtpEmailBody(otp));

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            logOtpFallback(toEmail, otp);
            throw new RuntimeException("Failed to send verification email. Please try again.", e);
        }
    }

    private String buildOtpEmailBody(String otp) {
        return """
            Hello,

            Your HireLink verification code is:

            %s

            This code will expire in 10 minutes.

            If you didn't request this code, please ignore this email.

            Best regards,
            HireLink Team

            ---
            This is an automated message. Please do not reply.
            """.formatted(otp);
    }

    public void sendPasswordResetOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("HireLink - Reset Your Password");
            message.setText(buildPasswordResetOtpEmailBody(otp));

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            logPasswordResetFallback(toEmail, otp);
            throw new RuntimeException("Failed to send password reset email. Please try again.", e);
        }
    }

    private String buildPasswordResetOtpEmailBody(String otp) {
        return """
            Hello,

            We received a request to reset your HireLink password. Use the verification code below to set a new password:

            %s

            This code will expire in 1 hour. If you didn't request a password reset, please ignore this email.

            Best regards,
            HireLink Team

            ---
            This is an automated message. Please do not reply.
            """.formatted(otp);
    }

    public void sendNewBookingNotificationToProvider(
            String toEmail,
            String providerName,
            String customerName,
            String bookingNumber,
            String serviceName,
            String date,
            String time,
            String address) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("New Booking Received - " + bookingNumber);
            message.setText(buildNewBookingEmailBody(providerName, customerName, bookingNumber, serviceName, date, time, address));

            mailSender.send(message);
            log.info("New booking notification email sent to provider: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send new booking email to provider {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildNewBookingEmailBody(
            String providerName,
            String customerName,
            String bookingNumber,
            String serviceName,
            String date,
            String time,
            String address) {
        return """
            Hello %s,

            You have received a new booking request on HireLink.

            Booking Details:
            - Booking Number: %s
            - Service: %s
            - Customer Name: %s
            - Scheduled Date: %s
            - Scheduled Time: %s
            - Service Location: %s

            Please log in to your HireLink provider portal to accept or reject this booking request.

            You can access your portal here: %s/profile

            Best regards,
            HireLink Team

            ---
            This is an automated message. Please do not reply.
            """.formatted(
                providerName,
                bookingNumber,
                serviceName,
                customerName,
                date,
                time,
                address,
                frontendUrl
        );
    }

    public void sendBookingConfirmationToUser(
            String toEmail,
            String customerName,
            String providerName,
            String bookingNumber,
            String serviceName,
            String date,
            String time) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Booking Confirmed - " + bookingNumber);
            message.setText(buildBookingConfirmationEmailBody(customerName, providerName, bookingNumber, serviceName, date, time));

            mailSender.send(message);
            log.info("Booking confirmation email sent to user: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send booking confirmation email to user {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildBookingConfirmationEmailBody(
            String customerName,
            String providerName,
            String bookingNumber,
            String serviceName,
            String date,
            String time) {
        return """
            Hello %s,

            Your booking has been confirmed by the service provider.

            Booking Details:
            - Booking Number: %s
            - Service: %s
            - Provider: %s
            - Scheduled Date: %s
            - Scheduled Time: %s

            The provider will arrive at the scheduled time. You can view more details in your HireLink dashboard.

            You can access your dashboard here: %s/bookings

            Best regards,
            HireLink Team

            ---
            This is an automated message. Please do not reply.
            """.formatted(
                customerName,
                bookingNumber,
                serviceName,
                providerName,
                date,
                time,
                frontendUrl
        );
    }

    public void sendRescheduleNotificationEmail(
            String toEmail, 
            String providerName, 
            String customerName, 
            String bookingNumber,
            String oldDate,
            String oldTime,
            String newDate,
            String newTime,
            String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("HireLink - Booking Reschedule Request: " + bookingNumber);
            message.setText(buildRescheduleEmailBody(providerName, customerName, bookingNumber, oldDate, oldTime, newDate, newTime, reason));

            mailSender.send(message);
            log.info("Reschedule notification email sent successfully to provider: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send reschedule notification email to provider {}: {}", toEmail, e.getMessage());
            // No fallback needed for notification emails, but we log the error
        }
    }

    private String buildRescheduleEmailBody(
            String providerName, 
            String customerName, 
            String bookingNumber,
            String oldDate,
            String oldTime,
            String newDate,
            String newTime,
            String reason) {
        return """
            Hello %s,

            A customer has requested to reschedule their booking.

            Booking Details:
            - Booking Number: %s
            - Customer Name: %s

            Previous Schedule:
            - Date: %s
            - Time: %s

            New Requested Schedule:
            - Date: %s
            - Time: %s

            Reason for Reschedule:
            %s

            Please log in to your HireLink provider portal to accept or reject this reschedule request.

            You can access your portal here: %s/profile

            Best regards,
            HireLink Team

            ---
            This is an automated message. Please do not reply.
            """.formatted(
                providerName, 
                bookingNumber, 
                customerName, 
                oldDate, 
                oldTime, 
                newDate, 
                newTime, 
                reason != null ? reason : "No reason provided", 
                frontendUrl
            );
    }

    private void logPasswordResetFallback(String email, String tokenOrOtp) {
        log.warn("");
        log.warn("==============================================================");
        log.warn("  PASSWORD RESET FALLBACK (DEV)");
        log.warn("==============================================================");
        log.warn("  Email failed to send. Reset token/OTP for development:");
        log.warn("  Email: {}", email);
        log.warn("  Code:  {}", tokenOrOtp);
        log.warn("==============================================================");
        log.warn("");
    }



    private void logOtpFallback(String email, String otp) {
        log.warn("");
        log.warn("==============================================================");
        log.warn("  EMAIL OTP FALLBACK (DEV)");
        log.warn("==============================================================");
        log.warn("  Email failed to send. OTP for development:");
        log.warn("  Email: {}", email);
        log.warn("  OTP:   {}", otp);
        log.warn("==============================================================");
        log.warn("");
    }

    public boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}
