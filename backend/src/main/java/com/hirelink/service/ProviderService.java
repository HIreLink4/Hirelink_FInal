package com.hirelink.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirelink.dto.ProviderDTO;
import com.hirelink.dto.ServiceDTO;
import com.hirelink.entity.Review;
import com.hirelink.entity.ServiceProvider;
import com.hirelink.exception.ResourceNotFoundException;
import com.hirelink.repository.ReviewRepository;
import com.hirelink.repository.ServiceProviderRepository;
import com.hirelink.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ProviderService {

    private final ServiceProviderRepository providerRepository;
    private final ServiceRepository serviceRepository;
    private final ReviewRepository reviewRepository;
    private final ObjectMapper objectMapper;
    private final ServiceService serviceService;
    private final LocationService locationService;

    @Transactional(readOnly = true)
    public ProviderDTO.ProviderResponse getProviderById(Long providerId) {
        ServiceProvider provider = providerRepository.findByIdWithDetails(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + providerId));
        return mapToProviderResponse(provider, true);
    }

    public ProviderDTO.ProviderResponse getProviderByUserId(Long userId) {
        ServiceProvider provider = providerRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found for user: " + userId));
        return mapToProviderResponse(provider, true);
    }

    public ProviderDTO.ProviderListResponse getProvidersByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ServiceProvider> providerPage = providerRepository.findByCategoryId(categoryId, pageable);
        return mapToProviderListResponse(providerPage);
    }

    public ProviderDTO.ProviderListResponse getActiveProviders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ServiceProvider> providerPage = providerRepository.findActiveProviders(pageable);
        return mapToProviderListResponse(providerPage);
    }

    public ProviderDTO.ProviderListResponse getTopRatedProviders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ServiceProvider> providerPage = providerRepository.findTopRatedProviders(pageable);
        return mapToProviderListResponse(providerPage);
    }

    @Transactional(readOnly = true)
    public List<ProviderDTO.ProviderSummary> getFeaturedProviders() {
        List<ServiceProvider> providers = providerRepository.findByIsFeaturedTrue();
        return providers.stream()
                .map(this::mapToProviderSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProviderDTO.ProviderSummary> getNearbyProviders(String pincode) {
        List<ServiceProvider> providers = providerRepository.findByPincodeAndAvailable(pincode);
        return providers.stream()
                .map(this::mapToProviderSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProviderDTO.ProviderSummary> getNearbyProvidersByLocation(
            BigDecimal latitude, BigDecimal longitude, Integer radiusKm, Long categoryId) {
        
        // Get bounding box for initial filter
        LocationService.BoundingBox box = locationService.getBoundingBox(latitude, longitude, radiusKm);
        
        List<ServiceProvider> providers;
        if (categoryId != null) {
            providers = providerRepository.findProvidersInAreaByCategory(
                    box.minLatBD(), box.maxLatBD(), box.minLonBD(), box.maxLonBD(), categoryId);
        } else {
            providers = providerRepository.findProvidersInArea(
                    box.minLatBD(), box.maxLatBD(), box.minLonBD(), box.maxLonBD());
        }
        
        // Filter by exact distance and sort by distance
        return providers.stream()
                .filter(p -> p.getBaseLatitude() != null && p.getBaseLongitude() != null)
                .filter(p -> locationService.isWithinRadius(
                        latitude, longitude, p.getBaseLatitude(), p.getBaseLongitude(), radiusKm))
                .sorted((p1, p2) -> {
                    double d1 = locationService.calculateDistance(latitude, longitude, 
                            p1.getBaseLatitude(), p1.getBaseLongitude());
                    double d2 = locationService.calculateDistance(latitude, longitude, 
                            p2.getBaseLatitude(), p2.getBaseLongitude());
                    return Double.compare(d1, d2);
                })
                .map(this::mapToProviderSummary)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProviderDTO.ProviderResponse updateProvider(Long providerId, ProviderDTO.UpdateProviderRequest request) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + providerId));

        if (request.getBusinessName() != null) {
            provider.setBusinessName(request.getBusinessName());
        }
        if (request.getBusinessDescription() != null) {
            provider.setBusinessDescription(request.getBusinessDescription());
        }
        if (request.getTagline() != null) {
            provider.setTagline(request.getTagline());
        }
        if (request.getExperienceYears() != null) {
            provider.setExperienceYears(request.getExperienceYears());
        }
        if (request.getSpecializations() != null) {
            try {
                provider.setSpecializations(objectMapper.writeValueAsString(request.getSpecializations()));
            } catch (JsonProcessingException e) {
                // ignore
            }
        }
        if (request.getBasePincode() != null) {
            provider.setBasePincode(request.getBasePincode());
        }
        if (request.getServiceRadiusKm() != null) {
            provider.setServiceRadiusKm(request.getServiceRadiusKm());
        }

        // Calculate profile completion
        int completion = calculateProfileCompletion(provider);
        provider.setProfileCompletionPercentage(completion);

        provider = providerRepository.save(provider);
        return mapToProviderResponse(provider, false);
    }

    @Transactional
    public void updateAvailability(Long providerId, boolean available, String status) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + providerId));

        provider.setIsAvailable(available);
        if (status != null) {
            provider.setAvailabilityStatus(ServiceProvider.AvailabilityStatus.valueOf(status));
        } else {
            provider.setAvailabilityStatus(available ? 
                    ServiceProvider.AvailabilityStatus.ONLINE : 
                    ServiceProvider.AvailabilityStatus.OFFLINE);
        }

        providerRepository.save(provider);
    }

    private int calculateProfileCompletion(ServiceProvider provider) {
        int score = 0;
        int total = 10;

        if (provider.getBusinessName() != null && !provider.getBusinessName().isEmpty()) score++;
        if (provider.getBusinessDescription() != null && !provider.getBusinessDescription().isEmpty()) score++;
        if (provider.getTagline() != null && !provider.getTagline().isEmpty()) score++;
        if (provider.getExperienceYears() != null && provider.getExperienceYears() > 0) score++;
        if (provider.getSpecializations() != null && !provider.getSpecializations().isEmpty()) score++;
        if (provider.getBasePincode() != null && !provider.getBasePincode().isEmpty()) score++;
        if (provider.getUser().getProfileImageUrl() != null) score++;
        if (provider.getKycStatus() == ServiceProvider.KycStatus.VERIFIED) score++;
        if (provider.getServices() != null && !provider.getServices().isEmpty()) score += 2;

        return (score * 100) / total;
    }

    private ProviderDTO.ProviderListResponse mapToProviderListResponse(Page<ServiceProvider> providerPage) {
        List<ProviderDTO.ProviderSummary> providers = providerPage.getContent().stream()
                .map(this::mapToProviderSummary)
                .collect(Collectors.toList());

        return ProviderDTO.ProviderListResponse.builder()
                .providers(providers)
                .page(providerPage.getNumber())
                .size(providerPage.getSize())
                .total(providerPage.getTotalElements())
                .totalPages(providerPage.getTotalPages())
                .build();
    }

    private ProviderDTO.ProviderSummary mapToProviderSummary(ServiceProvider provider) {
        List<String> categories = Collections.emptyList();
        BigDecimal startingPrice = null;
        
        try {
            if (provider.getServices() != null && !provider.getServices().isEmpty()) {
                categories = provider.getServices().stream()
                        .filter(s -> s.getCategory() != null)
                        .map(s -> s.getCategory().getCategoryName())
                        .distinct()
                        .collect(Collectors.toList());
                        
                startingPrice = provider.getServices().stream()
                        .filter(s -> s.getIsActive() != null && s.getIsActive())
                        .map(s -> s.getBasePrice())
                        .filter(p -> p != null)
                        .min(BigDecimal::compareTo)
                        .orElse(null);
            }
        } catch (Exception e) {
            // Services not loaded, use empty defaults
            categories = Collections.emptyList();
            startingPrice = null;
        }

        // Safe user access
        String providerName = "Unknown";
        String profileImageUrl = null;
        if (provider.getUser() != null) {
            providerName = provider.getUser().getName() != null ? provider.getUser().getName() : "Unknown";
            profileImageUrl = provider.getUser().getProfileImageUrl();
        }

        return ProviderDTO.ProviderSummary.builder()
                .providerId(provider.getProviderId())
                .businessName(provider.getBusinessName())
                .providerName(providerName)
                .profileImageUrl(profileImageUrl)
                .experienceYears(provider.getExperienceYears())
                .basePincode(provider.getBasePincode())
                .baseLatitude(provider.getBaseLatitude())
                .baseLongitude(provider.getBaseLongitude())
                .serviceRadiusKm(provider.getServiceRadiusKm())
                .averageRating(provider.getAverageRating())
                .totalReviews(provider.getTotalReviews())
                .completedBookings(provider.getCompletedBookings())
                .isAvailable(provider.getIsAvailable())
                .availabilityStatus(provider.getAvailabilityStatus() != null ? provider.getAvailabilityStatus().name() : "OFFLINE")
                .isFeatured(provider.getIsFeatured())
                .startingPrice(startingPrice)
                .serviceCategories(categories)
                .build();
    }

    private ProviderDTO.ProviderResponse mapToProviderResponse(ServiceProvider provider, boolean includeServices) {
        List<String> specializations = Collections.emptyList();
        if (provider.getSpecializations() != null) {
            try {
                specializations = objectMapper.readValue(provider.getSpecializations(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                // ignore
            }
        }

        List<String> certifications = Collections.emptyList();
        if (provider.getCertifications() != null) {
            try {
                certifications = objectMapper.readValue(provider.getCertifications(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                // ignore
            }
        }

        // Get recent reviews
        List<Review> reviews = reviewRepository.findRecentReviews(provider.getProviderId(), PageRequest.of(0, 5));
        List<ProviderDTO.ReviewSummary> reviewSummaries = reviews.stream()
                .map(review -> ProviderDTO.ReviewSummary.builder()
                        .reviewId(review.getReviewId())
                        .reviewerName(review.getReviewer().getName())
                        .reviewerImage(review.getReviewer().getProfileImageUrl())
                        .overallRating(review.getOverallRating())
                        .reviewText(review.getReviewText())
                        .createdAt(review.getCreatedAt().format(DateTimeFormatter.ISO_DATE))
                        .build())
                .collect(Collectors.toList());

        // Get services: use the list query (no pagination) to avoid JOIN FETCH + Pageable conflict
        List<ServiceDTO.ServiceResponse> services = Collections.emptyList();
        if (includeServices) {
            List<com.hirelink.entity.Service> rawServices = serviceRepository.findAllActiveByProviderId(provider.getProviderId());
            services = rawServices.stream()
                    .map(s -> {
                        // Build a lightweight ServiceResponse directly here
                        return ServiceDTO.ServiceResponse.builder()
                                .serviceId(s.getServiceId())
                                .serviceName(s.getServiceName())
                                .serviceDescription(s.getServiceDescription())
                                .basePrice(s.getBasePrice())
                                .priceType(s.getPriceType() != null ? s.getPriceType().name() : "FIXED")
                                .estimatedDurationMinutes(s.getEstimatedDurationMinutes())
                                .advanceBookingHours(s.getAdvanceBookingHours())
                                .cancellationHours(s.getCancellationHours())
                                .materialsIncluded(s.getMaterialsIncluded())
                                .isActive(s.getIsActive())
                                .isFeatured(s.getIsFeatured())
                                .timesBooked(s.getTimesBooked())
                                .averageRating(s.getAverageRating())
                                .totalReviews(s.getTotalReviews())
                                .category(s.getCategory() != null ? ServiceDTO.CategorySummary.builder()
                                        .categoryId(s.getCategory().getCategoryId())
                                        .categoryName(s.getCategory().getCategoryName())
                                        .categorySlug(s.getCategory().getCategorySlug())
                                        .categoryIcon(s.getCategory().getCategoryIcon())
                                        .build() : null)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return ProviderDTO.ProviderResponse.builder()
                .providerId(provider.getProviderId())
                .userId(provider.getUser().getUserId())
                .businessName(provider.getBusinessName())
                .businessDescription(provider.getBusinessDescription())
                .tagline(provider.getTagline())
                .providerName(provider.getUser().getName())
                .phone(provider.getUser().getPhone())
                .email(provider.getUser().getEmail())
                .profileImageUrl(provider.getUser().getProfileImageUrl())
                .experienceYears(provider.getExperienceYears())
                .specializations(specializations)
                .certifications(certifications)
                .basePincode(provider.getBasePincode())
                .baseAddress(provider.getBaseAddress())
                .baseLatitude(provider.getBaseLatitude())
                .baseLongitude(provider.getBaseLongitude())
                .serviceRadiusKm(provider.getServiceRadiusKm())
                .kycStatus(provider.getKycStatus().name())
                .averageRating(provider.getAverageRating())
                .totalReviews(provider.getTotalReviews())
                .totalBookings(provider.getTotalBookings())
                .completedBookings(provider.getCompletedBookings())
                .completionRate(provider.getCompletionRate())
                .isAvailable(provider.getIsAvailable())
                .availabilityStatus(provider.getAvailabilityStatus().name())
                .isFeatured(provider.getIsFeatured())
                .services(services)
                .recentReviews(reviewSummaries)
                .build();
    }
}
