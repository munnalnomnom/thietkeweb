document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const filterButtons = document.querySelectorAll('.filter-select');
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const products = document.querySelectorAll('.product-card');
    const productsContainer = document.getElementById('productsContainer');
    const noResults = document.getElementById('noResults');
    const activeFiltersContainer = document.getElementById('activeFilters');
    const clearFiltersButton = document.getElementById('clearFilters');
    const clearFiltersNoResultsButton = document.getElementById('clearFiltersNoResults');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const brandItems = document.querySelectorAll('#brandDropdown .filter-dropdown-item');
    const priceItems = document.querySelectorAll('#priceDropdown .filter-dropdown-item');
    const sortItems = document.querySelectorAll('#sortDropdown .filter-dropdown-item');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const applyPriceRangeButton = document.getElementById('applyPriceRange');
    const paginationItems = document.querySelectorAll('.pagination .page-item');

    // Filter state
    let currentFilters = {
        category: 'all',
        brand: null,
        price: null,
        priceRange: { min: null, max: null },
        sort: null,
        search: null,
        page: 1
    };

    // Price ranges in VND
    const priceRanges = {
        'low': { min: 0, max: 5000000 },
        'medium': { min: 5000000, max: 15000000 },
        'high': { min: 15000000, max: 30000000 },
        'premium': { min: 30000000, max: Infinity }
    };

    // Toggle filter dropdowns
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dropdown = this.nextElementSibling;
            
            // Close all other dropdowns
            filterDropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('show');
                }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('show');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-wrapper')) {
            filterDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
    
    // Category filtering
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update current category
            currentFilters.category = this.getAttribute('data-category');
            currentFilters.page = 1; // Reset to page 1 when changing category
            
            // Apply filters
            applyFilters();
            updateActiveFilters();
            updatePaginationState();
        });
    });
    
    // Brand filtering
    brandItems.forEach(item => {
        item.addEventListener('click', function() {
            const brand = this.getAttribute('data-brand');
            
            // Toggle selected class
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                currentFilters.brand = null;
            } else {
                // Remove selected class from all brand items
                brandItems.forEach(b => b.classList.remove('selected'));
                
                // Add selected class to clicked item
                this.classList.add('selected');
                currentFilters.brand = brand;
            }
            
            currentFilters.page = 1; // Reset to page 1 when changing brand
            
            // Apply filters
            applyFilters();
            updateActiveFilters();
            updatePaginationState();
            
            // Close dropdown
            document.getElementById('brandDropdown').classList.remove('show');
        });
    });
    
    // Price filtering
    priceItems.forEach(item => {
        item.addEventListener('click', function() {
            const price = this.getAttribute('data-price');
            
            // Toggle selected class
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                currentFilters.price = null;
                currentFilters.priceRange = { min: null, max: null };
            } else {
                // Remove selected class from all price items
                priceItems.forEach(p => p.classList.remove('selected'));
                
                // Add selected class to clicked item
                this.classList.add('selected');
                currentFilters.price = price;
                currentFilters.priceRange = priceRanges[price];
            }
            
            currentFilters.page = 1; // Reset to page 1 when changing price
            
            // Apply filters
            applyFilters();
            updateActiveFilters();
            updatePaginationState();
            
            // Close dropdown
            document.getElementById('priceDropdown').classList.remove('show');
        });
    });
    
    // Apply custom price range
    applyPriceRangeButton.addEventListener('click', function() {
        const minPrice = minPriceInput.value ? parseInt(minPriceInput.value) : null;
        const maxPrice = maxPriceInput.value ? parseInt(maxPriceInput.value) : null;
        
        if (minPrice !== null || maxPrice !== null) {
            // Remove selected class from all price items
            priceItems.forEach(p => p.classList.remove('selected'));
            
            currentFilters.price = 'custom';
            currentFilters.priceRange = { min: minPrice, max: maxPrice };
            currentFilters.page = 1; // Reset to page 1 when changing price
            
            // Apply filters
            applyFilters();
            updateActiveFilters();
            updatePaginationState();
            
            // Close dropdown
            document.getElementById('priceDropdown').classList.remove('show');
        }
    });
    
    // Sort filtering
    sortItems.forEach(item => {
        item.addEventListener('click', function() {
            const sort = this.getAttribute('data-sort');
            
            // Toggle selected class
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                currentFilters.sort = null;
            } else {
                // Remove selected class from all sort items
                sortItems.forEach(s => s.classList.remove('selected'));
                
                // Add selected class to clicked item
                this.classList.add('selected');
                currentFilters.sort = sort;
            }
            
            // Apply filters
            applyFilters();
            updateActiveFilters();
            
            // Close dropdown
            document.getElementById('sortDropdown').classList.remove('show');
        });
    });
    
    // Search functionality
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        currentFilters.search = searchTerm.length > 0 ? searchTerm : null;
        currentFilters.page = 1; // Reset to page 1 when searching
        
        // Apply filters
        applyFilters();
        updateActiveFilters();
        updatePaginationState();
    });
    
    // Search on Enter key press
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim().toLowerCase();
            currentFilters.search = searchTerm.length > 0 ? searchTerm : null;
            currentFilters.page = 1; // Reset to page 1 when searching
            
            // Apply filters
            applyFilters();
            updateActiveFilters();
            updatePaginationState();
        }
    });
    
    // Clear all filters
    clearFiltersButton.addEventListener('click', clearAllFilters);
    clearFiltersNoResultsButton.addEventListener('click', clearAllFilters);
    
    // Pagination
    paginationItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.getAttribute('data-page');
            
            if (page === 'next') {
                currentFilters.page = Math.min(8, currentFilters.page + 1);
            } else {
                currentFilters.page = parseInt(page);
            }
            
            applyFilters();
            updatePaginationState();
            
            // Scroll to top of products section
            document.querySelector('.products-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Apply filters function
    function applyFilters() {
        let visibleCount = 0;
        
        // Get the price range if filter is set
        const priceRange = currentFilters.priceRange;
        
        products.forEach(product => {
            let shouldShow = true;
            
            // Category filter
            if (currentFilters.category !== 'all' && product.getAttribute('data-category') !== currentFilters.category) {
                shouldShow = false;
            }
            
            // Brand filter
            if (shouldShow && currentFilters.brand && product.getAttribute('data-brand') !== currentFilters.brand) {
                shouldShow = false;
            }
            
            // Price filter
            if (shouldShow && currentFilters.price) {
                const productPrice = parseInt(product.getAttribute('data-price'));
                
                if (priceRange.min !== null && productPrice < priceRange.min) {
                    shouldShow = false;
                }
                
                if (priceRange.max !== null && productPrice > priceRange.max) {
                    shouldShow = false;
                }
            }
            
            // Search filter
            if (shouldShow && currentFilters.search) {
                const productName = product.querySelector('.product-name').textContent.toLowerCase();
                const productDescription = product.querySelector('.product-description').textContent.toLowerCase();
                const productCategory = product.querySelector('.product-category').textContent.toLowerCase();
                
                if (!productName.includes(currentFilters.search) && 
                    !productDescription.includes(currentFilters.search) && 
                    !productCategory.includes(currentFilters.search)) {
                    shouldShow = false;
                }
            }
            
            if (shouldShow) {
                visibleCount++;
                product.classList.remove('hidden');
            } else {
                product.classList.add('hidden');
            }
        });
        
        // Show/hide no results message
        if (visibleCount === 0) {
            noResults.classList.remove('hidden');
            productsContainer.classList.add('hidden');
            document.getElementById('pagination').classList.add('hidden');
        } else {
            noResults.classList.add('hidden');
            productsContainer.classList.remove('hidden');
            document.getElementById('pagination').classList.remove('hidden');
            
            // Sort products if needed
            if (currentFilters.sort) {
                sortProducts(currentFilters.sort);
            }
        }
    }
    
    // Sort products function
    function sortProducts(sortType) {
        const productsList = Array.from(products);
        
        switch (sortType) {
            case 'newest':
                productsList.sort((a, b) => {
                    const dateA = new Date(a.getAttribute('data-date'));
                    const dateB = new Date(b.getAttribute('data-date'));
                    return dateB - dateA;
                });
                break;
                
            case 'price-asc':
                productsList.sort((a, b) => {
                    const priceA = parseInt(a.getAttribute('data-price'));
                    const priceB = parseInt(b.getAttribute('data-price'));
                    return priceA - priceB;
                });
                break;
                
            case 'price-desc':
                productsList.sort((a, b) => {
                    const priceA = parseInt(a.getAttribute('data-price'));
                    const priceB = parseInt(b.getAttribute('data-price'));
                    return priceB - priceA;
                });
                break;
                
            case 'rating':
                productsList.sort((a, b) => {
                    const ratingA = parseFloat(a.getAttribute('data-rating'));
                    const ratingB = parseFloat(b.getAttribute('data-rating'));
                    return ratingB - ratingA;
                });
                break;
        }
        
        // Reorder products in the DOM
        productsList.forEach(product => {
            productsContainer.appendChild(product);
        });
    }
    
    // Update active filters UI
    function updateActiveFilters() {
        activeFiltersContainer.innerHTML = '';
        
        // Category filter
        if (currentFilters.category && currentFilters.category !== 'all') {
            addFilterTag('Danh mục: ' + getCategoryName(currentFilters.category), 'category');
        }
        
        // Brand filter
        if (currentFilters.brand) {
            addFilterTag('Thương hiệu: ' + getBrandName(currentFilters.brand), 'brand');
        }
        
        // Price filter
        if (currentFilters.price) {
            if (currentFilters.price === 'custom') {
                const min = currentFilters.priceRange.min !== null ? formatPrice(currentFilters.priceRange.min) : 'Không giới hạn';
                const max = currentFilters.priceRange.max !== null ? formatPrice(currentFilters.priceRange.max) : 'Không giới hạn';
                addFilterTag(`Giá: ${min} - ${max}`, 'price');
            } else {
                addFilterTag('Giá: ' + getPriceName(currentFilters.price), 'price');
            }
        }
        
        // Search filter
        if (currentFilters.search) {
            addFilterTag('Tìm kiếm: ' + currentFilters.search, 'search');
        }
        
        // Sort filter
        if (currentFilters.sort) {
            addFilterTag('Sắp xếp: ' + getSortName(currentFilters.sort), 'sort');
        }
    }
    
    // Add filter tag to UI
    function addFilterTag(text, type) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            ${text}
            <span class="remove-filter" data-type="${type}">
                <i class="fas fa-times"></i>
            </span>
        `;
        
        tag.querySelector('.remove-filter').addEventListener('click', function() {
            const filterType = this.getAttribute('data-type');
            
            switch (filterType) {
                case 'category':
                    // Set category to 'all' and update category tabs
                    currentFilters.category = 'all';
                    categoryTabs.forEach(tab => {
                        if (tab.getAttribute('data-category') === 'all') {
                            tab.classList.add('active');
                        } else {
                            tab.classList.remove('active');
                        }
                    });
                    break;
                    
                case 'brand':
                    currentFilters.brand = null;
                    brandItems.forEach(item => item.classList.remove('selected'));
                    break;
                    
                case 'price':
                    currentFilters.price = null;
                    currentFilters.priceRange = { min: null, max: null };
                    priceItems.forEach(item => item.classList.remove('selected'));
                    minPriceInput.value = '';
                    maxPriceInput.value = '';
                    break;
                    
                case 'search':
                    currentFilters.search = null;
                    searchInput.value = '';
                    break;
                    
                case 'sort':
                    currentFilters.sort = null;
                    sortItems.forEach(item => item.classList.remove('selected'));
                    break;
            }
            
            currentFilters.page = 1; // Reset to page 1 when removing a filter
            
            // Apply filters
            applyFilters();
            updateActiveFilters();
            updatePaginationState();
        });
        
        activeFiltersContainer.appendChild(tag);
    }
    
    // Clear all filters
    function clearAllFilters() {
        // Reset all filters
        currentFilters = {
            category: 'all',
            brand: null,
            price: null,
            priceRange: { min: null, max: null },
            sort: null,
            search: null,
            page: 1
        };
        
        // Reset UI
        categoryTabs.forEach(tab => {
            if (tab.getAttribute('data-category') === 'all') {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        brandItems.forEach(item => item.classList.remove('selected'));
        priceItems.forEach(item => item.classList.remove('selected'));
        sortItems.forEach(item => item.classList.remove('selected'));
        
        minPriceInput.value = '';
        maxPriceInput.value = '';
        searchInput.value = '';
        
        // Apply filters
        applyFilters();
        updateActiveFilters();
        updatePaginationState();
    }
    
    // Update pagination state
    function updatePaginationState() {
        paginationItems.forEach(item => {
            const page = item.getAttribute('data-page');
            
            if (page !== 'next') {
                if (parseInt(page) === currentFilters.page) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });
    }
    
    // Helper functions
    function getCategoryName(category) {
        const categories = {
            'laptop': 'Laptop',
            'smartphone': 'Smartphone',
            'tablet': 'Tablet',
            'tainghe': 'Tai nghe',
            'phukien': 'Phụ kiện'
        };
        
        return categories[category] || category;
    }
    
    function getBrandName(brand) {
        const brands = {
            'apple': 'Apple',
            'samsung': 'Samsung',
            'dell': 'Dell',
            'asus': 'Asus',
            'sony': 'Sony',
            'logitech': 'Logitech',
            'xiaomi': 'Xiaomi',
            'lenovo': 'Lenovo'
        };
        
        return brands[brand] || brand;
    }
    
    function getPriceName(price) {
        const prices = {
            'low': 'Dưới 5 triệu',
            'medium': '5 - 15 triệu',
            'high': '15 - 30 triệu',
            'premium': 'Trên 30 triệu'
        };
        
        return prices[price] || price;
    }
    
    function getSortName(sort) {
        const sorts = {
            'newest': 'Mới nhất',
            'price-asc': 'Giá tăng dần',
            'price-desc': 'Giá giảm dần',
            'rating': 'Đánh giá cao'
        };
        
        return sorts[sort] || sort;
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }
});
