package com.hirelink.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirelink.dto.ServiceDTO;
import com.hirelink.entity.Service;
import com.hirelink.entity.ServiceCategory;
import com.hirelink.entity.ServiceProvider;
import com.hirelink.exception.ResourceNotFoundException;
import com.hirelink.repository.ServiceCategoryRepository;
import com.hirelink.repository.ServiceProviderRepository;
import com.hirelink.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final ServiceProviderRepository providerRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public ServiceDTO.ServiceListResponse getServicesByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Service> servicePage = serviceRepository.findByCategoryCategoryIdAndIsActiveTrue(categoryId, pageable);
        return mapToServiceListResponse(servicePage);
    }

    @Transactional(readOnly = true)
    public ServiceDTO.ServiceListResponse getServicesByCategorySlug(String slug, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Service> servicePage = serviceRepository.findByCategoryCategorySlugAndIsActiveTrue(slug, pageable);
        return mapToServiceListResponse(servicePage);
    }

    @Transactional(readOnly = true)
    public ServiceDTO.ServiceListResponse getProviderServices(Long providerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Service> servicePage = serviceRepository.findByProviderProviderIdAndIsActiveTrue(providerId, pageable);
        return mapToServiceListResponse(servicePage);
    }

    @Transactional(readOnly = true)
    public ServiceDTO.ServiceResponse getServiceById(Long id) {
        Service service = serviceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
        return mapToServiceResponse(service);
    }

    @Transactional(readOnly = true)
    public ServiceDTO.ServiceListResponse searchServices(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Service> servicePage = serviceRepository.searchServices(query, pageable);
        
        return mapToServiceListResponse(servicePage);
    }

    @Transactional(readOnly = true)
    public ServiceDTO.ServiceListResponse getPopularServices(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Service> servicePage = serviceRepository.findPopularServices(pageable);
        
        return mapToServiceListResponse(servicePage);
    }

    @Transactional(readOnly = true)
    public List<ServiceDTO.ServiceResponse> getFeaturedServices() {
        List<Service> services = serviceRepository.findByIsFeaturedTrueAndIsActiveTrue();
        return services.stream()
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceDTO.ServiceResponse createService(Long providerId, ServiceDTO.CreateServiceRequest request) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + providerId));

        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

        String highlightsJson = null;
        if (request.getServiceHighlights() != null) {
            try {
                highlightsJson = objectMapper.writeValueAsString(request.getServiceHighlights());
            } catch (JsonProcessingException e) {
                // ignore
            }
        }

        Service.PriceType priceType = Service.PriceType.FIXED;
        if (request.getPriceType() != null) {
            priceType = Service.PriceType.valueOf(request.getPriceType());
        }

        Service service = Service.builder()
                .provider(provider)
                .category(category)
                .serviceName(request.getServiceName())
                .serviceDescription(request.getServiceDescription())
                .serviceHighlights(highlightsJson)
                .basePrice(request.getBasePrice())
                .priceType(priceType)
                .minPrice(request.getMinPrice())
                .maxPrice(request.getMaxPrice())
                .estimatedDurationMinutes(request.getEstimatedDurationMinutes())
                .advanceBookingHours(request.getAdvanceBookingHours() != null ? request.getAdvanceBookingHours() : 2)
                .materialsIncluded(request.getMaterialsIncluded() != null ? request.getMaterialsIncluded() : false)
                .materialsDescription(request.getMaterialsDescription())
                .isActive(true)
                .build();

        service = serviceRepository.save(service);
        return mapToServiceResponse(service);
    }

    private ServiceDTO.ServiceListResponse mapToServiceListResponse(Page<Service> servicePage) {
        List<ServiceDTO.ServiceResponse> services = servicePage.getContent().stream()
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());

        return ServiceDTO.ServiceListResponse.builder()
                .services(services)
                .page(servicePage.getNumber())
                .size(servicePage.getSize())
                .total(servicePage.getTotalElements())
                .totalPages(servicePage.getTotalPages())
                .build();
    }

    private ServiceDTO.ServiceResponse mapToServiceResponse(Service service) {
        List<String> highlights = Collections.emptyList();
        if (service.getServiceHighlights() != null) {
            try {
                highlights = objectMapper.readValue(service.getServiceHighlights(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                // ignore
            }
        }

        ServiceProvider provider = service.getProvider();
        ServiceCategory category = service.getCategory();

        // Build provider summary with null safety
        ServiceDTO.ProviderSummary providerSummary = null;
        if (provider != null) {
            String providerName = "Unknown";
            String profileImageUrl = null;
            if (provider.getUser() != null) {
                providerName = provider.getUser().getName() != null ? provider.getUser().getName() : "Unknown";
                profileImageUrl = provider.getUser().getProfileImageUrl();
            }
            providerSummary = ServiceDTO.ProviderSummary.builder()
                    .providerId(provider.getProviderId())
                    .businessName(provider.getBusinessName())
                    .providerName(providerName)
                    .profileImageUrl(profileImageUrl)
                    .averageRating(provider.getAverageRating())
                    .totalReviews(provider.getTotalReviews())
                    .completedBookings(provider.getCompletedBookings())
                    .isAvailable(provider.getIsAvailable())
                    .availabilityStatus(provider.getAvailabilityStatus() != null ? provider.getAvailabilityStatus().name() : "OFFLINE")
                    .build();
        }

        // Build category summary with null safety
        ServiceDTO.CategorySummary categorySummary = null;
        if (category != null) {
            categorySummary = ServiceDTO.CategorySummary.builder()
                    .categoryId(category.getCategoryId())
                    .categoryName(category.getCategoryName())
                    .categorySlug(category.getCategorySlug())
                    .categoryIcon(category.getCategoryIcon())
                    .build();
        }

        return ServiceDTO.ServiceResponse.builder()
                .serviceId(service.getServiceId())
                .serviceName(service.getServiceName())
                .serviceDescription(service.getServiceDescription())
                .serviceHighlights(highlights)
                .basePrice(service.getBasePrice())
                .priceType(service.getPriceType() != null ? service.getPriceType().name() : "FIXED")
                .minPrice(service.getMinPrice())
                .maxPrice(service.getMaxPrice())
                .estimatedDurationMinutes(service.getEstimatedDurationMinutes())
                .advanceBookingHours(service.getAdvanceBookingHours())
                .cancellationHours(service.getCancellationHours())
                .materialsIncluded(service.getMaterialsIncluded())
                .materialsDescription(service.getMaterialsDescription())
                .isActive(service.getIsActive())
                .isFeatured(service.getIsFeatured())
                .timesBooked(service.getTimesBooked())
                .averageRating(service.getAverageRating())
                .totalReviews(service.getTotalReviews())
                .provider(providerSummary)
                .category(categorySummary)
                .build();
    }
}
