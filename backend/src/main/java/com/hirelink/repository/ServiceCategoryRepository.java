package com.hirelink.repository;

import com.hirelink.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    
    @Query("SELECT c FROM ServiceCategory c LEFT JOIN FETCH c.subCategories WHERE c.categorySlug = :slug")
    Optional<ServiceCategory> findByCategorySlug(@Param("slug") String slug);
    
    Optional<ServiceCategory> findByCategoryName(String name);
    
    List<ServiceCategory> findByIsActiveTrue();
    
    List<ServiceCategory> findByIsFeaturedTrueAndIsActiveTrue();
    
    List<ServiceCategory> findByParentCategoryIsNullAndIsActiveTrue();
    
    List<ServiceCategory> findByParentCategoryCategoryIdAndIsActiveTrue(Long parentId);
    
    @Query("SELECT c FROM ServiceCategory c WHERE c.isActive = true ORDER BY c.displayOrder ASC, c.categoryName ASC")
    List<ServiceCategory> findAllActiveSorted();
    
    @Query("SELECT DISTINCT c FROM ServiceCategory c LEFT JOIN FETCH c.subCategories WHERE c.parentCategory IS NULL AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<ServiceCategory> findRootCategories();
    
    @Query("SELECT c FROM ServiceCategory c LEFT JOIN FETCH c.subCategories WHERE c.categoryId = :id")
    Optional<ServiceCategory> findByIdWithSubcategories(@Param("id") Long id);
    
    boolean existsByCategorySlug(String slug);
}
