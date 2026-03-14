package com.hirelink.controller;

import com.hirelink.dto.ApiResponse;
import com.hirelink.dto.ServiceDTO;
import com.hirelink.service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Service management endpoints")
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get services by category ID")
    public ResponseEntity<ApiResponse<ServiceDTO.ServiceListResponse>> getServicesByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ServiceDTO.ServiceListResponse response = serviceService.getServicesByCategory(categoryId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/category/slug/{slug}")
    @Operation(summary = "Get services by category slug")
    public ResponseEntity<ApiResponse<ServiceDTO.ServiceListResponse>> getServicesByCategorySlug(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ServiceDTO.ServiceListResponse response = serviceService.getServicesByCategorySlug(slug, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Get services by provider ID")
    public ResponseEntity<ApiResponse<ServiceDTO.ServiceListResponse>> getProviderServices(
            @PathVariable Long providerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ServiceDTO.ServiceListResponse response = serviceService.getProviderServices(providerId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID")
    public ResponseEntity<ApiResponse<ServiceDTO.ServiceResponse>> getServiceById(
            @PathVariable Long id) {
        ServiceDTO.ServiceResponse response = serviceService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search services")
    public ResponseEntity<ApiResponse<ServiceDTO.ServiceListResponse>> searchServices(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ServiceDTO.ServiceListResponse response = serviceService.searchServices(query, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular services")
    public ResponseEntity<ApiResponse<ServiceDTO.ServiceListResponse>> getPopularServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ServiceDTO.ServiceListResponse response = serviceService.getPopularServices(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured services")
    public ResponseEntity<ApiResponse<List<ServiceDTO.ServiceResponse>>> getFeaturedServices() {
        List<ServiceDTO.ServiceResponse> services = serviceService.getFeaturedServices();
        return ResponseEntity.ok(ApiResponse.success(services));
    }
}
