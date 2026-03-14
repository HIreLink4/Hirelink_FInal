package com.hirelink.controller;

import com.hirelink.dto.ApiResponse;
import com.hirelink.dto.AuthDTO;
import com.hirelink.security.CustomUserDetails;
import com.hirelink.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> register(
            @Valid @RequestBody AuthDTO.RegisterRequest request) {
        AuthDTO.AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with phone and password")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> login(
            @Valid @RequestBody AuthDTO.LoginRequest request) {
        AuthDTO.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> refreshToken(
            @Valid @RequestBody AuthDTO.RefreshTokenRequest request) {
        AuthDTO.AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AuthDTO.ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
