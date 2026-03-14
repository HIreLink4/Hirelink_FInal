package com.hirelink.service;

import com.hirelink.dto.CategoryDTO;
import com.hirelink.entity.ServiceCategory;
import com.hirelink.exception.ResourceNotFoundException;
import com.hirelink.repository.ServiceCategoryRepository;
import com.hirelink.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final ServiceCategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;

    public List<CategoryDTO.CategoryResponse> getAllCategories() {
        List<ServiceCategory> categories = categoryRepository.findAllActiveSorted();
        return categories.stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO.CategoryResponse> getRootCategories() {
        List<ServiceCategory> categories = categoryRepository.findRootCategories();
        return categories.stream()
                .map(this::mapToCategoryResponseWithSubcategories)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO.CategoryResponse> getFeaturedCategories() {
        List<ServiceCategory> categories = categoryRepository.findByIsFeaturedTrueAndIsActiveTrue();
        return categories.stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO.CategoryResponse getCategoryBySlug(String slug) {
        ServiceCategory category = categoryRepository.findByCategorySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
        return mapToCategoryResponseWithSubcategories(category);
    }

    @Transactional(readOnly = true)
    public CategoryDTO.CategoryResponse getCategoryById(Long id) {
        ServiceCategory category = categoryRepository.findByIdWithSubcategories(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        return mapToCategoryResponseWithSubcategories(category);
    }

    public List<CategoryDTO.CategoryResponse> getSubcategories(Long parentId) {
        List<ServiceCategory> categories = categoryRepository.findByParentCategoryCategoryIdAndIsActiveTrue(parentId);
        return categories.stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    private CategoryDTO.CategoryResponse mapToCategoryResponse(ServiceCategory category) {
        Long serviceCount = serviceRepository.countByCategoryId(category.getCategoryId());
        
        return CategoryDTO.CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .categorySlug(category.getCategorySlug())
                .categoryDescription(category.getCategoryDescription())
                .categoryIcon(category.getCategoryIcon())
                .categoryImageUrl(category.getCategoryImageUrl())
                .categoryLevel(category.getCategoryLevel())
                .displayOrder(category.getDisplayOrder())
                .minBasePrice(category.getMinBasePrice())
                .maxBasePrice(category.getMaxBasePrice())
                .priceUnit(category.getPriceUnit() != null ? category.getPriceUnit().name() : null)
                .isActive(category.getIsActive())
                .isFeatured(category.getIsFeatured())
                .serviceCount(serviceCount.intValue())
                .build();
    }

    private CategoryDTO.CategoryResponse mapToCategoryResponseWithSubcategories(ServiceCategory category) {
        CategoryDTO.CategoryResponse response = mapToCategoryResponse(category);
        
        try {
            if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
                List<CategoryDTO.CategoryResponse> subCategories = category.getSubCategories().stream()
                        .filter(sub -> sub.getIsActive() != null && sub.getIsActive())
                        .map(this::mapToCategoryResponse)
                        .collect(Collectors.toList());
                response.setSubCategories(subCategories);
            }
        } catch (Exception e) {
            // SubCategories not loaded, use empty list
            response.setSubCategories(Collections.emptyList());
        }
        
        return response;
    }
}
