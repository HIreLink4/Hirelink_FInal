package com.hirelink.controller;

import com.hirelink.dto.ApiResponse;
import com.hirelink.dto.BookingDTO;
import com.hirelink.security.CustomUserDetails;
import com.hirelink.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking management endpoints")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<ApiResponse<BookingDTO>> createBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingDTO.CreateBookingRequest request) {
        BookingDTO booking = bookingService.createBooking(userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Get current user's bookings")
    public ResponseEntity<ApiResponse<Page<BookingDTO>>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<BookingDTO> bookings = bookingService.getUserBookings(userDetails.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(bookings));
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

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status")
    public ResponseEntity<ApiResponse<BookingDTO>> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingDTO.UpdateBookingStatusRequest request) {
        BookingDTO booking = bookingService.updateBookingStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Status updated", booking));
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    @Operation(summary = "Get provider's bookings")
    public ResponseEntity<ApiResponse<Page<BookingDTO>>> getProviderBookings(
            @PathVariable Long providerId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<BookingDTO> bookings = bookingService.getProviderBookings(providerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
}
