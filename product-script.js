// Đợi cho trang tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Lấy các phần tử DOM
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const modal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-modal');
    const continueShoppingBtn = document.getElementById('continue-shopping');
    const viewCartModalBtn = document.getElementById('view-cart');
    const quantityInput = document.getElementById('quantity');
    const modalQuantity = document.getElementById('modal-quantity');
    const modalProductImage = document.querySelector('.modal-product-image');
    const modalProductName = document.querySelector('.modal-product-details h4');
    const modalProductPrice = document.querySelector('.modal-product-price');

    // Kiểm tra và sửa đường dẫn ảnh
    function fixImagePath(imagePath) {
        if (!imagePath) {
            console.log('Không có đường dẫn ảnh');
            return '/image/placeholder.webp'; // Đường dẫn ảnh mặc định
        }
        
        console.log('Đường dẫn ảnh gốc:', imagePath);
        
        // Sửa đường dẫn ảnh bắt đầu bằng //
        if (imagePath.startsWith('//')) {
            const fixedPath = imagePath.replace('//', '/');
            console.log('Đã sửa đường dẫn ảnh thành:', fixedPath);
            return fixedPath;
        }
        
        return imagePath;
    }

    // Hàm lưu sản phẩm vào localStorage
    function addToCart(product) {
        // Kiểm tra và sửa đường dẫn ảnh nếu cần
        product.image = fixImagePath(product.image);
        
        // Log để debug
        console.log('Thêm sản phẩm vào giỏ hàng:', product);
        
        // Lấy giỏ hàng hiện tại từ localStorage (nếu có)
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingProductIndex !== -1) {
            // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
            cart[existingProductIndex].quantity += product.quantity;
        } else {
            // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
            cart.push(product);
        }
        
        // Lưu lại giỏ hàng vào localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Giỏ hàng sau khi cập nhật:', cart);
    }

    // Xử lý sự kiện khi bấm nút "Thêm vào giỏ hàng"
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            try {
                // Lấy số lượng từ input
                const quantity = parseInt(quantityInput.value) || 1;
                
                // Thông tin sản phẩm lấy từ thuộc tính data
                const productId = addToCartBtn.getAttribute('data-id');
                const productName = addToCartBtn.getAttribute('data-name');
                const productPrice = parseInt(addToCartBtn.getAttribute('data-price')) || 0;
                const productImage = addToCartBtn.getAttribute('data-image');
                
                console.log('Thông tin sản phẩm:', {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: quantity
                });
                
                // Kiểm tra dữ liệu
                if (!productId || !productName || !productPrice) {
                    console.error('Thiếu thông tin sản phẩm:', {
                        id: productId,
                        name: productName,
                        price: productPrice
                    });
                    return;
                }
                
                const product = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: quantity
                };
                
                // Thêm sản phẩm vào giỏ hàng
                addToCart(product);
                
                // Cập nhật modal xác nhận
                // Cập nhật số lượng hiển thị trong modal
                if (modalQuantity) {
                    modalQuantity.textContent = `Số lượng: ${quantity}`;
                } else {
                    console.warn('Không tìm thấy phần tử modalQuantity');
                }
                
                // Cập nhật hình ảnh trong modal
                if (modalProductImage) {
                    let imagePath = fixImagePath(product.image);
                    modalProductImage.src = imagePath;
                    modalProductImage.alt = product.name;
                    
                    // Thêm sự kiện onerror cho ảnh
                    modalProductImage.onerror = function() {
                        this.src = '/image/placeholder.webp';
                        this.onerror = null;
                    };
                } else {
                    console.warn('Không tìm thấy phần tử modalProductImage');
                }
                
                // Cập nhật tên sản phẩm trong modal
                if (modalProductName) {
                    modalProductName.textContent = product.name;
                } else {
                    console.warn('Không tìm thấy phần tử modalProductName');
                }
                
                // Cập nhật giá sản phẩm trong modal
                if (modalProductPrice) {
                    modalProductPrice.textContent = product.price.toLocaleString('vi-VN') + 'đ';
                } else {
                    console.warn('Không tìm thấy phần tử modalProductPrice');
                }
                
                // Hiển thị modal xác nhận
                if (modal) {
                    modal.style.display = 'block';
                } else {
                    console.warn('Không tìm thấy phần tử modal');
                    alert('Đã thêm sản phẩm vào giỏ hàng!');
                }
            } catch (error) {
                console.error('Lỗi khi thêm vào giỏ hàng:', error);
                alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
            }
        });
    } else {
        console.warn('Không tìm thấy nút thêm vào giỏ hàng');
    }

    // Xử lý sự kiện khi bấm nút "Xem giỏ hàng"
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', function() {
            window.location.href = 'giohang.html';
        });
    }

    // Đóng modal khi bấm nút X
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Đóng modal khi bấm ra ngoài
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Xử lý nút "Tiếp tục mua sắm" trong modal
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Xử lý nút "Xem giỏ hàng" trong modal
    if (viewCartModalBtn) {
        viewCartModalBtn.addEventListener('click', function() {
            window.location.href = 'giohang.html';
        });
    }
});