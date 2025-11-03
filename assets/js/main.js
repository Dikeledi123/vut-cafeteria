// VUT Eats Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initScrollUp();
    initImageGalleries();
    initFormValidations();
    initCartFunctionality();
    initLoginHandlers();
    updateCartCount();
});

// Scroll Up Button Functionality
function initScrollUp() {
    const scrollUp = document.getElementById('scroll-up');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollUp.classList.add('show');
        } else {
            scrollUp.classList.remove('show');
        }
    });

    scrollUp.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Image Gallery Functionality
function initImageGalleries() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    
    if (thumbnails.length > 0 && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                const newSrc = this.getAttribute('data-image');
                mainImage.src = newSrc;
                
                // Update active state
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}

// Form Validation
function initFormValidations() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(input);
        }
        
        // Email validation
        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                showFieldError(input, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Password confirmation validation
        if (input.name === 'confirm_password' && form.querySelector('#reg_password')) {
            const password = form.querySelector('#reg_password').value;
            if (input.value !== password) {
                showFieldError(input, 'Passwords do not match');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}

// Cart Functionality
function initCartFunctionality() {
    // Cart functionality will be handled by individual pages
    // This is a placeholder for common cart functions
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('vut_cart') || '[]');
    const cartCountElements = document.querySelectorAll('#cart-count, .badge.rounded-pill.bg-danger');
    
    cartCountElements.forEach(element => {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (totalItems > 0) {
            element.textContent = totalItems;
            element.style.display = 'block';
            element.classList.add('pulse');
            setTimeout(() => element.classList.remove('pulse'), 500);
        } else {
            element.style.display = 'none';
        }
    });
}

// Login Handlers
function initLoginHandlers() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(this);
        });
    }
}

function handleLogin(form) {
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const messageDiv = document.getElementById('login-message');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';
    
    fetch('assets/php/login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            
            // Close modal and reload page after success
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (modal) {
                    modal.hide();
                }
                window.location.reload();
            }, 1500);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
    })
    .catch(error => {
        messageDiv.innerHTML = '<div class="alert alert-danger">An error occurred. Please try again.</div>';
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Cart Management Functions
function addToCart(productId, productName, productPrice, productImage, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('vut_cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
    }
    
    localStorage.setItem('vut_cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Item added to cart!', 'success');
    
    return cart;
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('vut_cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('vut_cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Item removed from cart', 'warning');
    
    return cart;
}

function updateCartQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('vut_cart') || '[]');
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        if (quantity <= 0) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = quantity;
        }
    }
    
    localStorage.setItem('vut_cart', JSON.stringify(cart));
    updateCartCount();
    
    return cart;
}

function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('vut_cart') || '[]');
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function clearCart() {
    localStorage.removeItem('vut_cart');
    updateCartCount();
}

// Toast Notification System
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.vut-toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast vut-toast align-items-center text-bg-${getToastBg(type)} border-0 position-fixed top-0 end-0 m-3`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(toastEl);
    
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

function getToastBg(type) {
    switch (type) {
        case 'success': return 'success';
        case 'warning': return 'warning';
        case 'error': return 'danger';
        default: return 'primary';
    }
}

// Utility Functions
function formatPrice(price) {
    return 'R' + parseFloat(price).toFixed(2);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other scripts
window.VUTEats = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    clearCart,
    showToast,
    formatPrice
};