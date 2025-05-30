import { db, auth, FieldValue } from '../data/firebaseConfig.js';

async function retryFetch(url, options, maxTries = 3, delay = 500) {
    let lastError;
    for (let i = 0; i < maxTries; i++) {
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unknown error');
            return data;
        } catch (err) {
            lastError = err;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}

function extractPriceDetails(priceStr = '') {
    const currencyMatch = priceStr.match(/[$€£₦]/);
    const currencySymbol = currencyMatch ? currencyMatch[0] : '$';

    const currencyMap = {
        '$': 'USD',
        '€': 'EUR',
        '£': 'GBP',
        '₦': 'NGN',
    };

    const numeric = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    const currency = currencyMap[currencySymbol] || 'USD';

    return { numeric, currency };
}

function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(value);
}

export function createWishlistCard(item) {
    const card = document.createElement('div');
    // card.className = 'card aspect-square w-auto min-h-[15rem] h-[15rem] border border-mercury-300 mb-[0.25rem] rounded-md p-2 flex flex-col gap-y-2 overflow-hidden bg-white relative';
    card.className = 'card aspect-square w-[calc(100%/3)] h-auto border border-mercury-300 mb-[0.25rem] rounded-md p-2 flex flex-col gap-y-2 overflow-hidden bg-white relative';

    const formattedPrice = formatCurrency(item.price, item.currency);
    const paid = typeof item.paidFor === 'number' ? item.paidFor : 0;
    const price = typeof item.price === 'number' && item.price > 0 ? item.price : 1;
    const progress = Math.min((paid / price) * 100, 100).toFixed(1);
    const formattedPaid = formatCurrency(paid, item.currency);
    const formattedRemaining = formatCurrency(item.price - paid, item.currency);

    card.innerHTML = `
    <button title="Remove" class="delete-wishlist-item absolute top-1 right-1 bg-cinnabar-600 text-cinnabar-50 rounded-sm p-1 cursor-pointer z-30 hover:bg-cinnabar-700">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
        <path fill="currentColor" d="M7.616 20q-.667 0-1.141-.475T6 18.386V6h-.5q-.213 0-.356-.144T5 5.499t.144-.356T5.5 5H9q0-.31.23-.54t.54-.23h4.46q.31 0 .54.23T15 5h3.5q.213 0 .356.144t.144.357t-.144.356T18.5 6H18v12.385q0 .666-.475 1.14t-1.14.475zM17 6H7v12.385q0 .269.173.442t.443.173h8.769q.269 0 .442-.173t.173-.442zm-6.692 11q.213 0 .357-.144t.143-.356v-8q0-.213-.144-.356T10.307 8t-.356.144t-.143.356v8q0 .213.144.356q.144.144.356.144m3.385 0q.213 0 .356-.144t.143-.356v-8q0-.213-.144-.356Q13.904 8 13.692 8q-.213 0-.357.144t-.143.356v8q0 .213.144.356t.357.144M7 6v13z" stroke-width="0.25" stroke="currentColor" />
      </svg>
    </button>
    <img src="${item.image}" alt="Product Image" class="w-full h-full object-cover rounded-md" />
    <div class="absolute w-[calc(100%-0.5rem)] p-2 bg-white bottom-1 left-1 flex flex-col gap-y-2 rounded-md">
      <div class="flex flex-row justify-between">
        <div class="text-woodsmoke-950 font-bold text-lg leading-none">${formattedPrice}</div>
        <a href="${item.link}" target="_blank" class="text-xs text-pizza-600 underline">${item.marketplace}.com</a>
      </div>
      <div class="wishlist-item-paid-progress-bar-wrapper w-full h-auto flex flex-col gap-y-2">
        <div class="wishlist-item-paid-progress-bar-container w-full h-1 bg-pizza-50 rounded-full">
          <div class="wishlist-item-paid-progress-bar w-auto h-1 bg-pizza-600 rounded-full" style="width: ${progress}%; max-width: 100%; transition: width 0.3s ease-in-out;"></div>
        </div>
        <div class="wishlist-item-paid-data-container w-full h-auto flex flex-row justify-between text-[0.75rem] text-woodsmoke-400">
          <div class="wishlist-item-paid-for-container">
            <span class="wishlist-item-paid-for-amount font-bold">${formattedPaid}</span>
            <span class="italic"> paid for</span>
          </div>
          <div class="wishlist-item-paid-remaining-container">
            <span class="wishlist-item-paid-remaining-amount font-bold">${formattedRemaining}</span>
            <span class="italic"> left</span>
          </div>
        </div>
      </div>
    </div>
  `;

    card.setAttribute('title', `${item.title}`);

    const deleteBtn = card.querySelector('.delete-wishlist-item');

    deleteBtn?.addEventListener('click', async () => {
        const confirmed = window.confirm("Remove this item from your wishlist?");
        if (!confirmed) return;

        const originalBtnHTML = deleteBtn.innerHTML;
        const loaderSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                                <circle cx="4" cy="12" r="3" fill="currentColor" stroke-width="0.25" stroke="currentColor">
                                    <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3" />
                                </circle>
                                <circle cx="12" cy="12" r="3" fill="currentColor" stroke-width="0.25" stroke="currentColor">
                                    <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3" />
                                </circle>
                                <circle cx="20" cy="12" r="3" fill="currentColor" stroke-width="0.25" stroke="currentColor">
                                    <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3" />
                                </circle>
                            </svg>`;

        try {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = loaderSVG;

            const user = auth.currentUser;
            if (!user) throw new Error("Not authenticated");

            await db.collection('users').doc(user.uid).update({
                wishlist: FieldValue.arrayRemove(item)
            });

            await refreshWishlistUI(); // reflow the grid
        } catch (err) {
            console.error("❌ Failed to delete wishlist item:", err.message);
            alert("Couldn't delete this item. Try again.");
            deleteBtn.innerHTML = originalBtnHTML;
            deleteBtn.disabled = false;
        }
    });



    return card;
}

export function appendToWishlistGrid(card) {
    const wishlistGrid = document.getElementById('account-wishlist-grid');
    if (!wishlistGrid) return;

    let rows = wishlistGrid.querySelectorAll('.wishlist-row');
    let lastRow = rows[rows.length - 1];

    if (!lastRow || lastRow.children.length >= 3) {
        lastRow = document.createElement('div');
        lastRow.className = 'wishlist-row';
        wishlistGrid.appendChild(lastRow);
    }

    lastRow.appendChild(card);
}

export function initWishlistInputWatcher() {
    const input = document.getElementById('wishlist-input');
    const btn = document.getElementById('wishlist-parse-link-btn');
    const dropdown = document.getElementById('marketplace');
    const loaderSVG = document.querySelector('#loading-window svg')?.outerHTML || '<span>Loading...</span>';
    const originalBtnHTML = btn.innerHTML;

    if (!input || !btn || !dropdown) return;

    input.addEventListener('input', () => {
        const trimmed = input.value.trim();
        btn.disabled = trimmed.length === 0;
        btn.classList.toggle('opacity-50', trimmed.length === 0);
        btn.classList.toggle('cursor-not-allowed', trimmed.length === 0);
        btn.classList.toggle('cursor-pointer', trimmed.length > 0);
    });

    btn.addEventListener('click', async () => {
        const url = input.value.trim();
        const marketplace = dropdown.value;

        if (!url) return alert('Please paste a link before fetching.');

        btn.disabled = true;
        btn.innerHTML = loaderSVG;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        btn.classList.remove('cursor-pointer');

        try {
            const apiData = await retryFetch('http://localhost:3000/api/parse-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, marketplace }),
            });

            const { numeric: price, currency } = extractPriceDetails(apiData.price);

            const itemData = {
                title: apiData.title,
                image: apiData.image,
                link: apiData.link,
                marketplace,
                price,
                currency,
                paidFor: 0,
                addedAt: firebase.firestore.Timestamp.now() // ✅ allowed inside arrayUnion
            };


            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");

            const doc = await db.collection('users').doc(user.uid).get();
            const data = doc.data();

            const limits = data.accountTiers?.max?.wishlist || { count: 9, value: 4000 };
            const existingWishlist = data?.wishlist || [];

            if (existingWishlist.length >= limits.count) {
                alert(`You can only have ${limits.count} items in your wishlist. Remove one before adding another.`);
                resetButtonUI(btn, originalBtnHTML);
                return;
            }

            const subtotal = existingWishlist.reduce((sum, item) => sum + (item.price || 0), 0);
            const newTotal = subtotal + price;

            if (newTotal > limits.value) {
                const formattedTotal = formatCurrency(newTotal, currency);
                const formattedLimit = formatCurrency(limits.value, currency);

                alert(`Your item was not added because the limit for the wishlist subtotal would have been reached. Please consider upgrading.`);
                resetButtonUI(btn, originalBtnHTML);
                return;
            }

            await db.collection('users').doc(user.uid).update({
                wishlist: FieldValue.arrayUnion(itemData)
            });

            const card = createWishlistCard(itemData);
            appendToWishlistGrid(card);

            await refreshWishlistUI();
        } catch (err) {
            alert('❌ Could not parse product link: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalBtnHTML;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            btn.classList.add('cursor-pointer');
        }
    });
}

export async function refreshWishlistUI() {
    const user = auth.currentUser;
    if (!user) return;

    const doc = await db.collection('users').doc(user.uid).get();
    const data = doc.data();
    const wishlistGrid = document.getElementById('account-wishlist-grid');
    if (!wishlistGrid) return;

    // Clear the grid
    wishlistGrid.innerHTML = '';

    const wishlist = data?.wishlist || [];

    wishlist.forEach(item => {
        const card = createWishlistCard(item);
        appendToWishlistGrid(card);
    });

    const limits = data.accountTiers?.max?.wishlist || { count: 9, value: 4000 };
    updateWishlistInfoDisplay(wishlist, limits);
}

export function updateWishlistInfoDisplay(wishlist = [], limits = { count: 9, value: 4000 }) {
    const subtotalInfo = document.getElementById('wishlist-subtotal-info');
    const subtotalInfoMax = document.getElementById('wishlist-subtotal-info-max');
    const countInfo = document.getElementById('wishlist-count-info');
    const countInfoMax = document.getElementById('wishlist-count-info-max');

    const count = wishlist.length;
    const subtotal = wishlist.reduce((sum, item) => sum + (item.price || 0), 0);
    const currency = wishlist[0]?.currency || 'USD';

    if (countInfo) {
        countInfo.textContent = `${count} item(s)`;
        countInfoMax.textContent = `out of ${limits.count}`;
    }

    if (subtotalInfo) {
        const formattedSubtotal = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(subtotal);

        const formattedLimit = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(limits.value);

        subtotalInfo.textContent = `${formattedSubtotal}`;
        subtotalInfoMax.textContent = `out of ${formattedLimit}`;
    }
}

function resetButtonUI(button, originalHTML) {
    button.disabled = false;
    button.innerHTML = originalHTML;
    button.classList.remove('opacity-50', 'cursor-not-allowed');
    button.classList.add('cursor-pointer');
}
