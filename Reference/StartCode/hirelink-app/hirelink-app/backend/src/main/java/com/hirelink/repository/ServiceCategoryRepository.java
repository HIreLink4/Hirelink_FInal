package com.hirelink.repository;

import com.hirelink.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {

    Optional<ServiceCategory> findByCategorySlug(String slug);

    @Query("SELECT sc FROM ServiceCategory sc WHERE sc.parentCategory IS NULL AND sc.isActive = true ORDER BY sc.displayOrder")
    List<ServiceCategory> findAllParentCategories();

    @Query("SELECT sc FROM ServiceCategory sc WHERE sc.parentCategory.categoryId = :parentId AND sc.isActive = true ORDER BY sc.displayOrder")
    List<ServiceCategory> findSubCategories(Long parentId);

    @Query("SELECT sc FROM ServiceCategory sc WHERE sc.isFeatured = true AND sc.isActive = true ORDER BY sc.displayOrder")
    List<ServiceCategory> findFeaturedCategories();

    List<ServiceCategory> findByIsActiveTrue();
}
