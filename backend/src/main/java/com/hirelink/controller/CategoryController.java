package com.hirelink.controller;

import com.hirelink.dto.ApiResponse;
import com.hirelink.dto.CategoryDTO;
import com.hirelink.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Service category endpoints")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all active categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO.CategoryResponse>>> getAllCategories() {
        List<CategoryDTO.CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/root")
    @Operation(summary = "Get root categories with subcategories")
    public ResponseEntity<ApiResponse<List<CategoryDTO.CategoryResponse>>> getRootCategories() {
        List<CategoryDTO.CategoryResponse> categories = categoryService.getRootCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO.CategoryResponse>>> getFeaturedCategories() {
        List<CategoryDTO.CategoryResponse> categories = categoryService.getFeaturedCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get category by slug")
    public ResponseEntity<ApiResponse<CategoryDTO.CategoryResponse>> getCategoryBySlug(
            @PathVariable String slug) {
        CategoryDTO.CategoryResponse category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping("/id/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<CategoryDTO.CategoryResponse>> getCategoryById(
            @PathVariable Long id) {
        CategoryDTO.CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping("/{id}/subcategories")
    @Operation(summary = "Get subcategories of a category")
    public ResponseEntity<ApiResponse<List<CategoryDTO.CategoryResponse>>> getSubcategories(
            @PathVariable Long id) {
        List<CategoryDTO.CategoryResponse> categories = categoryService.getSubcategories(id);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}
