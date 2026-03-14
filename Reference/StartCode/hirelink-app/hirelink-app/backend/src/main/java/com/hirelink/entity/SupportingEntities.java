package com.hirelink.entity;

import com.hirelink.enums.Enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;

// ============================================================================
// UserAddress Entity
// ============================================================================
@Entity
@Table(name = "user_addresses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class UserAddress extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id") private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "address_type") @Builder.Default
    private AddressType addressType = AddressType.HOME;
    
    @Column(name = "address_label", length = 50) private String addressLabel;
    @Column(name = "address_line1", nullable = false) private String addressLine1;
    @Column(name = "address_line2") private String addressLine2;
    @Column(name = "landmark") private String landmark;
    @Column(name = "city", nullable = false, length = 100) private String city;
    @Column(name = "state", nullable = false, length = 100) private String state;
    @Column(name = "pincode", nullable = false, length = 6) private String pincode;
    @Column(name = "country", length = 50) @Builder.Default private String country = "India";
    @Column(name = "latitude", precision = 10, scale = 8) private BigDecimal latitude;
    @Column(name = "longitude", precision = 11, scale = 8) private BigDecimal longitude;
    @Column(name = "is_default") @Builder.Default private Boolean isDefault = false;
    @Column(name = "is_active") @Builder.Default private Boolean isActive = true;
}

// ============================================================================
// ProviderAvailability Entity
// ============================================================================
@Entity
@Table(name = "provider_availability")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class ProviderAvailability {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "availability_id") private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private ServiceProvider provider;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;
    
    @Column(name = "start_time", nullable = false) private LocalTime startTime;
    @Column(name = "end_time", nullable = false) private LocalTime endTime;
    @Column(name = "break_start") private LocalTime breakStart;
    @Column(name = "break_end") private LocalTime breakEnd;
    @Column(name = "is_available") @Builder.Default private Boolean isAvailable = true;
}

// ============================================================================
// ProviderServiceArea Entity
// ============================================================================
@Entity
@Table(name = "provider_service_areas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class ProviderServiceArea extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "area_id") private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private ServiceProvider provider;
    
    @Column(name = "pincode", nullable = false, length = 6) private String pincode;
    @Column(name = "city", length = 100) private String city;
    @Column(name = "area_name", length = 100) private String areaName;
    @Column(name = "additional_travel_charge", precision = 10, scale = 2) @Builder.Default
    private BigDecimal additionalTravelCharge = BigDecimal.ZERO;
    @Column(name = "is_primary_area") @Builder.Default private Boolean isPrimaryArea = false;
    @Column(name = "is_active") @Builder.Default private Boolean isActive = true;
}

// ============================================================================
// ProviderDocument Entity
// ============================================================================
@Entity
@Table(name = "provider_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class ProviderDocument {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id") private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private ServiceProvider provider;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;
    
    @Column(name = "document_name", nullable = false) private String documentName;
    @Column(name = "document_url", nullable = false, length = 500) private String documentUrl;
    @Column(name = "document_size_bytes") private Long documentSizeBytes;
    @Column(name = "mime_type", length = 100) private String mimeType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status") @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;
    
    @Column(name = "verified_at") private LocalDateTime verifiedAt;
    @Column(name = "rejection_reason", columnDefinition = "TEXT") private String rejectionReason;
    @Column(name = "uploaded_at") private LocalDateTime uploadedAt;
    @Column(name = "expires_at") private LocalDate expiresAt;
    
    @PrePersist
    public void setUploadTime() { this.uploadedAt = LocalDateTime.now(); }
}

// ============================================================================
// BookingStatusHistory Entity
// ============================================================================
@Entity
@Table(name = "booking_status_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class BookingStatusHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id") private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status") private BookingStatus previousStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false) private BookingStatus newStatus;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id")
    private User changedByUser;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "changed_by_role", nullable = false)
    private CancelledBy changedByRole;
    
    @Column(name = "change_reason", columnDefinition = "TEXT") private String changeReason;
    @Column(name = "additional_data", columnDefinition = "JSON") private String additionalData;
    @Column(name = "changed_at") private LocalDateTime changedAt;
    
    @PrePersist
    public void setChangedTime() { this.changedAt = LocalDateTime.now(); }
}

