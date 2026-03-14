package com.hirelink.repository;

import com.hirelink.entity.*;
import com.hirelink.enums.Enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// ============================================================================
// User Repository
// ============================================================================
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneOrEmail(String phone, String email);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
    List<User> findByUserType(UserType userType);
    Page<User> findByAccountStatus(AccountStatus status, Pageable pageable);
}

// ============================================================================
// Service Provider Repository
// ============================================================================
@Repository
interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {
    Optional<ServiceProvider> findByUserId(Long userId);
    Optional<ServiceProvider> findByUser(User user);
    
    @Query("SELECT sp FROM ServiceProvider sp WHERE sp.kycStatus = :status")
    Page<ServiceProvider> findByKycStatus(@Param("status") KycStatus status, Pageable pageable);
    
    @Query("SELECT sp FROM ServiceProvider sp WHERE sp.isAvailable = true AND sp.kycStatus = 'VERIFIED'")
    List<ServiceProvider> findAvailableProviders();
    
    @Query(value = "SELECT sp.*, " +
           "(6371 * ACOS(COS(RADIANS(:lat)) * COS(RADIANS(sp.base_latitude)) * " +
           "COS(RADIANS(sp.base_longitude) - RADIANS(:lng)) + " +
           "SIN(RADIANS(:lat)) * SIN(RADIANS(sp.base_latitude)))) AS distance " +
           "FROM service_providers sp " +
           "INNER JOIN users u ON sp.user_id = u.user_id " +
           "WHERE sp.is_available = true AND sp.kyc_status = 'VERIFIED' " +
           "AND u.account_status = 'ACTIVE' " +
           "HAVING distance <= :radius " +
           "ORDER BY distance ASC", nativeQuery = true)
    List<ServiceProvider> findNearbyProviders(@Param("lat") BigDecimal latitude, 
                                               @Param("lng") BigDecimal longitude, 
                                               @Param("radius") Integer radiusKm);
    
    Page<ServiceProvider> findByIsFeaturedTrue(Pageable pageable);
}

// ============================================================================
// Service Category Repository
// ============================================================================
@Repository
interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    Optional<ServiceCategory> findByCategorySlug(String slug);
    Optional<ServiceCategory> findByCategoryName(String name);
    List<ServiceCategory> findByParentCategoryIsNullAndIsActiveTrue();
    List<ServiceCategory> findByParentCategoryIdAndIsActiveTrue(Long parentId);
    List<ServiceCategory> findByIsFeaturedTrueAndIsActiveTrue();
    List<ServiceCategory> findAllByIsActiveTrue();
}

// ============================================================================
// Service Repository
// ============================================================================
@Repository
interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByProviderIdAndIsActiveTrue(Long providerId);
    List<Service> findByCategoryIdAndIsActiveTrue(Long categoryId);
    Page<Service> findByIsActiveTrueAndIsFeaturedTrue(Pageable pageable);
    
    @Query("SELECT s FROM Service s WHERE s.isActive = true AND s.provider.isAvailable = true " +
           "AND s.provider.kycStatus = 'VERIFIED' AND s.category.id = :categoryId")
    Page<Service> findAvailableServicesByCategory(@Param("categoryId") Long categoryId, Pageable pageable);
    
    @Query("SELECT s FROM Service s WHERE s.isActive = true AND s.provider.id = :providerId")
    List<Service> findActiveServicesByProvider(@Param("providerId") Long providerId);
}

// ============================================================================
// Booking Repository
// ============================================================================
@Repository
interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingNumber(String bookingNumber);
    Page<Booking> findByUserId(Long userId, Pageable pageable);
    Page<Booking> findByProviderId(Long providerId, Pageable pageable);
    List<Booking> findByUserIdAndBookingStatus(Long userId, BookingStatus status);
    List<Booking> findByProviderIdAndBookingStatus(Long providerId, BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.provider.id = :providerId AND b.scheduledDate = :date")
    List<Booking> findByProviderAndDate(@Param("providerId") Long providerId, @Param("date") LocalDate date);
    
    @Query("SELECT b FROM Booking b WHERE b.bookingStatus = :status AND b.scheduledDate = :date")
    List<Booking> findByStatusAndDate(@Param("status") BookingStatus status, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.provider.id = :providerId AND b.bookingStatus IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS')")
    int countActiveBookingsByProvider(@Param("providerId") Long providerId);
}

// ============================================================================
// Review Repository
// ============================================================================
@Repository
interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBookingId(Long bookingId);
    Page<Review> findByRevieweeProviderIdAndModerationStatus(Long providerId, ModerationStatus status, Pageable pageable);
    Page<Review> findByRevieweeProviderIdAndIsVisibleTrue(Long providerId, Pageable pageable);
    
    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.revieweeProvider.id = :providerId AND r.moderationStatus = 'APPROVED'")
    BigDecimal calculateAverageRating(@Param("providerId") Long providerId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.revieweeProvider.id = :providerId AND r.moderationStatus = 'APPROVED'")
    int countApprovedReviews(@Param("providerId") Long providerId);
}
