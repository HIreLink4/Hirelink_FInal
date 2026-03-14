package com.hirelink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class CategoryDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private Long categoryId;
        private String categoryName;
        private String categorySlug;
        private String categoryDescription;
        private String categoryIcon;
        private String categoryImageUrl;
        private Integer categoryLevel;
        private Integer displayOrder;
        private BigDecimal minBasePrice;
        private BigDecimal maxBasePrice;
        private String priceUnit;
        private Boolean isActive;
        private Boolean isFeatured;
        private Integer serviceCount;
        private List<CategoryResponse> subCategories;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryListResponse {
        private List<CategoryResponse> categories;
        private Integer total;
    }
}
