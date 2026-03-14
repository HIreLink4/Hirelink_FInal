package com.hirelink.controller;

import com.hirelink.dto.ApiResponse;
import com.hirelink.dto.BookingDTO;
import com.hirelink.dto.ProviderDTO;
import com.hirelink.dto.ServiceDTO;
import com.hirelink.entity.ServiceProvider;
import com.hirelink.exception.ResourceNotFoundException;
import com.hirelink.repository.ServiceProviderRepository;
import com.hirelink.security.CustomUserDetails;
import com.hirelink.service.BookingService;
import com.hirelink.service.ProviderService;
import com.hirelink.service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
@Tag(name = "Providers", description = "Service provider endpoints")
public class ProviderController {

    private final ProviderService providerService;
    private final BookingService bookingService;
    private final ServiceService serviceService;
    private final ServiceProviderRepository providerRepository;
    private final com.hirelink.service.LocationService locationService;

    @GetMapping("/{id}")
    @Operation(summary = "Get provider by ID")
    public ResponseEntity<ApiResponse<ProviderDTO.ProviderResponse>> getProviderById(
            @PathVariable Long id) {
        ProviderDTO.ProviderResponse response = providerService.getProviderById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get providers by category")
    public ResponseEntity<ApiResponse<ProviderDTO.ProviderListResponse>> getProvidersByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ProviderDTO.ProviderListResponse response = providerService.getProvidersByCategory(categoryId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured providers")
    public ResponseEntity<ApiResponse<List<ProviderDTO.ProviderSummary>>> getFeaturedProviders() {
        List<ProviderDTO.ProviderSummary> providers = providerService.getFeaturedProviders();
        return ResponseEntity.ok(ApiResponse.success(providers));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get nearby providers by pincode")
    public ResponseEntity<ApiResponse<List<ProviderDTO.ProviderSummary>>> getNearbyProviders(
            @RequestParam String pincode) {
        List<ProviderDTO.ProviderSummary> providers = providerService.getNearbyProviders(pincode);
        return ResponseEntity.ok(ApiResponse.success(providers));
    }

    @GetMapping("/nearby/location")
    @Operation(summary = "Get nearby providers by coordinates")
    public ResponseEntity<ApiResponse<List<ProviderDTO.ProviderSummary>>> getNearbyProvidersByLocation(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "10") Integer radiusKm,
            @RequestParam(required = false) Long categoryId) {
        List<ProviderDTO.ProviderSummary> providers = providerService.getNearbyProvidersByLocation(
                lat, lng, radiusKm, categoryId);
        return ResponseEntity.ok(ApiResponse.success(providers));
    }

    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated providers")
    public ResponseEntity<ApiResponse<ProviderDTO.ProviderListResponse>> getTopRatedProviders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ProviderDTO.ProviderListResponse response = providerService.getTopRatedProviders(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/services")
    @Operation(summary = "Get services offered by provider")
    public ResponseEntity<ApiResponse<ServiceDTO.ServiceListResponse>> getProviderServices(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ServiceDTO.ServiceListResponse response = serviceService.getProviderServices(id, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Provider dashboard endpoints (requires PROVIDER role)
    @GetMapping("/me")
    @Operation(summary = "Get current provider's profile")
    public ResponseEntity<ApiResponse<ProviderDTO.ProviderResponse>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ProviderDTO.ProviderResponse response = providerService.getProviderByUserId(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current provider's profile")
    public ResponseEntity<ApiResponse<ProviderDTO.ProviderResponse>> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProviderDTO.UpdateProviderRequest request) {
        ServiceProvider provider = providerRepository.findByUserUserId(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        ProviderDTO.ProviderResponse response = providerService.updateProvider(provider.getProviderId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", response));
    }

    @PatchMapping("/me/availability")
    @Operation(summary = "Update availability status")
    public ResponseEntity<ApiResponse<Void>> updateAvailability(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam boolean available,
            @RequestParam(required = false) String status) {
        ServiceProvider provider = providerRepository.findByUserUserId(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        providerService.updateAvailability(provider.getProviderId(), available, status);
        return ResponseEntity.ok(ApiResponse.success("Availability updated"));
    }

    @GetMapping("/me/bookings")
    @Operation(summary = "Get provider's bookings")
    public ResponseEntity<ApiResponse<BookingDTO.BookingListResponse>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ServiceProvider provider = providerRepository.findByUserUserId(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        BookingDTO.BookingListResponse response = bookingService.getProviderBookings(
                provider.getProviderId(), status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/me/services")
    @Operation(summary = "Add a new service")
    public ResponseEntity<ApiResponse<ServiceDTO.ServiceResponse>> addService(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ServiceDTO.CreateServiceRequest request) {
        ServiceProvider provider = providerRepository.findByUserUserId(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        ServiceDTO.ServiceResponse response = serviceService.createService(provider.getProviderId(), request);
        return ResponseEntity.ok(ApiResponse.success("Service added", response));
    }
}
