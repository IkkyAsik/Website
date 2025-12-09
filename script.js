// Data Keranjang disimpan di Local Storage agar tetap ada saat pindah halaman
let cart = [];

// Fungsi untuk memformat angka menjadi Rupiah (IDR)
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// 1. Load Cart dari Local Storage
function loadCart() {
    const savedCart = localStorage.getItem('studyShelfCart');
    cart = savedCart ? JSON.parse(savedCart) : [];
}

// 2. Save Cart ke Local Storage
function saveCart() {
    localStorage.setItem('studyShelfCart', JSON.stringify(cart));
}

// 3. Tambah E-book ke Keranjang (Dipanggil dari halaman detail)
function addToCart(ebookId, ebookName, ebookPrice) {
    loadCart();
    
    // Cek apakah item sudah ada di keranjang
    const existingItem = cart.find(item => item.id === ebookId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: ebookId,
            name: ebookName,
            price: ebookPrice,
            quantity: 1
        });
    }

    saveCart();
    console.log(`E-book ${ebookName} ditambahkan ke keranjang.`);
}

// Fungsi yang dipanggil oleh tombol "Beli Sekarang"
function addToCartAndRedirect() {
    const dataDiv = document.getElementById('ebook-data');
    if (!dataDiv) {
        alert("Terjadi kesalahan: Data e-book tidak ditemukan.");
        return;
    }

    const id = dataDiv.getAttribute('data-id');
    const name = dataDiv.getAttribute('data-name');
    const price = parseInt(dataDiv.getAttribute('data-price'));

    addToCart(id, name, price);
    
    // Redirect ke halaman checkout
    window.location.href = 'checkout.html';
}

// 4. Hitung Total Pembayaran
function calculateTotal() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const finalTotal = subtotal; 

    const subtotalEl = document.getElementById('subtotal');
    const finalTotalEl = document.getElementById('final-total-amount');
    const checkoutBtn = document.getElementById('checkout-button');

    if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
    if (finalTotalEl) finalTotalEl.textContent = formatRupiah(finalTotal);
    
    // Update teks tombol checkout
    if (checkoutBtn) {
        checkoutBtn.textContent = `Selesaikan Pembayaran ${formatRupiah(finalTotal)}`;
        // Nonaktifkan tombol jika keranjang kosong
        checkoutBtn.disabled = (finalTotal === 0);
    }
}

// 5. Render (Menampilkan) Item Keranjang di HTML
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    loadCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message" style="text-align: center; color: #6c757d;">Keranjang Anda kosong. Silakan kembali ke koleksi!</p>';
        calculateTotal();
        return;
    }

    let htmlContent = '';
    cart.forEach(item => {
        const subtotalItem = item.price * item.quantity;

        htmlContent += `
            <div class="cart-item" data-id="${item.id}" data-price="${item.price}">
                <div class="item-details">
                    <p class="nama-item">${item.name}</p>
                    <p class="item-price-unit">${formatRupiah(item.price)} / item</p>
                </div>
                <div class="item-controls">
                    <button class="qty-btn minus-btn" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" readonly class="item-qty" data-id="${item.id}">
                    <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
                </div>
                <div class="item-subtotal">
                    <p class="subtotal-amount">${formatRupiah(subtotalItem)}</p>
                </div>
                <button class="remove-item" data-id="${item.id}">&times;</button>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = htmlContent;
    
    // Attach event listeners setelah konten dirender
    attachEventListeners(); 
    calculateTotal();
}

// 6. Handle Perubahan Kuantitas (Plus/Minus)
function handleQuantityChange(event) {
    const button = event.target.closest('.qty-btn');
    if (!button) return;

    const itemId = button.getAttribute('data-id');
    const isPlus = button.classList.contains('plus-btn');

    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    // Tambahkan batas maksimum agar pembelian sangat besar bisa dilakukan (misalnya 99)
    const MAX_QUANTITY = 99;

    if (itemIndex > -1) {
        if (isPlus) {
            // Logika untuk menambah kuantitas, dengan batas maksimum 99
            if (cart[itemIndex].quantity < MAX_QUANTITY) { 
                cart[itemIndex].quantity += 1;
            } else {
                console.log(`Kuantitas maksimum (${MAX_QUANTITY}) telah tercapai.`);
                return;
            }
        } else if (cart[itemIndex].quantity > 1) {
            // Logika untuk mengurangi kuantitas
            cart[itemIndex].quantity -= 1; 
        } else {
             // Kuantitas minimum adalah 1.
            return;
        }
        
        saveCart();
        renderCart(); // Render ulang untuk update tampilan dan total
    }
}

// 7. Handle Hapus Item (Tombol &times;)
function handleRemoveItem(event) {
    const button = event.target.closest('.remove-item');
    if (!button) return;
    
    const itemId = button.getAttribute('data-id');
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    renderCart();
}

// 8. Attach Listeners (Memasang event click pada tombol)
function attachEventListeners() {
    const cartContainer = document.getElementById('cart-items');
    if (cartContainer) {
        cartContainer.addEventListener('click', handleQuantityChange);
        cartContainer.addEventListener('click', handleRemoveItem);
    }
}

// Inisialisasi (Jalankan saat dokumen dimuat)
document.addEventListener('DOMContentLoaded', () => {
    // Hanya jalankan render cart jika kita berada di halaman checkout
    if (document.getElementById('cart-items')) {
        renderCart(); 
    }
});