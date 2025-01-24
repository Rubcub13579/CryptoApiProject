"use strict";


const coinsContainer = document.getElementById("coinsContainer");
const searchInput = document.getElementById("searchInput");



let allCoins = [];
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


async function displayCoins(allCoins) {

    let coins = await allCoins
    for (let i = 0; i < coins.length; i++) {

        const coin = coins[i];
        coinsContainer.innerHTML +=
            `
            <div class="form-check form-switch" id="coinDiv${coin.coinId}">
            <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault${coin.coinId}">
            <img src="${coin.coinImage}" height = 45>
            <b>${coin.coinSymbol}</b>
            <span>${coin.coinName}</span>
            <button onclick="moreInfo(${coin.coinId})" class="infoButton" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample${coin.coinId}"
            aria-expanded="false" aria-controls="collapseExample${coin.coinId}">More Info</button>
            
            
            <div class="collapse" id="collapseExample${coin.coinId}">
                <div class="card card-body" id="coinPriceDiv${coin.coinId}">
                
                

                </div>
            </div>
            
            </div>

            
            `

    }


}


async function moreInfo(id) {

    
    const currentPrice = await getCoinsPrice(id);

    
    
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


async function getCoinsPrice(id) {

    
    

    // const usdUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
    // const euroUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur";
    // const ilsUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=ils";
    
    const usdUrl = "jsons/coins.json";
    const euroUrl = "jsons/europrice.json";
    const ilsUrl = "jsons/ilsprice.json";

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



async function getCoinsData() {

    // const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";


    const tempUrl = "jsons/coins.json"
    const response = await axios.get(tempUrl);
    const coins = response.data;
    return coins;

}


async function saveCoinsData(allCoins) {

    const data = await allCoins;
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



