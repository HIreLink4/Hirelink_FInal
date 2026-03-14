package com.hirelink.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_number", nullable = false, unique = true, length = 20)
    private String bookingNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private ServiceProvider provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "scheduled_time", nullable = false)
    private LocalTime scheduledTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "service_address", nullable = false, columnDefinition = "TEXT")
    private String serviceAddress;

    @Column(name = "service_pincode", nullable = false, length = 6)
    private String servicePincode;

    @Column(name = "service_latitude", precision = 10, scale = 8)
    private BigDecimal serviceLatitude;

    @Column(name = "service_longitude", precision = 11, scale = 8)
    private BigDecimal serviceLongitude;

    @Column(name = "issue_title", length = 255)
    private String issueTitle;

    @Column(name = "issue_description", columnDefinition = "TEXT")
    private String issueDescription;

    @Column(name = "issue_images", columnDefinition = "JSON")
    private String issueImages;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level")
    @Builder.Default
    private UrgencyLevel urgencyLevel = UrgencyLevel.MEDIUM;

    @Column(name = "estimated_amount", precision = 10, scale = 2)
    private BigDecimal estimatedAmount;

    @Column(name = "material_cost", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal materialCost = BigDecimal.ZERO;

    @Column(name = "labor_cost", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal laborCost = BigDecimal.ZERO;

    @Column(name = "travel_cost", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal travelCost = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status")
    @Builder.Default
    private BookingStatus bookingStatus = BookingStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "cancelled_by")
    private CancelledBy cancelledBy;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "work_started_at")
    private LocalDateTime workStartedAt;

    @Column(name = "work_completed_at")
    private LocalDateTime workCompletedAt;

    @Column(name = "work_summary", columnDefinition = "TEXT")
    private String workSummary;

    @Column(name = "completion_images", columnDefinition = "JSON")
    private String completionImages;

    @Column(name = "user_rating", precision = 3, scale = 2)
    private BigDecimal userRating;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Review review;

    public enum BookingStatus {
        PENDING, ACCEPTED, REJECTED, CONFIRMED, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED, DISPUTED, REFUNDED
    }

    public enum UrgencyLevel {
        LOW, MEDIUM, HIGH, EMERGENCY
    }

    public enum CancelledBy {
        USER, PROVIDER, ADMIN, SYSTEM
    }
}
