"use strict";

(() => {
    const maxAmount = 5;

    const coinsContainer = document.getElementById("coinsContainer");
    const searchInput = document.getElementById("searchInput");
    const clearCoins = document.getElementById("clearCoins");

    let selectedCoins = new Set();
    let allCoinsData = [];

    const modalHTML = `
        <div class="modal fade" id="coinSelectionModal" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalLabel">Manage Selected Coins</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>You can select up to 5 coins. Please choose which coins to keep:</p>
                        <div id="modalCoinsList"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveSelectionBtn">Save Selection</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const selectionModal = new bootstrap.Modal(document.getElementById('coinSelectionModal'));
    const modalCoinsList = document.getElementById('modalCoinsList');
    const saveSelectionBtn = document.getElementById('saveSelectionBtn');

    loadLocalStorage();

    async function createCoinsArray() {
        try {
            const coins = await getCoinsData();
            return coins.map((c, index) => ({
                coinId: index,
                coinName: c.id,
                coinSymbol: c.symbol.toUpperCase(),
                coinImage: c.image
            }));
        } catch (error) {
            console.error("Error creating coins array:", error);
            return [];
        }
    }

    function displayCoins(allCoins) {
        coinsContainer.innerHTML = allCoins.length ?
            allCoins.map(coin => createCoinHTML(coin)).join('') :
            '<b>No Coins Found</b>';

        // Reattach event listeners
        attachEventListeners(allCoins);
    }

    function createCoinHTML(coin) {
        return `
            <div class="coinDiv form-switch position-relative border rounded p-3 mb-3" id="coinDiv${coin.coinId}">
                <input class="form-check-input position-absolute top-0 end-0 m-2" 
                    type="checkbox" role="switch" 
                    id="flexSwitchCheckDefault${coin.coinId}"
                    ${selectedCoins.has(coin.coinId) ? 'checked' : ''}>
                <img src="${coin.coinImage}" height="45" class="me-2" alt="${coin.coinSymbol}">
                <b class="me-2">${coin.coinSymbol}</b>
                <span class="me-2">${coin.coinName}</span>
                <button class="infoButton btn btn-sm btn-primary mt-2" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapseExample${coin.coinId}"
                    aria-expanded="false">
                    More Info
                </button>
                <div class="collapse mt-2" id="collapseExample${coin.coinId}">
                    <div class="card card-body" id="coinPriceDiv${coin.coinId}"></div>
                </div>
            </div>
        `;
    }

    function showSelectionModal(newCoinId) {
        const currentlySelected = [...selectedCoins];
        const coinsToShow = [...currentlySelected, newCoinId];

        modalCoinsList.innerHTML = coinsToShow.map(coinId => {
            const coin = allCoinsData.find(c => c.coinId === coinId);
            if (!coin) return '';

            return `
                <div class="form-check mb-2">
                    <input class="form-check-input modal-coin-checkbox" 
                        type="checkbox" 
                        value="${coin.coinId}" 
                        id="modalCoin${coin.coinId}" 
                        ${currentlySelected.includes(coin.coinId) ? 'checked' : ''}>
                    <label class="form-check-label" for="modalCoin${coin.coinId}">
                        <img src="${coin.coinImage}" height="25" class="me-2" alt="${coin.coinSymbol}">
                        ${coin.coinSymbol} - ${coin.coinName}
                    </label>
                </div>
            `;
        }).join('');

        selectionModal.show();
    }

    saveSelectionBtn.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('.modal-coin-checkbox:checked');
        const newSelection = new Set(Array.from(selectedCheckboxes).map(cb => parseInt(cb.value)));

        if (newSelection.size <= maxAmount) {
            selectedCoins = newSelection;
            saveSelectedCoins();
            displayCoins(allCoinsData);
            selectionModal.hide();
        } else {
            alert(`Please select no more than ${maxAmount} coins`);
        }
    });

    function attachEventListeners(coins) {
        coins.forEach(coin => {
            const coinDiv = document.getElementById(`coinDiv${coin.coinId}`);
            if (!coinDiv) return;

            const infoButton = coinDiv.querySelector('.infoButton');
            const checkbox = coinDiv.querySelector('input[type="checkbox"]');

            infoButton?.addEventListener('click', () => moreInfo(coin.coinId));
            checkbox?.addEventListener('change', () => handleCoinSelection(coin.coinId, checkbox));
        });
    }


    // ... (previous code remains the same until the moreInfo function)

    async function moreInfo(coinId) {
        const priceDiv = document.getElementById(`coinPriceDiv${coinId}`);
        if (!priceDiv) return;

        // Get the first coin's image from our data
        const firstCoinImage = allCoinsData[0]?.coinImage || '';

        // Show loading spinner with coin image
        priceDiv.innerHTML = `
        <div class="spinner-container">
            <div class="custom-spinner">
                <img src="${firstCoinImage}" alt="Loading" class="spinner-image">
            </div>
        </div>
    `;

        try {
            const prices = await getCoinsPrice(coinId);
            if (!prices) throw new Error('No price data available');

            priceDiv.innerHTML = `
            <b>
                Dollar: $${prices.usd.toFixed(2)}
                <br>
                Euro: €${prices.euro.toFixed(2)}
                <br>
                ILS: ₪${prices.ils.toFixed(2)}
            </b>
        `;
        } catch (error) {
            priceDiv.innerHTML = `
            <b>
                No Data Available
                <br>
                Please try again later ☹
            </b>
        `;
        }
    }

    async function getCoinsPrice(id) {
        try {
            const responses = await Promise.all([
                axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"),
                axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur"),
                axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=ils")
            ]);

            const [usdData, euroData, ilsData] = responses.map(response => response.data);

            return {
                usd: usdData[id].current_price,
                euro: euroData[id].current_price,
                ils: ilsData[id].current_price
            };
        } catch (error) {
            console.error("Error fetching prices:", error);
            return null;
        }
    }

    async function getCoinsData() {
        try {
            const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd");
            return response.data;
        } catch (error) {
            console.error("Error fetching coin data:", error);
            throw error;
        }
    }

    function handleCoinSelection(coinId, checkbox) {
        if (checkbox.checked) {
            if (selectedCoins.size >= maxAmount) {
                checkbox.checked = false;
                showSelectionModal(coinId);
                return;
            }
            selectedCoins.add(coinId);
        } else {
            selectedCoins.delete(coinId);
        }

        saveSelectedCoins();
    }

    function saveSelectedCoins() {
        localStorage.setItem("selectedCoins", JSON.stringify([...selectedCoins]));
    }

    function loadSelectedCoins() {
        const saved = localStorage.getItem("selectedCoins");
        if (saved) {
            selectedCoins = new Set(JSON.parse(saved));
        }
    }

    searchInput.addEventListener("input", () => {
        const searchValue = searchInput.value.toLowerCase().trim();

        const filteredCoins = searchValue ?
            allCoinsData.filter(coin =>
                coin.coinName.toLowerCase().includes(searchValue) ||
                coin.coinSymbol.toLowerCase().includes(searchValue)
            ) : allCoinsData;

        displayCoins(filteredCoins);
    });

    async function loadLocalStorage() {
        loadSelectedCoins();

        try {
            let coins = JSON.parse(localStorage.getItem("allCoins"));

            if (!coins) {
                coins = await createCoinsArray();
                localStorage.setItem("allCoins", JSON.stringify(coins));
            }

            allCoinsData = coins;
            displayCoins(coins);
        } catch (error) {
            console.error("Error loading data:", error);
            coinsContainer.innerHTML = '<b>Error loading cryptocurrency data. Please try again later.</b>';
        }
    }

    clearCoins.addEventListener("click", () => {

        selectedCoins.clear();

        localStorage.removeItem("selectedCoins");

        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    
})();