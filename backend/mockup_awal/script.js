// ========================================
// FIS HSHOP - SCRIPT UTAMA
// ========================================


// Format Rupiah
function formatRupiah(number) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);

}


// Ambil data keranjang
function getCart() {

    return JSON.parse(
        localStorage.getItem("fishshop_cart")
    ) || [];

}


// Simpan keranjang
function saveCart(cart) {

    localStorage.setItem(
        "fishshop_cart",
        JSON.stringify(cart)
    );

}


// Update jumlah keranjang
function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartCount =
        document.getElementById("cartCount");

    if (cartCount) {

        cartCount.textContent = count;

    }

}


// Tambah produk ke keranjang
function addToCart(id, quantity = 1) {

    const product =
        products.find(item => item.id === id);

    if (!product) return;


    let cart = getCart();

    const existing =
        cart.find(item => item.id === id);


    if (existing) {

        if (
            existing.quantity + quantity
            > product.stock
        ) {

            showNotification(
                "Jumlah melebihi stok!",
                "error"
            );

            return;

        }


        existing.quantity += quantity;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            emoji: product.emoji,

            quantity: quantity

        });

    }


    saveCart(cart);

    updateCartCount();

    showNotification(
        `${product.name} ditambahkan ke keranjang`,
        "success"
    );

}


// Notifikasi
function showNotification(message, type = "success") {

    const old =
        document.querySelector(".notification");

    if (old) {
        old.remove();
    }


    const notification =
        document.createElement("div");

    notification.className =
        `notification ${type}`;


    notification.innerHTML = `

        <span>
            ${type === "success" ? "✓" : "!"}
        </span>

        ${message}

    `;


    document.body.appendChild(notification);


    setTimeout(() => {

        notification.classList.add("hide");

        setTimeout(() => {
            notification.remove();
        }, 300);

    }, 2500);

}


// Mobile menu
function toggleMenu() {

    const nav =
        document.getElementById("mainNav");

    if (nav) {

        nav.classList.toggle("show");

    }

}


// Card produk
function productCard(product) {

    return `

        <div class="product-card">

            <div class="product-visual">

                <span>
                    ${product.emoji}
                </span>

            </div>


            <div class="product-info">

                <span class="product-category">
                    ${product.category}
                </span>


                <h3>
                    ${product.name}
                </h3>


                <div class="product-price">
                    ${formatRupiah(product.price)}
                </div>


                <div class="product-stock">
                    Stok: ${product.stock}
                </div>


                <div class="product-actions">

                    <a
                        href="detail.html?id=${product.id}"
                        class="detail-btn">

                        Detail

                    </a>


                    <button
                        class="cart-btn"
                        onclick="addToCart(${product.id})">

                        🛒

                    </button>

                </div>

            </div>

        </div>

    `;

}


// Produk unggulan
function displayFeaturedProducts() {

    const container =
        document.getElementById("featuredProducts");

    if (!container) return;


    const featured =
        products.slice(0, 4);


    container.innerHTML =
        featured
            .map(productCard)
            .join("");

}


// Jalankan saat halaman selesai
document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

        displayFeaturedProducts();

    }
);