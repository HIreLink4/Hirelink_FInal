package com.hirelink.dto;

import com.hirelink.enums.Enums.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;

// ============================================================================
// Authentication DTOs
// ============================================================================
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthRequest {
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phone;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class RegisterRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phone;
    
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
             message = "Password must contain uppercase, lowercase, number and special character")
    private String password;
    
    private UserType userType = UserType.CUSTOMER;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private UserDTO user;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class OtpRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;
    private OtpPurpose purpose = OtpPurpose.LOGIN;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class OtpVerifyRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    @NotBlank(message = "OTP is required")
    @Size(min = 6, max = 6, message = "OTP must be 6 digits")
    private String otp;
}

// ============================================================================
// User DTOs
// ============================================================================
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String profileImageUrl;
    private LocalDate dateOfBirth;
    private Gender gender;
    private UserType userType;
    private AccountStatus accountStatus;
    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;
    private Language preferredLanguage;
    private LocalDateTime createdAt;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class UserUpdateRequest {
    @Size(min = 2, max = 100)
    private String name;
    
    @Email
    private String email;
    
    private LocalDate dateOfBirth;
    private Gender gender;
    private Language preferredLanguage;
    private String profileImageUrl;
}

// ============================================================================
// Service Provider DTOs
// ============================================================================
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ServiceProviderDTO {
    private Long id;
    private Long userId;
    private String name;
    private String phone;
    private String profileImageUrl;
    private String businessName;
    private String businessDescription;
    private String tagline;
    private Integer experienceYears;
    private List<String> specializations;
    private BigDecimal baseLatitude;
    private BigDecimal baseLongitude;
    private String basePincode;
    private Integer serviceRadiusKm;
    private KycStatus kycStatus;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Integer totalBookings;
    private Integer completedBookings;
    private BigDecimal completionRate;
    private Boolean isAvailable;
    private AvailabilityStatus availabilityStatus;
    private Boolean isFeatured;
    private List<ServiceDTO> services;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ProviderRegisterRequest {
    @NotBlank(message = "Business name is required")
    private String businessName;
    
    private String businessDescription;
    private String tagline;
    private Integer experienceYears;
    private List<String> specializations;
    
    @NotNull(message = "Base latitude is required")
    private BigDecimal baseLatitude;
    
    @NotNull(message = "Base longitude is required")
    private BigDecimal baseLongitude;
    
    @NotBlank(message = "Base pincode is required")
    @Size(min = 6, max = 6)
    private String basePincode;
    
    private Integer serviceRadiusKm = 10;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ProviderSearchRequest {
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer radiusKm = 10;
    private Long categoryId;
    private BigDecimal minRating;
    private BigDecimal maxPrice;
    private Boolean availableNow;
    private String sortBy = "distance"; // distance, rating, price
    private String sortOrder = "asc";
    private int page = 0;
    private int size = 20;
}

// ============================================================================
// Service Category DTOs
// ============================================================================
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ServiceCategoryDTO {
    private Long id;
    private String categoryName;
    private String categorySlug;
    private String categoryDescription;
    private String categoryIcon;
    private String categoryImageUrl;
    private Long parentCategoryId;
    private Integer categoryLevel;
    private Integer displayOrder;
    private BigDecimal minBasePrice;
    private BigDecimal maxBasePrice;
    private PriceUnit priceUnit;
    private Boolean isActive;
    private Boolean isFeatured;
    private List<ServiceCategoryDTO> subCategories;
}

// ============================================================================
// Service DTOs
// ============================================================================
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ServiceDTO {
    private Long id;
    private Long providerId;
    private String providerName;
    private Long categoryId;
    private String categoryName;
    private String serviceName;
    private String serviceDescription;
    private List<String> serviceHighlights;
    private BigDecimal basePrice;
    private PriceType priceType;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer estimatedDurationMinutes;
    private Integer advanceBookingHours;
    private Boolean materialsIncluded;
    private Boolean isActive;
    private Integer timesBooked;
    private BigDecimal averageRating;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ServiceCreateRequest {
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    @NotBlank(message = "Service name is required")
    private String serviceName;
    
    private String serviceDescription;
    private List<String> serviceHighlights;
    
    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", message = "Price must be positive")
    private BigDecimal basePrice;
    
    private PriceType priceType = PriceType.FIXED;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer estimatedDurationMinutes;
    private Integer advanceBookingHours = 2;
    private Boolean materialsIncluded = false;
    private String materialsDescription;
}

// ============================================================================
// Booking DTOs
// ============================================================================
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class BookingDTO {
    private Long id;
    private String bookingNumber;
    private Long userId;
    private String userName;
    private String userPhone;
    private Long providerId;
    private String providerName;
    private String providerPhone;
    private String businessName;
    private Long serviceId;
    private String serviceName;
    private String categoryName;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private String serviceAddress;
    private String servicePincode;
    private BigDecimal serviceLatitude;
    private BigDecimal serviceLongitude;
    private String issueTitle;
    private String issueDescription;
    private List<String> issueImages;
    private UrgencyLevel urgencyLevel;
    private BigDecimal estimatedAmount;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal finalAmount;
    private BookingStatus bookingStatus;
    private String workSummary;
    private BigDecimal userRating;
    private LocalDateTime createdAt;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class BookingCreateRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;
    
    @NotNull(message = "Provider ID is required")
    private Long providerId;
    
    @NotNull(message = "Scheduled date is required")
    @FutureOrPresent(message = "Scheduled date must be today or in the future")
    private LocalDate scheduledDate;
    
    @NotNull(message = "Scheduled time is required")
    private LocalTime scheduledTime;
    
    private Long addressId;
    
    @NotBlank(message = "Service address is required")
    private String serviceAddress;
    
    private String serviceLandmark;
    
    @NotBlank(message = "Service pincode is required")
    @Size(min = 6, max = 6)
    private String servicePincode;
    
    private BigDecimal serviceLatitude;
    private BigDecimal serviceLongitude;
    private String issueTitle;
    private String issueDescription;
    private List<String> issueImages;
    private UrgencyLevel urgencyLevel = UrgencyLevel.MEDIUM;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class BookingUpdateRequest {
    private BookingStatus bookingStatus;
    private String providerNotes;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal finalAmount;
    private String workSummary;
    private List<String> completionImages;
    private String cancellationReason;
}

// ============================================================================
// Review DTOs
// ============================================================================
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ReviewDTO {
    private Long id;
    private Long bookingId;
    private String bookingNumber;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerImage;
    private Long providerId;
    private String providerName;
    private BigDecimal overallRating;
    private BigDecimal qualityRating;
    private BigDecimal punctualityRating;
    private BigDecimal professionalismRating;
    private BigDecimal valueForMoneyRating;
    private String reviewTitle;
    private String reviewText;
    private List<String> reviewImages;
    private String providerResponse;
    private LocalDateTime providerRespondedAt;
    private ModerationStatus moderationStatus;
    private Boolean isVisible;
    private Integer helpfulCount;
    private LocalDateTime createdAt;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ReviewCreateRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Overall rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be at least 1")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5")
    private BigDecimal overallRating;
    
    @DecimalMin(value = "1.0") @DecimalMax(value = "5.0")
    private BigDecimal qualityRating;
    
    @DecimalMin(value = "1.0") @DecimalMax(value = "5.0")
    private BigDecimal punctualityRating;
    
    @DecimalMin(value = "1.0") @DecimalMax(value = "5.0")
    private BigDecimal professionalismRating;
    
    @DecimalMin(value = "1.0") @DecimalMax(value = "5.0")
    private BigDecimal valueForMoneyRating;
    
    private String reviewTitle;
    
    @Size(max = 2000, message = "Review text cannot exceed 2000 characters")
    private String reviewText;
    
    private List<String> reviewImages;
}

// ============================================================================
// API Response Wrapper
// ============================================================================
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp = LocalDateTime.now();
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder().success(true).message("Success").data(data).timestamp(LocalDateTime.now()).build();
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).timestamp(LocalDateTime.now()).build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder().success(false).message(message).timestamp(LocalDateTime.now()).build();
    }
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
}
