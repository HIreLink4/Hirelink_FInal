package com.hirelink.repository;

import com.hirelink.entity.ServiceProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {

    Optional<ServiceProvider> findByUser_UserId(Long userId);

    @Query("SELECT sp FROM ServiceProvider sp JOIN sp.user u WHERE u.deletedAt IS NULL AND sp.kycStatus = :status")
    Page<ServiceProvider> findByKycStatus(@Param("status") ServiceProvider.KycStatus status, Pageable pageable);

    @Query("SELECT sp FROM ServiceProvider sp JOIN sp.user u WHERE u.deletedAt IS NULL AND sp.isAvailable = true AND sp.kycStatus = 'VERIFIED'")
    Page<ServiceProvider> findAvailableProviders(Pageable pageable);

    @Query("SELECT sp FROM ServiceProvider sp JOIN sp.user u WHERE u.deletedAt IS NULL AND sp.isFeatured = true AND sp.kycStatus = 'VERIFIED'")
    List<ServiceProvider> findFeaturedProviders();

    @Query(value = "SELECT sp.*, " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(sp.base_latitude)) * " +
           "cos(radians(sp.base_longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(sp.base_latitude)))) AS distance " +
           "FROM service_providers sp " +
           "JOIN users u ON sp.user_id = u.user_id " +
           "WHERE u.deleted_at IS NULL " +
           "AND sp.kyc_status = 'VERIFIED' " +
           "AND sp.is_available = true " +
           "HAVING distance <= :radius " +
           "ORDER BY distance ASC",
           nativeQuery = true)
    List<ServiceProvider> findNearbyProviders(
            @Param("lat") BigDecimal latitude,
            @Param("lng") BigDecimal longitude,
            @Param("radius") Integer radiusKm);

    @Query("SELECT sp FROM ServiceProvider sp JOIN sp.user u WHERE u.deletedAt IS NULL " +
           "AND sp.kycStatus = 'VERIFIED' AND sp.basePincode = :pincode")
    List<ServiceProvider> findByPincode(@Param("pincode") String pincode);

    @Query("SELECT sp FROM ServiceProvider sp JOIN sp.user u JOIN sp.services s " +
           "WHERE u.deletedAt IS NULL AND sp.kycStatus = 'VERIFIED' " +
           "AND s.category.categoryId = :categoryId AND sp.isAvailable = true")
    Page<ServiceProvider> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);
}
