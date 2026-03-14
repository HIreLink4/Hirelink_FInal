package com.hirelink.controller;

import com.hirelink.dto.*;
import com.hirelink.entity.User;
import com.hirelink.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ============================================================================
// Authentication Controller
// ============================================================================
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Registration successful", response));
    }
    
    @PostMapping("/login")
    @Operation(summary = "Login with phone and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        // Implementation for token refresh
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", null));
    }
}

// ============================================================================
// User Controller
// ============================================================================
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
class UserController {
    
    private final UserService userService;
    
    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(@AuthenticationPrincipal User user) {
        UserDTO userDTO = userService.getUserById(user.getId());
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO userDTO = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }
    
    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateCurrentUser(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserUpdateRequest request) {
        UserDTO userDTO = userService.updateUser(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userDTO));
    }
}

// ============================================================================
// Category Controller
// ============================================================================
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Service category endpoints")
class CategoryController {
    
    private final CategoryService categoryService;
    
    @GetMapping
    @Operation(summary = "Get all service categories")
    public ResponseEntity<ApiResponse<List<ServiceCategoryDTO>>> getAllCategories() {
        List<ServiceCategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<ServiceCategoryDTO>> getCategoryById(@PathVariable Long id) {
        ServiceCategoryDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get category by slug")
    public ResponseEntity<ApiResponse<ServiceCategoryDTO>> getCategoryBySlug(@PathVariable String slug) {
        ServiceCategoryDTO category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(category));
    }
    
    @GetMapping("/featured")
    @Operation(summary = "Get featured categories")
    public ResponseEntity<ApiResponse<List<ServiceCategoryDTO>>> getFeaturedCategories() {
        List<ServiceCategoryDTO> categories = categoryService.getFeaturedCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
    
    @GetMapping("/{id}/subcategories")
    @Operation(summary = "Get subcategories of a category")
    public ResponseEntity<ApiResponse<List<ServiceCategoryDTO>>> getSubCategories(@PathVariable Long id) {
        List<ServiceCategoryDTO> categories = categoryService.getSubCategories(id);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}

// ============================================================================
// Provider Controller
// ============================================================================
@RestController
@RequestMapping("/api/v1/providers")
@RequiredArgsConstructor
@Tag(name = "Providers", description = "Service provider endpoints")
class ProviderController {
    
    private final ProviderService providerService;
    
    @GetMapping("/{id}")
    @Operation(summary = "Get provider by ID")
    public ResponseEntity<ApiResponse<ServiceProviderDTO>> getProviderById(@PathVariable Long id) {
        ServiceProviderDTO provider = providerService.getProviderById(id);
        return ResponseEntity.ok(ApiResponse.success(provider));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search for providers")
    public ResponseEntity<ApiResponse<PageResponse<ServiceProviderDTO>>> searchProviders(
            @ModelAttribute ProviderSearchRequest request) {
        PageResponse<ServiceProviderDTO> providers = providerService.searchProviders(request);
        return ResponseEntity.ok(ApiResponse.success(providers));
    }
    
    @GetMapping("/featured")
    @Operation(summary = "Get featured providers")
    public ResponseEntity<ApiResponse<PageResponse<ServiceProviderDTO>>> getFeaturedProviders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ServiceProviderDTO> providers = providerService.getFeaturedProviders(page, size);
        return ResponseEntity.ok(ApiResponse.success(providers));
    }
    
    @PostMapping("/register")
    @Operation(summary = "Register as a service provider")
    public ResponseEntity<ApiResponse<ServiceProviderDTO>> registerProvider(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProviderRegisterRequest request) {
        ServiceProviderDTO provider = providerService.registerProvider(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Provider registration successful", provider));
    }
    
    @GetMapping("/me")
    @Operation(summary = "Get current provider profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<ServiceProviderDTO>> getCurrentProvider(@AuthenticationPrincipal User user) {
        ServiceProviderDTO provider = providerService.getProviderByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(provider));
    }
}

// ============================================================================
// Booking Controller
// ============================================================================
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking management endpoints")
class BookingController {
    
    private final BookingService bookingService;
    
    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<ApiResponse<BookingDTO>> createBooking(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingCreateRequest request) {
        BookingDTO booking = bookingService.createBooking(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Booking created successfully", booking));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingDTO>> getBookingById(@PathVariable Long id) {
        BookingDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }
    
    @GetMapping("/number/{bookingNumber}")
    @Operation(summary = "Get booking by booking number")
    public ResponseEntity<ApiResponse<BookingDTO>> getBookingByNumber(@PathVariable String bookingNumber) {
        BookingDTO booking = bookingService.getBookingByNumber(bookingNumber);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }
    
    @GetMapping("/my-bookings")
    @Operation(summary = "Get current user's bookings")
    public ResponseEntity<ApiResponse<PageResponse<BookingDTO>>> getMyBookings(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<BookingDTO> bookings = bookingService.getUserBookings(user.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
    
    @GetMapping("/provider-bookings")
    @Operation(summary = "Get provider's bookings")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<PageResponse<BookingDTO>>> getProviderBookings(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Need to get provider ID from user
        PageResponse<BookingDTO> bookings = bookingService.getProviderBookings(user.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status")
    public ResponseEntity<ApiResponse<BookingDTO>> updateBookingStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingUpdateRequest request) {
        BookingDTO booking = bookingService.updateBookingStatus(id, request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking status updated", booking));
    }
}

// ============================================================================
// Health Check Controller
// ============================================================================
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health", description = "API health check")
class HealthController {
    
    @GetMapping("/health")
    @Operation(summary = "Health check endpoint")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("HireLink API is running"));
    }
}