// ============================================================================
// Payment Entity
// ============================================================================
@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id") private Long id;
    
    @Column(name = "payment_number", nullable = false, unique = true, length = 30)
    private String paymentNumber;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_user_id", nullable = false)
    private User payer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payee_provider_id", nullable = false)
    private ServiceProvider payee;
    
    @Column(name = "gross_amount", nullable = false, precision = 12, scale = 2) private BigDecimal grossAmount;
    @Column(name = "platform_fee", precision = 12, scale = 2) @Builder.Default private BigDecimal platformFee = BigDecimal.ZERO;
    @Column(name = "payment_gateway_fee", precision = 12, scale = 2) @Builder.Default private BigDecimal paymentGatewayFee = BigDecimal.ZERO;
    @Column(name = "tax_amount", precision = 12, scale = 2) @Builder.Default private BigDecimal taxAmount = BigDecimal.ZERO;
    @Column(name = "net_amount", nullable = false, precision = 12, scale = 2) private BigDecimal netAmount;
    @Column(name = "currency", length = 3) @Builder.Default private String currency = "INR";
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false) private PaymentMethod paymentMethod;
    
    @Column(name = "payment_method_details", columnDefinition = "JSON") private String paymentMethodDetails;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_gateway", nullable = false) private PaymentGateway paymentGateway;
    
    @Column(name = "gateway_order_id", length = 100) private String gatewayOrderId;
    @Column(name = "gateway_payment_id", length = 100) private String gatewayPaymentId;
    @Column(name = "gateway_signature", length = 500) private String gatewaySignature;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status") @Builder.Default private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payout_status") @Builder.Default private PayoutStatus payoutStatus = PayoutStatus.PENDING;
    
    @Column(name = "payout_amount", precision = 12, scale = 2) private BigDecimal payoutAmount;
    @Column(name = "payout_reference", length = 100) private String payoutReference;
    @Column(name = "payout_completed_at") private LocalDateTime payoutCompletedAt;
    @Column(name = "refund_amount", precision = 12, scale = 2) @Builder.Default private BigDecimal refundAmount = BigDecimal.ZERO;
    @Column(name = "refund_reason", columnDefinition = "TEXT") private String refundReason;
    @Column(name = "refund_reference", length = 100) private String refundReference;
    @Column(name = "refunded_at") private LocalDateTime refundedAt;
    @Column(name = "initiated_at") private LocalDateTime initiatedAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    
    @PrePersist
    public void generatePaymentNumber() {
        if (this.paymentNumber == null) {
            this.paymentNumber = "PAY" + LocalDateTime.now().toString().replace("-", "").replace(":", "").replace("T", "").substring(0, 14) 
                + String.format("%04d", (int)(Math.random() * 10000));
        }
        this.initiatedAt = LocalDateTime.now();
    }
}

// ============================================================================
// Review Entity
// ============================================================================
@Entity
@Table(name = "reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class Review extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id") private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_provider_id", nullable = false)
    private ServiceProvider revieweeProvider;
    
    @Column(name = "overall_rating", nullable = false, precision = 3, scale = 2) private BigDecimal overallRating;
    @Column(name = "quality_rating", precision = 3, scale = 2) private BigDecimal qualityRating;
    @Column(name = "punctuality_rating", precision = 3, scale = 2) private BigDecimal punctualityRating;
    @Column(name = "professionalism_rating", precision = 3, scale = 2) private BigDecimal professionalismRating;
    @Column(name = "value_for_money_rating", precision = 3, scale = 2) private BigDecimal valueForMoneyRating;
    @Column(name = "review_title") private String reviewTitle;
    @Column(name = "review_text", columnDefinition = "TEXT") private String reviewText;
    @Column(name = "review_images", columnDefinition = "JSON") private String reviewImages;
    @Column(name = "provider_response", columnDefinition = "TEXT") private String providerResponse;
    @Column(name = "provider_responded_at") private LocalDateTime providerRespondedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status") @Builder.Default
    private ModerationStatus moderationStatus = ModerationStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderated_by")
    private User moderatedBy;
    
    @Column(name = "moderated_at") private LocalDateTime moderatedAt;
    @Column(name = "moderation_notes", columnDefinition = "TEXT") private String moderationNotes;
    @Column(name = "is_visible") @Builder.Default private Boolean isVisible = true;
    @Column(name = "is_featured") @Builder.Default private Boolean isFeatured = false;
    @Column(name = "helpful_count") @Builder.Default private Integer helpfulCount = 0;
    @Column(name = "not_helpful_count") @Builder.Default private Integer notHelpfulCount = 0;
}
