package com.hirelink.repository;

import com.hirelink.entity.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByProvider_ProviderIdAndIsActiveTrue(Long providerId);

    Page<Service> findByCategory_CategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.isActive = true AND " +
           "(LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.serviceDescription) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Service> searchServices(@Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.isActive = true AND s.provider.kycStatus = 'VERIFIED' " +
           "ORDER BY s.timesBooked DESC")
    Page<Service> findPopularServices(Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.isActive = true AND s.provider.kycStatus = 'VERIFIED' " +
           "AND s.category.categoryId = :categoryId ORDER BY s.averageRating DESC")
    Page<Service> findTopRatedByCategory(@Param("categoryId") Long categoryId, Pageable pageable);
}
