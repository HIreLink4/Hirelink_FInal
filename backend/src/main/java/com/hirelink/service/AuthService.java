package com.hirelink.service;

import com.hirelink.dto.AuthDTO;
import com.hirelink.entity.EmailVerificationToken;
import com.hirelink.entity.OtpVerification;
import com.hirelink.entity.OtpVerification.OtpType;
import com.hirelink.entity.PasswordResetToken;
import com.hirelink.entity.ServiceProvider;
import com.hirelink.entity.User;
import com.hirelink.entity.UserRole;
import com.hirelink.exception.BadRequestException;
import com.hirelink.exception.ResourceNotFoundException;
import com.hirelink.exception.UnauthorizedException;
import com.hirelink.repository.EmailVerificationTokenRepository;
import com.hirelink.repository.OtpRepository;
import com.hirelink.repository.PasswordResetTokenRepository;
import com.hirelink.repository.ServiceCategoryRepository;
import com.hirelink.repository.ServiceProviderRepository;
import com.hirelink.repository.UserRepository;
import com.hirelink.repository.UserRoleRepository;
import com.hirelink.security.CustomUserDetails;
import com.hirelink.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final ServiceProviderRepository providerRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final OtpRepository otpRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SmsService smsService;
    private final EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
    private static final int PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

    /**
     * OTP-verified registration.
     * User must call /send-otp first, then submit name + phone + otp + password.
     * Always creates a CUSTOMER account with verified phone.
     */
    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        OtpVerification otp = otpRepository
                .findByIdentifierAndOtpCodeAndOtpTypeAndIsUsedFalse(
                        request.getPhone(), request.getOtp(), OtpType.PHONE)
                .orElseThrow(() -> new UnauthorizedException("Invalid OTP code"));

        if (otp.isExpired()) {
            throw new UnauthorizedException("OTP has expired. Please request a new one.");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);

        if (userRepository.existsByPhoneAndDeletedAtIsNull(request.getPhone())) {
            throw new BadRequestException("Phone number already registered. Please login instead.");
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty() &&
            userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        clearDeletedUserCredentials(request.getPhone(), request.getEmail());

        User user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .userType(User.UserType.CUSTOMER)
                .accountStatus(User.AccountStatus.ACTIVE)
                .isPhoneVerified(true)
                .phoneVerifiedAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        UserRole customerRole = UserRole.builder()
                .user(user)
                .role("CUSTOMER")
                .build();
        userRoleRepository.save(customerRole);
        user.setRoles(List.of(customerRole));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        log.info("New user registered with OTP-verified phone: {}", request.getPhone());

        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(mapToUserDTO(user))
                .build();
    }

    /**
     * Email-verified registration.
     * Creates the account in PENDING_VERIFICATION status and sends a verification link.
     */
    @Transactional
    public AuthDTO.MessageResponse registerWithEmail(AuthDTO.EmailRegisterRequest request) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new BadRequestException("Email already registered. Please login instead.");
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty() &&
            userRepository.existsByPhoneAndDeletedAtIsNull(request.getPhone())) {
            throw new BadRequestException("Phone number already registered. Please login instead.");
        }

        clearDeletedUserCredentials(request.getPhone(), request.getEmail());

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .userType(User.UserType.CUSTOMER)
                .accountStatus(User.AccountStatus.PENDING_VERIFICATION)
                .isEmailVerified(false)
                .build();

        user = userRepository.save(user);

        UserRole customerRole = UserRole.builder()
                .user(user)
                .role("CUSTOMER")
                .build();
        userRoleRepository.save(customerRole);
        user.setRoles(List.of(customerRole));

        user.setRoles(List.of(customerRole));

        sendRegistrationEmailOtp(user.getEmail());

        log.info("New user registered, verification OTP email sent to: {}", request.getEmail());

        return AuthDTO.MessageResponse.builder()
                .message("Registration successful. Please check your email for the verification code.")
                .build();
    }

    /**
     * Send OTP for email verification during registration.
     */
    @Transactional
    public void sendRegistrationEmailOtp(String email) {
        if (!emailService.isValidEmail(email)) {
            throw new BadRequestException("Invalid email format");
        }

        otpRepository.deleteByIdentifierAndOtpType(email, OtpType.EMAIL);

        String otpCode = generateOtp();
        OtpVerification otp = OtpVerification.builder()
                .identifier(email)
                .otpType(OtpType.EMAIL)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build();
        otpRepository.save(otp);

        emailService.sendOtpEmail(email, otpCode);
        log.info("Registration OTP sent to email: {}", email);
    }

    /**
     * Verify registration OTP and activate user account.
     */
    @Transactional
    public AuthDTO.AuthResponse verifyRegistrationOtp(AuthDTO.VerifyOtpRequest request) {
        String email = request.getEmail();
        String otpCode = request.getOtp();

        if (email == null || email.isEmpty()) {
            throw new BadRequestException("Email is required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new BadRequestException("Email already verified. Please login.");
        }

        OtpVerification otp = otpRepository
                .findByIdentifierAndOtpCodeAndOtpTypeAndIsUsedFalse(email, otpCode, OtpType.EMAIL)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired OTP code"));

        if (otp.isExpired()) {
            throw new UnauthorizedException("OTP has expired. Please request a new one.");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);

        user.setIsEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        userRepository.save(user);

        log.info("Registration email verified via OTP for user: {}", email);

        // Auto-login after verification
        ensureUserHasRoles(user);
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(mapToUserDTO(user))
                .build();
    }

    /**
     * Resend the verification email for an unverified account.
     */
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email."));

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new BadRequestException("Email is already verified. Please login.");
        }

        sendRegistrationEmailOtp(email);

        log.info("Verification OTP email resent to: {}", email);
    }

    /**
     * Login with phone/email and password.
     */
    @Transactional
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        User user;
        String identifier;

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            identifier = request.getPhone();
            user = userRepository.findByPhone(request.getPhone())
                    .orElseThrow(() -> new UnauthorizedException("Invalid phone or password"));
        } else if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            identifier = request.getEmail();
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        } else {
            throw new BadRequestException("Phone or email is required");
        }

        if (user.getAccountStatus() == User.AccountStatus.BANNED) {
            throw new UnauthorizedException("Your account has been banned. Reason: " + 
                (user.getBannedReason() != null ? user.getBannedReason() : "Violation of terms"));
        }

        if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
            throw new UnauthorizedException("Your account is currently suspended. Please contact support.");
        }

        // Block login for email-registered users who haven't verified yet.
        // Phone-verified and Google users are not affected.
        if (user.getAccountStatus() == User.AccountStatus.PENDING_VERIFICATION
                && !Boolean.TRUE.equals(user.getIsPhoneVerified())
                && !Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new UnauthorizedException("Please verify your email before signing in. Check your inbox for the verification code (OTP).");
        }

        if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
            throw new UnauthorizedException("Password not set. Please login with OTP first and set a password.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            userRepository.save(user);
            throw new UnauthorizedException("Invalid credentials");
        }

        ensureUserHasRoles(user);

        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        log.info("User logged in with password: {}", identifier);

        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(mapToUserDTO(user))
                .build();
    }

    public AuthDTO.AuthResponse refreshToken(String refreshToken) {
        String phone = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        CustomUserDetails userDetails = new CustomUserDetails(user);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        ensureUserHasRoles(user);

        String newAccessToken = jwtService.generateAccessToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthDTO.AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(mapToUserDTO(user))
                .build();
    }

    @Transactional
    public void changePassword(Long userId, AuthDTO.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void setPassword(Long userId, AuthDTO.SetPasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!Boolean.TRUE.equals(user.getIsPhoneVerified()) && !Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new BadRequestException("Please verify your phone or email before setting a password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        log.info("Password set for user: {}", userId);
    }

    // ============================================
    // Profile-level Email Verification
    // ============================================

    /**
     * Send an OTP to the authenticated user's email for verification from their profile.
     */
    @Transactional
    public void sendProfileEmailOtp(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new BadRequestException("No email address on your account. Please add one first.");
        }

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new BadRequestException("Email is already verified.");
        }

        sendEmailOtp(user.getEmail());
    }

    /**
     * Verify an OTP submitted from the profile page to mark the user's email as verified.
     */
    @Transactional
    public void verifyProfileEmailOtp(Long userId, String otpCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new BadRequestException("No email address on your account.");
        }

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            return; // idempotent
        }

        OtpVerification otp = otpRepository
                .findByIdentifierAndOtpCodeAndOtpTypeAndIsUsedFalse(user.getEmail(), otpCode, OtpType.EMAIL)
                .orElseThrow(() -> new UnauthorizedException("Invalid OTP code"));

        if (otp.isExpired()) {
            throw new UnauthorizedException("OTP has expired. Please request a new one.");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);

        user.setIsEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        if (user.getAccountStatus() == User.AccountStatus.PENDING_VERIFICATION) {
            user.setAccountStatus(User.AccountStatus.ACTIVE);
        }
        userRepository.save(user);

        log.info("Email verified via profile OTP for user: {}", userId);
    }

    // ============================================
    // Forgot / Reset Password
    // ============================================

    /**
     * Sends a password-reset link to the given email.
     * Always returns success to prevent email enumeration.
     */
    @Transactional
    public void forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("Password reset requested for unknown email: {}", email);
            return;
        }

        User user = userOpt.get();
        if (user.getAccountStatus() == User.AccountStatus.BANNED) {
            throw new UnauthorizedException("Your account has been banned. Reason: " + 
                (user.getBannedReason() != null ? user.getBannedReason() : "Violation of terms"));
        }
        if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
            throw new UnauthorizedException("Your account is currently suspended. Please contact support.");
        }
        passwordResetTokenRepository.deleteByUser(user);

        String otp = generateOtp();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(otp)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(PASSWORD_RESET_TOKEN_EXPIRY_HOURS))
                .build();
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetOtpEmail(user.getEmail(), otp);
        log.info("Password reset OTP email sent to: {}", email);
    }

    /**
     * Validates the reset token and sets the new password.
     */
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUserEmailAndIsUsedFalse(otp, email)
                .orElseThrow(() -> new BadRequestException("Invalid or already used reset code."));

        if (resetToken.isExpired()) {
            throw new BadRequestException("Reset code has expired. Please request a new one.");
        }

        resetToken.setIsUsed(true);
        passwordResetTokenRepository.save(resetToken);

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset successful for user: {}", user.getEmail());
    }

    // ============================================
    // OTP Authentication Methods
    // ============================================

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    @Transactional
    public void sendPhoneOtp(String phone, String email) {
        if (!smsService.isValidPhoneNumber(phone)) {
            throw new BadRequestException("Invalid phone number format");
        }

        // Check if user is banned
        Optional<User> userOpt = userRepository.findByPhone(phone);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getAccountStatus() == User.AccountStatus.BANNED) {
                throw new UnauthorizedException("Your account has been banned. Reason: " + 
                    (user.getBannedReason() != null ? user.getBannedReason() : "Violation of terms"));
            }
            if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
                throw new UnauthorizedException("Your account is currently suspended. Please contact support.");
            }
        }

        otpRepository.deleteByIdentifierAndOtpType(phone, OtpType.PHONE);

        String otpCode = generateOtp();
        OtpVerification otp = OtpVerification.builder()
                .identifier(phone)
                .otpType(OtpType.PHONE)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build();
        otpRepository.save(otp);

        smsService.sendOtp(phone, otpCode);

        if (email != null && !email.isEmpty()) {
            emailService.sendOtpEmail(email, otpCode);
            log.info("Phone OTP sent to: {} and also emailed to: {}", phone, email);
        } else {
            log.info("Phone OTP sent to: {}", phone);
        }
    }

    @Transactional
    public void sendEmailOtp(String email) {
        if (!emailService.isValidEmail(email)) {
            throw new BadRequestException("Invalid email format");
        }

        // Check if user is banned
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getAccountStatus() == User.AccountStatus.BANNED) {
                throw new UnauthorizedException("Your account has been banned. Reason: " + 
                    (user.getBannedReason() != null ? user.getBannedReason() : "Violation of terms"));
            }
            if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
                throw new UnauthorizedException("Your account is currently suspended. Please contact support.");
            }
        }

        otpRepository.deleteByIdentifierAndOtpType(email, OtpType.EMAIL);

        String otpCode = generateOtp();
        OtpVerification otp = OtpVerification.builder()
                .identifier(email)
                .otpType(OtpType.EMAIL)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build();
        otpRepository.save(otp);

        emailService.sendOtpEmail(email, otpCode);

        log.info("Email OTP sent to: {}", email);
    }

    /**
     * Verify OTP and login existing user.
     * For new users via OTP login, creates a CUSTOMER account automatically.
     * No userType selection -- everyone starts as CUSTOMER.
     */
    @Transactional
    public AuthDTO.AuthResponse verifyOtpAndLogin(AuthDTO.VerifyOtpRequest request) {
        String identifier;
        OtpType otpType;

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            identifier = request.getPhone();
            otpType = OtpType.PHONE;
        } else if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            identifier = request.getEmail();
            otpType = OtpType.EMAIL;
        } else {
            throw new BadRequestException("Phone or email is required");
        }

        OtpVerification otp = otpRepository
                .findByIdentifierAndOtpCodeAndOtpTypeAndIsUsedFalse(identifier, request.getOtp(), otpType)
                .orElseThrow(() -> new UnauthorizedException("Invalid OTP code"));

        if (otp.isExpired()) {
            throw new UnauthorizedException("OTP has expired. Please request a new one.");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);

        User user;
        if (otpType == OtpType.PHONE) {
            user = userRepository.findByPhone(identifier)
                    .orElseGet(() -> createUserFromOtp(identifier, null, request.getName()));
            user.setIsPhoneVerified(true);
            user.setPhoneVerifiedAt(LocalDateTime.now());
        } else {
            user = userRepository.findByEmail(identifier)
                    .orElseGet(() -> createUserFromOtp(null, identifier, request.getName()));
            user.setIsEmailVerified(true);
            user.setEmailVerifiedAt(LocalDateTime.now());
        }

        if (user.getAccountStatus() == User.AccountStatus.BANNED) {
            throw new UnauthorizedException("Your account has been banned. Reason: " + 
                (user.getBannedReason() != null ? user.getBannedReason() : "Violation of terms"));
        }

        if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
            throw new UnauthorizedException("Your account is currently suspended. Please contact support.");
        }

        ensureUserHasRoles(user);

        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        user = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        log.info("User logged in via OTP: {} (type: {})", identifier, otpType);

        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(mapToUserDTO(user))
                .build();
    }

    /**
     * Create a new CUSTOMER user from OTP verification (for first-time users).
     */
    private User createUserFromOtp(String phone, String email, String name) {
        String userName = name;
        if (userName == null || userName.isEmpty()) {
            if (phone != null) {
                userName = "User " + phone.substring(Math.max(0, phone.length() - 4));
            } else if (email != null) {
                userName = email.split("@")[0];
            } else {
                userName = "HireLink User";
            }
        }

        User user = User.builder()
                .name(userName)
                .phone(phone)
                .email(email)
                .authProvider(User.AuthProvider.LOCAL)
                .userType(User.UserType.CUSTOMER)
                .accountStatus(User.AccountStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        UserRole customerRole = UserRole.builder()
                .user(user)
                .role("CUSTOMER")
                .build();
        userRoleRepository.save(customerRole);

        user.setRoles(List.of(customerRole));

        log.info("New CUSTOMER user created via OTP: {}", phone != null ? phone : email);
        return user;
    }

    // ============================================
    // Google OAuth Authentication
    // ============================================

    /**
     * Login or register user with Google OAuth.
     * New users are always created as CUSTOMER.
     */
    @Transactional
    public AuthDTO.AuthResponse googleLogin(AuthDTO.GoogleLoginRequest request) {
        Optional<User> existingByGoogleId = userRepository.findByGoogleId(request.getGoogleId());

        if (existingByGoogleId.isPresent()) {
            User user = existingByGoogleId.get();
            if (user.getAccountStatus() == User.AccountStatus.BANNED) {
                throw new UnauthorizedException("Your account has been banned. Reason: " + 
                    (user.getBannedReason() != null ? user.getBannedReason() : "Violation of terms"));
            }
            if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
                throw new UnauthorizedException("Your account is currently suspended. Please contact support.");
            }
            ensureUserHasRoles(user);
            return generateAuthResponse(user);
        }

        Optional<User> existingByEmail = userRepository.findByEmail(request.getEmail());

        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            if (user.getAccountStatus() == User.AccountStatus.BANNED) {
                throw new UnauthorizedException("Your account has been banned. Reason: " + 
                    (user.getBannedReason() != null ? user.getBannedReason() : "Violation of terms"));
            }
            if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
                throw new UnauthorizedException("Your account is currently suspended. Please contact support.");
            }
            user.setGoogleId(request.getGoogleId());
            user.setAuthProvider(User.AuthProvider.GOOGLE);
            if (request.getImageUrl() != null && user.getProfileImageUrl() == null) {
                user.setProfileImageUrl(request.getImageUrl());
            }
            user.setIsEmailVerified(true);
            user.setEmailVerifiedAt(LocalDateTime.now());
            user = userRepository.save(user);

            ensureUserHasRoles(user);

            log.info("Linked Google account to existing user: {}", request.getEmail());
            return generateAuthResponse(user);
        }

        // New user -- always CUSTOMER
        String userName = request.getName();
        if (userName == null || userName.isEmpty()) {
            userName = request.getEmail().split("@")[0];
        }

        User newUser = User.builder()
                .name(userName)
                .email(request.getEmail())
                .googleId(request.getGoogleId())
                .profileImageUrl(request.getImageUrl())
                .authProvider(User.AuthProvider.GOOGLE)
                .userType(User.UserType.CUSTOMER)
                .accountStatus(User.AccountStatus.ACTIVE)
                .isEmailVerified(true)
                .emailVerifiedAt(LocalDateTime.now())
                .build();

        newUser = userRepository.save(newUser);

        UserRole customerRole = UserRole.builder()
                .user(newUser)
                .role("CUSTOMER")
                .build();
        userRoleRepository.save(customerRole);

        newUser.setRoles(List.of(customerRole));

        log.info("New CUSTOMER user registered via Google: {}", request.getEmail());
        return generateAuthResponse(newUser);
    }

    // ============================================
    // Become Provider
    // ============================================

    /**
     * Submit a provider application for an existing CUSTOMER.
     * Creates service_providers record with PENDING kycStatus. The PROVIDER role
     * is granted only after admin approval.
     */
    @Transactional
    public AuthDTO.MessageResponse becomeProvider(Long userId, AuthDTO.BecomeProviderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (userRoleRepository.existsByUserUserIdAndRole(userId, "PROVIDER")) {
            throw new BadRequestException("You are already registered as a provider");
        }

        Optional<ServiceProvider> existingProvider = providerRepository.findByUserUserId(userId);
        if (existingProvider.isPresent()) {
            ServiceProvider.KycStatus status = existingProvider.get().getKycStatus();
            if (status == ServiceProvider.KycStatus.PENDING) {
                throw new BadRequestException("Your provider application is already pending review");
            }
            if (status == ServiceProvider.KycStatus.VERIFIED) {
                throw new BadRequestException("Your provider application is already approved");
            }
            if (status == ServiceProvider.KycStatus.REJECTED) {
                ServiceProvider provider = existingProvider.get();
                provider.setKycStatus(ServiceProvider.KycStatus.PENDING);
                provider.setKycRejectionReason(null);
                if (request.getCategoryId() != null) {
                    categoryRepository.findById(request.getCategoryId())
                            .ifPresent(provider::setPrimaryCategory);
                }
                if (request.getBaseAddress() != null) provider.setBaseAddress(request.getBaseAddress());
                if (request.getBasePincode() != null) provider.setBasePincode(request.getBasePincode());
                if (request.getBaseLatitude() != null) provider.setBaseLatitude(request.getBaseLatitude());
                if (request.getBaseLongitude() != null) provider.setBaseLongitude(request.getBaseLongitude());
                providerRepository.save(provider);
                log.info("User {} resubmitted provider application", userId);
                return AuthDTO.MessageResponse.builder()
                        .message("Your provider application has been resubmitted for review")
                        .build();
            }
        }

        ServiceProvider.ServiceProviderBuilder providerBuilder = ServiceProvider.builder()
                .user(user)
                .businessName(user.getName() + "'s Services")
                .kycStatus(ServiceProvider.KycStatus.PENDING);

        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .ifPresent(providerBuilder::primaryCategory);
        }
        if (request.getBaseAddress() != null) {
            providerBuilder.baseAddress(request.getBaseAddress());
        }
        if (request.getBasePincode() != null) {
            providerBuilder.basePincode(request.getBasePincode());
        }
        if (request.getBaseLatitude() != null) {
            providerBuilder.baseLatitude(request.getBaseLatitude());
        }
        if (request.getBaseLongitude() != null) {
            providerBuilder.baseLongitude(request.getBaseLongitude());
        }

        providerRepository.save(providerBuilder.build());

        log.info("User {} submitted provider application for admin review", userId);

        return AuthDTO.MessageResponse.builder()
                .message("Your provider application has been submitted for review. You will be notified once approved.")
                .build();
    }

    // ============================================
    // Helpers
    // ============================================

    /**
     * Ensure legacy users (created before user_roles table) have roles populated.
     */
    private void ensureUserHasRoles(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            List<UserRole> roles = new ArrayList<>();

            UserRole primaryRole = UserRole.builder()
                    .user(user)
                    .role(user.getUserType().name())
                    .build();
            userRoleRepository.save(primaryRole);
            roles.add(primaryRole);

            // Providers also get CUSTOMER role
            if (user.getUserType() == User.UserType.PROVIDER) {
                UserRole customerRole = UserRole.builder()
                        .user(user)
                        .role("CUSTOMER")
                        .build();
                userRoleRepository.save(customerRole);
                roles.add(customerRole);
            }

            user.setRoles(roles);
        }
    }

    private AuthDTO.AuthResponse generateAuthResponse(User user) {
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(mapToUserDTO(user))
                .build();
    }

    /**
     * Nulls out email/phone on any soft-deleted users that still occupy the unique constraint,
     * so a new user can register with the same credentials.
     */
    private void clearDeletedUserCredentials(String phone, String email) {
        if (phone != null && !phone.isEmpty()) {
            userRepository.findByPhone(phone).ifPresent(existing -> {
                if (existing.getDeletedAt() != null) {
                    existing.setPhone(null);
                    userRepository.saveAndFlush(existing);
                }
            });
        }
        if (email != null && !email.isEmpty()) {
            userRepository.findByEmail(email).ifPresent(existing -> {
                if (existing.getDeletedAt() != null) {
                    existing.setEmail(null);
                    userRepository.saveAndFlush(existing);
                }
            });
        }
    }

    private AuthDTO.UserDTO mapToUserDTO(User user) {
        List<String> roleNames = List.of("CUSTOMER");
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            roleNames = user.getRoles().stream()
                    .map(UserRole::getRole)
                    .collect(Collectors.toList());
        }

        Optional<ServiceProvider> providerOpt = providerRepository.findByUserUserId(user.getUserId());
        boolean hasProviderProfile = user.getServiceProvider() != null || providerOpt.isPresent();
        String providerAppStatus = providerOpt.map(sp -> sp.getKycStatus().name()).orElse(null);

        return AuthDTO.UserDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .userType(user.getUserType().name())
                .roles(roleNames)
                .hasProviderProfile(hasProviderProfile)
                .providerApplicationStatus(providerAppStatus)
                .accountStatus(user.getAccountStatus().name())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .authProvider(user.getAuthProvider() != null ? user.getAuthProvider().name() : "LOCAL")
                .hasPassword(user.getPasswordHash() != null && !user.getPasswordHash().isEmpty())
                .build();
    }
}
