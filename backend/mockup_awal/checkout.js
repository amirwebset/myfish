const checkoutItems =
    document.getElementById(
        "checkoutItems"
    );


const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );


function displayCheckout() {

    const cart =
        getCart();


    if (cart.length === 0) {

        checkoutItems.innerHTML = `

            <div class="empty-mini">

                🛒

                <p>
                    Keranjang masih kosong.
                </p>

                <a href="produk.html">
                    Belanja sekarang
                </a>

            </div>

        `;

        checkoutTotal.textContent =
            "Rp0";

        return;

    }


    let total = 0;


    checkoutItems.innerHTML =
        cart.map(item => {

            const subtotal =
                item.price *
                item.quantity;


            total += subtotal;


            return `

                <div class="checkout-item">

                    <div>

                        <strong>
                            ${item.name}
                        </strong>

                        <small>
                            ${item.quantity} ×
                            ${formatRupiah(item.price)}
                        </small>

                    </div>


                    <strong>
                        ${formatRupiah(subtotal)}
                    </strong>

                </div>

            `;

        }).join("");


    checkoutTotal.textContent =
        formatRupiah(total);

}


// Submit form
document
    .getElementById("checkoutForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const cart =
                getCart();


            if (cart.length === 0) {

                showNotification(
                    "Keranjang masih kosong!",
                    "error"
                );

                return;

            }


            const name =
                document
                    .getElementById(
                        "customerName"
                    )
                    .value.trim();


            const phone =
                document
                    .getElementById(
                        "customerPhone"
                    )
                    .value.trim();


            const address =
                document
                    .getElementById(
                        "customerAddress"
                    )
                    .value.trim();


            const note =
                document
                    .getElementById(
                        "customerNote"
                    )
                    .value.trim();


            let total = 0;


            let message =
                "Halo FishShop! 👋\n\n";


            message +=
                "Saya ingin memesan:\n\n";


            cart.forEach(
                (item, index) => {

                    const subtotal =
                        item.price *
                        item.quantity;


                    total += subtotal;


                    message +=
                        `${index + 1}. ${item.name} x${item.quantity}\n`;

                    message +=
                        `   ${formatRupiah(subtotal)}\n\n`;

                }
            );


            message +=
                `Total: ${formatRupiah(total)}\n\n`;


            message +=
                `Nama: ${name}\n`;


            message +=
                `WhatsApp: ${phone}\n`;


            message +=
                `Alamat: ${address}\n`;


            if (note) {

                message +=
                    `Catatan: ${note}\n`;

            }


            // ==================================
            // GANTI NOMOR INI DENGAN NOMOR TOKO
            // ==================================

            const whatsappNumber =
                "6281234567890";


            const whatsappURL =
                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;


            window.open(
                whatsappURL,
                "_blank"
            );


            // Kosongkan keranjang
            localStorage.removeItem(
                "fishshop_cart"
            );


        }
    );


displayCheckout();

updateCartCount();