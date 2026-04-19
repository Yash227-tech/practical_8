let products = [];

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        // Map MongoDB _id to id for frontend compatibility
        products = data.map(p => ({
            ...p,
            id: p._id,
        }));
        window.products = products;
        return products;
    } catch (err) {
        console.error("Failed to fetch products:", err);
        return [];
    }
}

function getProductById(id) {
    return products.find(p => p.id === id || p._id === id);
}

function formatPrice(price) {
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
}

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;

    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function updateUserDisplay() {
    const userBtn = document.querySelector('.nav-user');
    if (!userBtn) return;

    const currentUser = getCurrentUser();
    if (currentUser) {
        userBtn.innerHTML = `👤 ${currentUser.name.split(' ')[0]}`;
        userBtn.href = '#';
        userBtn.onclick = (e) => {
            e.preventDefault();
            showLogoutModal();
        };
    } else {
        userBtn.innerHTML = '👤 Login';
        userBtn.href = 'login.html';
        userBtn.onclick = null;
    }
}

function showLogoutModal() {
    let modal = document.getElementById('logout-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'logout-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: 360px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>
                <h3 style="margin-bottom: 0.5rem;">Logout</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Are you sure you want to logout?
                </p>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-ghost" style="flex: 1;" onclick="closeLogoutModal()">
                        Cancel
                    </button>
                    <button class="btn btn-accent" style="flex: 1;" onclick="confirmLogout()">
                        Logout
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLogoutModal();
            }
        });
    }
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function confirmLogout() {
    logout();
    closeLogoutModal();
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    await fetchProducts(); // Initialize products from backend
    updateCartBadge();
    updateUserDisplay();
    
    // Trigger re-renders if these functions exist on the current page
    if (typeof loadProducts === 'function') loadProducts();
    if (typeof loadFeaturedProducts === 'function') loadFeaturedProducts();
    if (typeof loadCart === 'function') loadCart(); // Re-render cart items
    if (typeof loadCheckoutItems === 'function') loadCheckoutItems(); // Re-render checkout summary
});

window.products = products;
window.fetchProducts = fetchProducts;
window.getProductById = getProductById;
window.formatPrice = formatPrice;
window.updateCartBadge = updateCartBadge;
window.updateUserDisplay = updateUserDisplay;
window.showLogoutModal = showLogoutModal;
window.closeLogoutModal = closeLogoutModal;
window.confirmLogout = confirmLogout;
