package com.hirelink.repository;

import com.hirelink.entity.Review;
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
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    Optional<Review> findByBookingBookingId(Long bookingId);
    
    Page<Review> findByRevieweeProviderProviderIdAndIsVisibleTrueOrderByCreatedAtDesc(Long providerId, Pageable pageable);
    
    Page<Review> findByReviewerUserIdOrderByCreatedAtDesc(Long reviewerId, Pageable pageable);
    
    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.revieweeProvider.providerId = :providerId AND r.isVisible = true")
    BigDecimal calculateAverageRating(@Param("providerId") Long providerId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.revieweeProvider.providerId = :providerId AND r.isVisible = true")
    Long countByProviderId(@Param("providerId") Long providerId);
    
    @Query("SELECT r FROM Review r WHERE r.revieweeProvider.providerId = :providerId AND r.isVisible = true ORDER BY r.createdAt DESC")
    List<Review> findRecentReviews(@Param("providerId") Long providerId, Pageable pageable);
    
    boolean existsByBookingBookingId(Long bookingId);
}
