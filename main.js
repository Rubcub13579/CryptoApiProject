"use strict";

(() => {

    const coinsContainer = document.getElementById("coinsContainer");
    const searchInput = document.getElementById("searchInput");



    loadLocalStorage();


    async function createCoinsArray() {
        const coinArray = []
        let id = 0;

        const coins = await getCoinsData();
        for (const c of coins) {

            const coinId = id++
            const coinName = c.id;
            const coinSymbol = c.symbol.toUpperCase();
            const coinImage = c.image;


            coinArray.push({ coinId, coinName, coinSymbol, coinImage })


        }

        return coinArray;

    }


    function displayCoins(allCoins) {

        coinsContainer.innerHTML = ``;
        let coins = allCoins;

        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];

            // Create the HTML structure for each coin
            const coinDiv = document.createElement("div");
            coinDiv.classList.add("coinDiv", "form-switch", "position-relative", "border", "rounded", "p-3", "mb-3");
            coinDiv.id = `coinDiv${coin.coinId}`;

            // Add the HTML content inside the coinDiv
            coinDiv.innerHTML += `
            <input class="form-check-input position-absolute top-0 end-0 m-2" type="checkbox" role="switch" id="flexSwitchCheckDefault${coin.coinId}">
            <img src="${coin.coinImage}" height="45" class="me-2">
            <b class="me-2">${coin.coinSymbol}</b>
            <span class="me-2">${coin.coinName}</span>
            <button class="infoButton btn btn-sm btn-primary mt-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample${coin.coinId}"
                aria-expanded="false" aria-controls="collapseExample${coin.coinId}">More Info</button>
            <div class="collapse mt-2" id="collapseExample${coin.coinId}">
                <div class="card card-body" id="coinPriceDiv${coin.coinId}"></div>
            </div>
        `;

            // Find the "More Info" button inside this coin div and add event listener
            const infoButton = coinDiv.querySelector("button");
            infoButton.addEventListener("click", () => moreInfo(coin.coinId));

            // Append the coin div to the container
            coinsContainer.appendChild(coinDiv);
        }
    }


    async function moreInfo(id) {

        const currentPrice = await getCoinsPrice(id);


        if (currentPrice) {

            const coinPriceDiv = document.getElementById("coinPriceDiv" + id);
            coinPriceDiv.innerHTML =
                `
            <b>
            Dollar: ${currentPrice.usd}
            <br>
            Euro: ${currentPrice.euro}
            <br>
            Ils: ${currentPrice.ils}
            </b>
            
            `
        }

        else {
            const coinPriceDiv = document.getElementById("coinPriceDiv" + id);
            coinPriceDiv.innerHTML =
                `
            <b>
                No Data. 
                <br>
                Sorry ☹
            </b>
            
            `
        };


    }


    async function getCoinsPrice(id) {

        try {
            const usdUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
            const euroUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur";
            const ilsUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=ils";

            // const usdUrl = "jsons/coins.json";
            // const euroUrl = "jsons/europrice.json";
            // const ilsUrl = "jsons/ilsprice.json";

            const responseUsd = await axios.get(usdUrl);
            const responseEuro = await axios.get(euroUrl);
            const responseIls = await axios.get(ilsUrl);



            const coinsU = responseUsd.data;
            const coinsE = responseEuro.data;
            const coinsI = responseIls.data;



            const priceInUsd = coinsU[id].current_price;
            const priceInEuro = coinsE[id].current_price;
            const priceInIls = coinsI[id].current_price;


            const currentPrice = { usd: priceInUsd, euro: priceInEuro, ils: priceInIls }





            return currentPrice;
        }
        catch (err) {
            alert("Too many requests. Try Again Later.");
            return null;
        }

    }



    async function getCoinsData() {

        const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";


        // const url = "jsons/coins.json"
        const response = await axios.get(url);
        const coins = response.data;
        return coins;

    }


    function saveCoinsData(allCoins) {

        const data = allCoins;
        const json = JSON.stringify(data);
        localStorage.setItem("allCoins", json);


    }


    async function loadLocalStorage() {

        let json = localStorage.getItem("allCoins");
        let data = JSON.parse(json);



        if (!json) {
            try {
                const allCoins = await createCoinsArray();
                saveCoinsData(allCoins);
                loadLocalStorage();
            }
            catch (err) {
                alert("The server is not responding");
                return;
            }
        }


        if (json)
            displayCoins(data);

    }

    // ------------------------------------



    searchInput.addEventListener("input", function () {


        const json = localStorage.getItem("allCoins");
        const coins = JSON.parse(json);


        const searchValue = searchInput.value.toLowerCase()

        const coinArray = [];

        for (const c of coins) {

            if (c.coinName.toLowerCase().includes(searchValue) || c.coinSymbol.toLowerCase().includes(searchValue)) {
                const coinId = c.coinId;
                const coinName = c.coinName;
                const coinSymbol = c.coinSymbol;
                const coinImage = c.coinImage;

                coinArray.push({ coinId, coinName, coinSymbol, coinImage });

            }
        }
        
        if (coinArray.length === 0 && searchValue.trim() !== "") {
            coinsContainer.innerHTML = `
            <b>No Coins Are Found</b>
            `;
            return;
        }

        displayCoins(coinArray);

    })





})();
