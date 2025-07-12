// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - (document.querySelector('nav').offsetHeight); // Adjust for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Cart functionality
    let cart = [];

    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const messageModal = document.getElementById('message-modal');

    const closeButtons = document.querySelectorAll('.modal .close-button');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartBadge = document.querySelector('.cart-badge');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentMethodInput = document.getElementById('payment-method');
    const messageModalCloseBtn = document.getElementById('message-modal-close-btn');

    // Function to show custom message modal
    function showMessageModal(title, message) {
        document.getElementById('message-modal-title').textContent = title;
        document.getElementById('message-modal-body').textContent = message;
        messageModal.classList.remove('hidden');
    }

    // Function to hide custom message modal
    function hideMessageModal() {
        messageModal.classList.add('hidden');
    }

    // Event listener for message modal close button
    if (messageModalCloseBtn) {
        messageModalCloseBtn.addEventListener('click', hideMessageModal);
    }

    // Open cart modal
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartModal.classList.remove('hidden');
        });
    }

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.classList.add('hidden');
        }
        if (event.target === checkoutModal) {
            checkoutModal.classList.add('hidden');
        }
        if (event.target === messageModal) {
            messageModal.classList.add('hidden');
        }
    });

    // Add to cart
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = e.target.dataset.name;
            const productPrice = parseFloat(e.target.dataset.price);

            const existingItem = cart.find(item => item.name === productName);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ name: productName, price: productPrice, quantity: 1 });
            }
            updateCartDisplay();
            updateCartBadge();
            showMessageModal('Produk Ditambahkan', `${productName} telah ditambahkan ke keranjang.`);
        });
    });

    // Update cart display in modal
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-600 text-center">Keranjang Anda kosong.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item', 'flex', 'justify-between', 'items-center', 'py-2', 'border-b', 'border-gray-200');
                itemElement.innerHTML = `
                    <div class="item-details flex-grow">
                        <span class="font-semibold text-gray-800">${item.name}</span>
                        <span class="text-gray-600 text-sm"> (Rp ${item.price.toLocaleString('id-ID')})</span>
                    </div>
                    <div class="item-quantity flex items-center">
                        <input type="number" value="${item.quantity}" min="1" data-index="${index}" class="w-16 px-2 py-1 border border-gray-300 rounded-md text-center quantity-input">
                        <button class="remove-item-btn bg-red-500 text-white px-3 py-1 rounded-md ml-2" data-index="${index}">Hapus</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.price * item.quantity;
            });
        }

        cartTotalSpan.textContent = `Rp ${total.toLocaleString('id-ID')}`;
        attachCartItemListeners(); // Re-attach listeners after updating display
    }

    // Attach listeners for quantity change and remove buttons
    function attachCartItemListeners() {
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const newQuantity = parseInt(e.target.value);
                if (newQuantity > 0) {
                    cart[index].quantity = newQuantity;
                } else {
                    cart.splice(index, 1); // Remove if quantity is 0 or less
                }
                updateCartDisplay();
                updateCartBadge();
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                cart.splice(index, 1);
                updateCartDisplay();
                updateCartBadge();
            });
        });
    }

    // Update cart badge count
    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        if (totalItems > 0) {
            cartBadge.classList.remove('hidden');
        } else {
            cartBadge.classList.add('hidden');
        }
    }

    // Clear cart
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            updateCartDisplay();
            updateCartBadge();
            showMessageModal('Keranjang Dikosongkan', 'Semua item telah dihapus dari keranjang.');
        });
    }

    // Proceed to checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showMessageModal('Keranjang Kosong', 'Silakan tambahkan produk ke keranjang sebelum checkout.');
                return;
            }
            cartModal.classList.add('hidden');
            checkoutModal.classList.remove('hidden');
        });
    }

    // Payment method selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('selected', 'border-indigo-500', 'bg-indigo-50'));
            option.classList.add('selected', 'border-indigo-500', 'bg-indigo-50');
            paymentMethodInput.value = option.dataset.method;
        });
    });

    // Checkout form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const shippingName = document.getElementById('shipping-name').value;
            const shippingAddress = document.getElementById('shipping-address').value;
            const shippingPhone = document.getElementById('shipping-phone').value;
            const paymentMethod = paymentMethodInput.value;

            if (!paymentMethod) {
                showMessageModal('Pembayaran Belum Dipilih', 'Mohon pilih metode pembayaran.');
                return;
            }

            let orderSummary = `Ringkasan Pesanan:\n\n`;
            let totalAmount = 0;

            cart.forEach(item => {
                orderSummary += `- ${item.name} x ${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
                totalAmount += item.price * item.quantity;
            });

            orderSummary += `\nTotal Pembayaran: Rp ${totalAmount.toLocaleString('id-ID')}\n`;
            orderSummary += `Metode Pembayaran: ${paymentMethod}\n`;
            orderSummary += `\nInformasi Pengiriman:\n`;
            orderSummary += `Nama: ${shippingName}\n`;
            orderSummary += `Alamat: ${shippingAddress}\n`;
            orderSummary += `Telepon: ${shippingPhone}\n`;
            orderSummary += `\nSilakan lakukan pembayaran sesuai instruksi yang diberikan.\n`;
            orderSummary += `Pesanan akan diproses setelah pembayaran dikonfirmasi.\n`;
            orderSummary += `\nTerima kasih telah berbelanja di KUSWITA SARUTA!`;

            showMessageModal('Pesanan Dikonfirmasi!', orderSummary);

            // Clear cart and close modal
            cart = [];
            updateCartDisplay();
            updateCartBadge();
            checkoutModal.classList.add('hidden');
            checkoutForm.reset(); // Reset form fields
            paymentOptions.forEach(opt => opt.classList.remove('selected', 'border-indigo-500', 'bg-indigo-50')); // Deselect payment option
            paymentMethodInput.value = ''; // Clear hidden input
        });
    }

    // Contact form functionality
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            // const phone = document.getElementById('phone').value; // Not used in message, but can be included
            // const message = document.getElementById('message').value; // Not used in message, but can be included

            showMessageModal('Pesan Terkirim!', `Terima kasih ${name}! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda di ${email}.`);

            // Reset form
            this.reset();
        });
    }

    // Initialize cart display on load
    updateCartDisplay();
    updateCartBadge();
});
