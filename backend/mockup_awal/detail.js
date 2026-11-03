const params =
    new URLSearchParams(
        window.location.search
    );


const productId =
    Number(params.get("id"));


const product =
    products.find(
        item => item.id === productId
    );


const container =
    document.getElementById(
        "detailProduct"
    );


if (!product) {

    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                😢
            </div>

            <h2>
                Produk tidak ditemukan
            </h2>

            <br>

            <a
                href="produk.html"
                class="btn btn-primary">

                ← Kembali ke Produk

            </a>

        </div>

    `;

} else {


    container.innerHTML = `

        <div class="detail-card">


            <div class="detail-visual">

                <span>
                    ${product.emoji}
                </span>

            </div>


            <div class="detail-info">

                <span class="product-category">
                    ${product.category}
                </span>


                <h1>
                    ${product.name}
                </h1>


                <div class="detail-price">
                    ${formatRupiah(product.price)}
                </div>


                <div class="detail-stock">
                    ✓ Stok tersedia: ${product.stock}
                </div>


                <p class="detail-description">
                    ${product.description}
                </p>


                <div class="quantity-box">

                    <label>
                        Jumlah
                    </label>

                    <div class="quantity-input">

                        <button
                            onclick="decreaseQuantity()">
                            −
                        </button>

                        <input
                            type="number"
                            id="quantity"
                            min="1"
                            max="${product.stock}"
                            value="1">

                        <button
                            onclick="increaseQuantity()">
                            +
                        </button>

                    </div>

                </div>


                <button
                    onclick="addProductToCart()"
                    class="btn btn-primary full-btn">

                    🛒 Tambah ke Keranjang

                </button>


                <a
                    href="produk.html"
                    class="back-link">

                    ← Kembali ke Produk

                </a>

            </div>

        </div>

    `;

}


// Kurangi quantity
function decreaseQuantity() {

    const input =
        document.getElementById("quantity");

    let value =
        Number(input.value);


    if (value > 1) {

        input.value =
            value - 1;

    }

}


// Tambah quantity
function increaseQuantity() {

    const input =
        document.getElementById("quantity");

    let value =
        Number(input.value);


    if (value < product.stock) {

        input.value =
            value + 1;

    }

}


// Tambah produk
function addProductToCart() {

    const quantity =
        Number(
            document.getElementById(
                "quantity"
            ).value
        );


    if (
        quantity < 1 ||
        quantity > product.stock
    ) {

        showNotification(
            "Jumlah tidak valid!",
            "error"
        );

        return;

    }


    addToCart(
        product.id,
        quantity
    );

}