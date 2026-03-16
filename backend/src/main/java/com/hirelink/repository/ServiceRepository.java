package com.hirelink.repository;

import com.hirelink.entity.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    List<Service> findByProviderProviderId(Long providerId);
    
    // Simple derived-method query (no JOIN FETCH) for pagination — avoids HibernateException
    Page<Service> findByProviderProviderIdAndIsActiveTrue(Long providerId, Pageable pageable);
    
    // For the provider-profile page: fetch all active services without pagination
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.category WHERE s.provider.providerId = :providerId AND s.isActive = true ORDER BY s.serviceId DESC")
    List<Service> findAllActiveByProviderId(@Param("providerId") Long providerId);
    
    // Category-based listing — use derived method to let Spring Data handle the count query
    Page<Service> findByCategoryCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);
    
    Page<Service> findByCategoryCategorySlugAndIsActiveTrue(String categorySlug, Pageable pageable);

    @Query(value = "SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category c " +
                   "WHERE c.categorySlug = :slug AND s.isActive = true AND (" +
                   ":location IS NULL OR :location = '' OR " +
                   "LOWER(p.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                   "LOWER(p.district) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                   "LOWER(p.state) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                   "LOWER(p.basePincode) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                   "LOWER(p.baseAddress) LIKE LOWER(CONCAT('%', :location, '%')))",
           countQuery = "SELECT COUNT(s) FROM Service s LEFT JOIN s.provider p LEFT JOIN s.category c " +
                        "WHERE c.categorySlug = :slug AND s.isActive = true AND (" +
                        ":location IS NULL OR :location = '' OR " +
                        "LOWER(p.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                        "LOWER(p.district) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                        "LOWER(p.state) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                        "LOWER(p.basePincode) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                        "LOWER(p.baseAddress) LIKE LOWER(CONCAT('%', :location, '%')))")
    Page<Service> searchByCategoryAndLocation(@Param("slug") String slug, @Param("location") String location, Pageable pageable);
    
    @Query(value = "SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.isFeatured = true AND s.isActive = true")
    List<Service> findByIsFeaturedTrueAndIsActiveTrue();
    
    @Query(value = "SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.isActive = true ORDER BY s.timesBooked DESC",
           countQuery = "SELECT COUNT(s) FROM Service s WHERE s.isActive = true")
    Page<Service> findPopularServices(Pageable pageable);
    
    @Query(value = "SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category c " +
                   "WHERE s.isActive = true AND (" +
                   "LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(s.serviceDescription) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(s.serviceHighlights) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(p.businessName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(p.tagline) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(p.specializations) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(p.district) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(p.state) LIKE LOWER(CONCAT('%', :query, '%')))",
           countQuery = "SELECT COUNT(s) FROM Service s LEFT JOIN s.provider p LEFT JOIN s.category c " +
                        "WHERE s.isActive = true AND (" +
                        "LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(s.serviceDescription) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(s.serviceHighlights) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(p.businessName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(p.tagline) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(p.specializations) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(p.district) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(p.state) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Service> searchServices(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category c " +
                   "WHERE s.isActive = true AND (" +
                   "LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(s.serviceDescription) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :query, '%'))) AND (" +
                   ":location IS NULL OR :location = '' OR " +
                   "LOWER(p.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                   "LOWER(p.district) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                   "LOWER(p.state) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                   "LOWER(p.basePincode) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                   "LOWER(p.baseAddress) LIKE LOWER(CONCAT('%', :location, '%')))",
           countQuery = "SELECT COUNT(s) FROM Service s LEFT JOIN s.provider p LEFT JOIN s.category c " +
                        "WHERE s.isActive = true AND (" +
                        "LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(s.serviceDescription) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :query, '%'))) AND (" +
                        ":location IS NULL OR :location = '' OR " +
                        "LOWER(p.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                        "LOWER(p.district) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                        "LOWER(p.state) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                        "LOWER(p.basePincode) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                        "LOWER(p.baseAddress) LIKE LOWER(CONCAT('%', :location, '%')))")
    Page<Service> searchServicesWithLocation(@Param("query") String query, @Param("location") String location, Pageable pageable);
    
    @Query(value = "SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.category.categoryId = :categoryId AND s.isActive = true ORDER BY s.averageRating DESC, s.timesBooked DESC",
           countQuery = "SELECT COUNT(s) FROM Service s WHERE s.category.categoryId = :categoryId AND s.isActive = true")
    Page<Service> findTopServicesByCategory(@Param("categoryId") Long categoryId, Pageable pageable);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE p.basePincode = :pincode AND s.isActive = true")
    List<Service> findByProviderPincode(@Param("pincode") String pincode);
    
    @Query("SELECT COUNT(s) FROM Service s WHERE s.category.categoryId = :categoryId AND s.isActive = true")
    Long countByCategoryId(@Param("categoryId") Long categoryId);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.serviceId = :id")
    Optional<Service> findByIdWithDetails(@Param("id") Long id);
}
