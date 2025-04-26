// Đợi cho trang tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Phần tử DOM
    const cartItemsContainer = document.querySelector('.cart-table tbody');
    const cartHasItems = document.getElementById('cart-has-items');
    const emptyCart = document.getElementById('empty-cart');
    const clearCartBtn = document.querySelector('.clear-cart');
    const subtotalDisplay = document.getElementById('subtotal-value');
    const discountDisplay = document.getElementById('discount-value');
    const shippingDisplay = document.getElementById('shipping-value');
    const totalDisplay = document.getElementById('total-value');
    const promoInput = document.getElementById('promo-code-input');
    const applyPromoBtn = document.getElementById('apply-promo');
    const checkoutBtn = document.getElementById('checkout-button');

    // Biến lưu trữ giá trị giảm giá
    let currentDiscount = 0;

    // Định dạng số tiền
    function formatCurrency(amount) {
        return amount.toLocaleString('vi-VN') + 'đ';
    }

    // Chuyển đổi chuỗi tiền tệ thành số
    function parseCurrency(str) {
        // Loại bỏ kí tự đ và dấu chấm ngăn cách hàng nghìn
        if (!str) return 0;
        return parseInt(str.replace(/\D/g, '')) || 0;
    }

    // Lấy giỏ hàng từ localStorage
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Lưu giỏ hàng vào localStorage
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Kiểm tra và sửa đường dẫn ảnh
    function fixImagePath(imagePath) {
        if (!imagePath) {
            console.log('Không có đường dẫn ảnh');
            return '/image/placeholder.webp'; // Đường dẫn ảnh mặc định
        }
        
        // Sửa đường dẫn ảnh bắt đầu bằng //
        if (imagePath.startsWith('//')) {
            const fixedPath = imagePath.replace('//', '/');
            return fixedPath;
        }
        
        return imagePath;
    }

    // Hiển thị sản phẩm trong giỏ hàng
    function renderCart() {
        const cart = getCart();
        
        // Kiểm tra giỏ hàng trống
        if (cart.length === 0) {
            if (cartHasItems) cartHasItems.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }
        
        // Hiển thị giỏ hàng có sản phẩm
        if (cartHasItems) cartHasItems.style.display = 'block';
        if (emptyCart) emptyCart.style.display = 'none';
        
        // Đảm bảo cartItemsContainer tồn tại
        if (!cartItemsContainer) {
            console.error('Không tìm thấy phần tử cartItemsContainer');
            return;
        }
        
        // Xóa nội dung hiện tại của bảng
        cartItemsContainer.innerHTML = '';
        
        // Thêm từng sản phẩm vào bảng
        cart.forEach((product, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', product.id);
            
            // Sửa đường dẫn ảnh nếu cần
            const imagePath = fixImagePath(product.image);
            
            row.innerHTML = `
                <td>
                    <div class="product-info">
                        <img src="${imagePath}" alt="${product.name}" class="product-image" onerror="this.src='/image/placeholder.webp'; this.onerror=null;">
                        <div class="product-details">
                            <h4>${product.name || 'Sản phẩm không tên'}</h4>
                            <p>${product.description || ''}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="product-price">${formatCurrency(product.price)}</span>
                </td>
                <td>
                    <div class="quantity-control">
                        <button class="decrease-btn">-</button>
                        <input type="number" min="1" value="${product.quantity}" class="quantity-input">
                        <button class="increase-btn">+</button>
                    </div>
                </td>
                <td>
                    <span class="product-total">${formatCurrency(product.price * product.quantity)}</span>
                </td>
                <td>
                    <button class="remove-btn" data-index="${index}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            cartItemsContainer.appendChild(row);
        });
        
        // Thêm event listeners cho các nút trong giỏ hàng
        addEventListeners();
        
        // Cập nhật tổng số tiền
        updateTotal();
    }

    // Thêm event listeners cho các phần tử sau khi render
    function addEventListeners() {
        // Nút tăng số lượng
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const productId = this.closest('tr').getAttribute('data-id');
                updateQuantity(productId, parseInt(input.value) + 1);
            });
        });
        
        // Nút giảm số lượng
        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.nextElementSibling;
                const currentValue = parseInt(input.value);
                if (currentValue > 1) {
                    const productId = this.closest('tr').getAttribute('data-id');
                    updateQuantity(productId, currentValue - 1);
                }
            });
        });
        
        // Input số lượng
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                let value = parseInt(this.value);
                if (value < 1 || isNaN(value)) {
                    value = 1;
                    this.value = 1;
                }
                const productId = this.closest('tr').getAttribute('data-id');
                updateQuantity(productId, value);
            });
        });
        
        // Nút xóa sản phẩm
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeProduct(index);
            });
        });
    }

    // Cập nhật số lượng sản phẩm
    function updateQuantity(productId, newQuantity) {
        const cart = getCart();
        const productIndex = cart.findIndex(item => item.id === productId);
        
        if (productIndex !== -1) {
            cart[productIndex].quantity = newQuantity;
            saveCart(cart);
            renderCart();
        }
    }

    // Xóa sản phẩm khỏi giỏ hàng
    function removeProduct(index) {
        const cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
    }

    // Tính tổng tiền tạm tính (subtotal)
    function calculateSubtotal() {
        const cart = getCart();
        let subtotal = 0;
        
        cart.forEach(product => {
            subtotal += product.price * product.quantity;
        });
        
        return subtotal;
    }

    // Cập nhật tổng tiền
    function updateTotal() {
        // Tính tổng tiền tạm tính
        const subtotal = calculateSubtotal();
        
        // Log để debug
        console.log('Tạm tính:', subtotal);
        
        // Cập nhật hiển thị tạm tính
        if (subtotalDisplay) {
            subtotalDisplay.textContent = formatCurrency(subtotal);
        } else {
            console.warn('Không tìm thấy phần tử subtotalDisplay');
        }
        
        // Lấy phí vận chuyển
        let shipping = 30000; // Giá trị mặc định
        if (shippingDisplay) {
            shipping = parseCurrency(shippingDisplay.textContent);
        }
        
        // Cập nhật giá trị giảm giá
        if (discountDisplay) {
            discountDisplay.textContent = formatCurrency(currentDiscount);
        }
        
        // Tính tổng cộng
        const total = subtotal + shipping - currentDiscount;
        
        // Log để debug
        console.log('Phí vận chuyển:', shipping);
        console.log('Giảm giá:', currentDiscount);
        console.log('Tổng cộng:', total);
        
        // Cập nhật tổng cộng
        if (totalDisplay) {
            totalDisplay.textContent = formatCurrency(total);
        } else {
            console.warn('Không tìm thấy phần tử totalDisplay');
        }
    }

    // Xử lý nút xóa tất cả
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            const confirmClear = confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?');
            if (confirmClear) {
                localStorage.removeItem('cart');
                // Reset giá trị giảm giá khi xóa hết giỏ hàng
                currentDiscount = 0;
                renderCart();
            }
        });
    }

    // Xử lý nút áp dụng mã giảm giá
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', function() {
            if (!promoInput) return;
            
            const promoCode = promoInput.value.trim();
            
            if (promoCode === 'HEXON10') {
                // Tính lại tạm tính mỗi khi áp dụng mã giảm giá
                const subtotal = calculateSubtotal();
                
                // Giảm giá 10% tạm tính
                currentDiscount = Math.round(subtotal * 0.1);
                
                // Cập nhật tổng tiền sau khi áp dụng mã giảm giá
                updateTotal();
                alert('Đã áp dụng mã giảm giá HEXON10 thành công!');
            } else if (promoCode) {
                alert('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            }
        });
    }

    // Xử lý nút thanh toán
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cart = getCart();
            if (cart.length === 0) {
                alert('Giỏ hàng của bạn đang trống!');
                return;
            }
            
            alert('Đang chuyển hướng đến trang thanh toán...');
            // Ở đây sẽ chuyển hướng đến trang thanh toán
            // window.location.href = 'thanhtoan.html';
        });
    }

    // Khởi tạo trang giỏ hàng
    renderCart();
});