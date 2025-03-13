document.addEventListener('DOMContentLoaded', () => {
    // Menu Items (Prices in INR)
    const menuItems = [
        // Italian Pizzas
        { id: 1, name: "Margherita Classico Pizza", price: 299 },
        { id: 2, name: "Prosciutto e Funghi Pizza", price: 349 },
        { id: 3, name: "Quattro Formaggi Pizza", price: 399 },
        { id: 4, name: "Diavola Spicy Salami Pizza", price: 329 },
        // Burgers
        { id: 5, name: "Truffle Royale Burger", price: 249 },
        { id: 6, name: "Spicy Jalapeño Bacon Burger", price: 229 },
        { id: 7, name: "Classic Americana Burger", price: 199 },
        { id: 8, name: "Mushroom Swiss Melt Burger", price: 239 },
        // Mocktails
        { id: 9, name: "Twilight Citrus Bliss Mocktail", price: 149 },
        { id: 10, name: "Berry Sunset Spritz", price: 169 },
        { id: 11, name: "Minty Mojito Mirage", price: 139 },
        { id: 12, name: "Tropical Paradise Splash", price: 179 },
        // Salads
        { id: 13, name: "Caprese Balsamic Bliss", price: 189 },
        { id: 14, name: "Grilled Chicken Caesar Crunch", price: 219 },
        { id: 15, name: "Mediterranean Feta Delight", price: 179 },
        { id: 16, name: "Roasted Beet & Goat Cheese Salad", price: 199 }
    ];

    // Cart, Orders, and Users
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // DOM Elements
    const menuItemsDiv = document.getElementById('menu-items');
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutSection = document.getElementById('checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const orderListDiv = document.getElementById('order-list');
    const cartSection = document.getElementById('cart');
    const ordersSection = document.getElementById('orders');
    const loginSection = document.getElementById('login');
    const signupSection = document.getElementById('signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userGreeting = document.getElementById('user-greeting');
    const usernameSpan = document.getElementById('username');

    // Display Menu
    function displayMenu() {
        menuItems.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('menu-item');
            div.innerHTML = `
                <span>${item.name} - ₹${item.price.toFixed(2)}</span>
                <button onclick="addToCart(${item.id})">Add to Cart</button>
            `;
            menuItemsDiv.appendChild(div);
        });
    }

    // Add to Cart
    function addToCart(itemId) {
        if (!currentUser) {
            alert('Please login to add items to your cart!');
            showSection('login');
            return;
        }
        const item = menuItems.find(i => i.id === itemId);
        const cartItem = cart.find(i => i.id === itemId);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        updateCart();
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Update Cart Display
    function updateCart() {
        cartItemsDiv.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <span>${item.name} (x${item.quantity}) - ₹${itemTotal.toFixed(2)}</span>
                <button onclick="removeFromCart(${item.id})">Remove</button>
            `;
            cartItemsDiv.appendChild(div);
        });
        cartTotalSpan.textContent = total.toFixed(2);
        cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Remove from Cart
    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        updateCart();
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        showSection('checkout');
    });

    // Place Order
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const payment = document.getElementById('payment').value;

        const order = {
            id: Date.now(),
            items: [...cart],
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            name,
            address,
            payment,
            date: new Date().toLocaleString(),
            user: currentUser.email,
            status: 'Pending' // Added for cancel feature
        };

        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        showSection('orders');
        displayOrders();
        alert(`Order placed successfully! Total: ₹${order.total.toFixed(2)}`);
    });

    // Display Orders
    function displayOrders() {
        orderListDiv.innerHTML = '';
        const userOrders = orders.filter(order => order.user === currentUser.email);
        userOrders.forEach(order => {
            const div = document.createElement('div');
            div.classList.add('order-item');
            div.innerHTML = `
                <p>Order #${order.id} - ${order.date}</p>
                <p>Items: ${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                <p>Total: ₹${order.total.toFixed(2)}</p>
                <p>Deliver to: ${order.name}, ${order.address}</p>
                <p>Payment: ${order.payment}</p>
                <p>Status: ${order.status}</p>
                ${order.status === 'Pending' ? `<button onclick="cancelOrder(${order.id})">Cancel Order</button>` : ''}
            `;
            orderListDiv.appendChild(div);
        });
    }

    // Cancel Order
    function cancelOrder(orderId) {
        const orderIndex = orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1 && orders[orderIndex].status === 'Pending') {
            if (confirm('Are you sure you want to cancel this order?')) {
                orders.splice(orderIndex, 1);
                localStorage.setItem('orders', JSON.stringify(orders));
                displayOrders();
                alert('Order canceled successfully!');
            }
        } else {
            alert('This order cannot be canceled.');
        }
    }

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserUI();
            showSection('home');
            alert('Logged in successfully!');
        } else {
            alert('Invalid email or password!');
        }
    });

    // Sign Up
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        if (users.find(u => u.email === email)) {
            alert('Email already registered!');
            return;
        }
        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserUI();
        showSection('home');
        alert('Signed up successfully!');
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.removeItem('currentUser');
        updateUserUI();
        showSection('home');
        alert('Logged out successfully!');
    });

    // Update User UI
    function updateUserUI() {
        if (currentUser) {
            loginBtn.classList.add('hidden');
            signupBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            userGreeting.classList.remove('hidden');
            usernameSpan.textContent = currentUser.name;
        } else {
            loginBtn.classList.remove('hidden');
            signupBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            userGreeting.classList.add('hidden');
        }
    }

    // Show Section
    function showSection(sectionId) {
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        } else {
            console.error(`Section with ID "${sectionId}" not found`);
        }
    }

    // Navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
            if (sectionId === 'cart') updateCart();
            if (sectionId === 'orders' && currentUser) displayOrders();
        });
    });

    loginBtn.addEventListener('click', () => showSection('login'));
    signupBtn.addEventListener('click', () => showSection('signup'));

    // Initial Setup
    displayMenu();
    updateCart();
    updateUserUI();
    showSection('home');
});
