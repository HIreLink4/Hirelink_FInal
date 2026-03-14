package com.hirelink.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class ServiceDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceResponse {
        private Long serviceId;
        private String serviceName;
        private String serviceDescription;
        private List<String> serviceHighlights;
        private BigDecimal basePrice;
        private String priceType;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Integer estimatedDurationMinutes;
        private Integer advanceBookingHours;
        private Integer cancellationHours;
        private Boolean materialsIncluded;
        private String materialsDescription;
        private Boolean isActive;
        private Boolean isFeatured;
        private Integer timesBooked;
        private BigDecimal averageRating;
        private Integer totalReviews;
        private ProviderSummary provider;
        private CategorySummary category;
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
        private BigDecimal averageRating;
        private Integer totalReviews;
        private Integer completedBookings;
        private Boolean isAvailable;
        private String availabilityStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySummary {
        private Long categoryId;
        private String categoryName;
        private String categorySlug;
        private String categoryIcon;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceListResponse {
        private List<ServiceResponse> services;
        private Integer page;
        private Integer size;
        private Long total;
        private Integer totalPages;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateServiceRequest {
        @NotBlank(message = "Service name is required")
        private String serviceName;

        private String serviceDescription;

        private List<String> serviceHighlights;

        @NotNull(message = "Base price is required")
        @DecimalMin(value = "0.0", message = "Price must be positive")
        private BigDecimal basePrice;

        private String priceType;

        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Integer estimatedDurationMinutes;
        private Integer advanceBookingHours;
        private Boolean materialsIncluded;
        private String materialsDescription;

        @NotNull(message = "Category ID is required")
        private Long categoryId;
    }
}
