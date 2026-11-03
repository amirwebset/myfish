const cartContainer =
    document.getElementById(
        "cartContainer"
    );


function renderCart() {

    const cart =
        getCart();


    if (cart.length === 0) {

        cartContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🛒
                </div>

                <h2>
                    Keranjang Masih Kosong
                </h2>

                <p>
                    Yuk pilih ikan favoritmu!
                </p>

                <br>

                <a
                    href="produk.html"
                    class="btn btn-primary">

                    Mulai Belanja →

                </a>

            </div>

        `;

        return;

    }


    let total = 0;

    let totalItems = 0;


    let html = `

        <div class="cart-layout">

            <div class="cart-items">

    `;


    cart.forEach(item => {

        const subtotal =
            item.price *
            item.quantity;


        total += subtotal;

        totalItems +=
            item.quantity;


        html += `

            <div class="cart-item">


                <div class="cart-product-icon">

                    ${item.emoji}

                </div>


                <div class="cart-item-info">

                    <span class="product-category">
                        Produk
                    </span>

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        ${formatRupiah(item.price)}
                    </p>


                    <div class="quantity-control">

                        <button
                            onclick="changeQuantity(${item.id}, -1)">
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="changeQuantity(${item.id}, 1)">
                            +
                        </button>

                    </div>

                </div>


                <div class="cart-subtotal">

                    <strong>
                        ${formatRupiah(subtotal)}
                    </strong>

                    <button
                        onclick="removeItem(${item.id})"
                        class="remove-btn">

                        🗑 Hapus

                    </button>

                </div>

            </div>

        `;

    });


    html += `

            </div>


            <div class="cart-summary">

                <h2>
                    Ringkasan
                </h2>


                <div class="summary-row">

                    <span>
                        Total Produk
                    </span>

                    <span>
                        ${totalItems}
                    </span>

                </div>


                <div class="summary-row">

                    <span>
                        Pengiriman
                    </span>

                    <span>
                        Menyesuaikan
                    </span>

                </div>


                <div class="summary-row total">

                    <span>
                        Total
                    </span>

                    <strong>
                        ${formatRupiah(total)}
                    </strong>

                </div>


                <a
                    href="checkout.html"
                    class="btn btn-primary full-btn">

                    Checkout →

                </a>


                <a
                    href="produk.html"
                    class="continue-shopping">

                    ← Lanjut Belanja

                </a>

            </div>

        </div>

    `;


    cartContainer.innerHTML =
        html;

}


// Ubah jumlah
function changeQuantity(
    id,
    amount
) {

    let cart =
        getCart();


    const item =
        cart.find(
            item => item.id === id
        );


    const product =
        products.find(
            product => product.id === id
        );


    if (!item) return;


    item.quantity += amount;


    if (
        product &&
        item.quantity > product.stock
    ) {

        item.quantity =
            product.stock;


        showNotification(
            "Stok maksimum tercapai.",
            "error"
        );

    }


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item => item.id !== id
            );

    }


    saveCart(cart);

    updateCartCount();

    renderCart();

}


// Hapus produk
function removeItem(id) {

    let cart =
        getCart();


    cart =
        cart.filter(
            item => item.id !== id
        );


    saveCart(cart);

    updateCartCount();

    renderCart();


    showNotification(
        "Produk dihapus dari keranjang.",
        "success"
    );

}


renderCart();