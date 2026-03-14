package com.hirelink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class ProviderDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderResponse {
        private Long providerId;
        private Long userId;
        private String businessName;
        private String businessDescription;
        private String tagline;
        private String providerName;
        private String phone;
        private String email;
        private String profileImageUrl;
        private Integer experienceYears;
        private List<String> specializations;
        private List<String> certifications;
        private String basePincode;
        private String baseAddress;
        private BigDecimal baseLatitude;
        private BigDecimal baseLongitude;
        private Integer serviceRadiusKm;
        private String kycStatus;
        private BigDecimal averageRating;
        private Integer totalReviews;
        private Integer totalBookings;
        private Integer completedBookings;
        private BigDecimal completionRate;
        private Boolean isAvailable;
        private String availabilityStatus;
        private Boolean isFeatured;
        private List<ServiceDTO.ServiceResponse> services;
        private List<ReviewSummary> recentReviews;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderListResponse {
        private List<ProviderSummary> providers;
        private Integer page;
        private Integer size;
        private Long total;
        private Integer totalPages;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderSummary {
        private Long providerId;
        private String businessName;
        private String providerName;
        private String profileImageUrl;
        private Integer experienceYears;
        private String basePincode;
        private BigDecimal baseLatitude;
        private BigDecimal baseLongitude;
        private Integer serviceRadiusKm;
        private BigDecimal averageRating;
        private Integer totalReviews;
        private Integer completedBookings;
        private Boolean isAvailable;
        private String availabilityStatus;
        private Boolean isFeatured;
        private BigDecimal startingPrice;
        private List<String> serviceCategories;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewSummary {
        private Long reviewId;
        private String reviewerName;
        private String reviewerImage;
        private BigDecimal overallRating;
        private String reviewText;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NearbyProviderRequest {
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Integer radiusKm;
        private Long categoryId;
        private Integer page;
        private Integer size;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProviderRequest {
        private String businessName;
        private String businessDescription;
        private String tagline;
        private Integer experienceYears;
        private List<String> specializations;
        private String basePincode;
        private Integer serviceRadiusKm;
    }
}
