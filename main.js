"use strict";


const coinsContainer = document.getElementById("coinsContainer");
const searchInput = document.getElementById("searchInput");


let allCoins = [];

async function createCoinsArray() {

    let id = 0;

    const coins = await getCoinsData();
    for (const c of coins) {

        const coinId = id++
        const coinName = c.id;
        const coinSymbol = c.symbol.toUpperCase();
        const coinImage = c.image;
        const coinDollarPrice = c.current_price;


        allCoins.push({ coinId, coinName, coinSymbol, coinImage, coinDollarPrice })


    }

    return allCoins;

}



async function displayCoins() {

    const coins = await createCoinsArray()

    for (let i = 0; i < coins.length; i++) {

        const coin = coins[i];
        coinsContainer.innerHTML +=
            `
            <div id="coinDiv${coin.coinId}">
            <img src="${coin.coinImage}" height = 45>
            <b>${coin.coinSymbol}</b>
            <span>${coin.coinName}</span>
            <button onclick="moreInfo(${coin.coinId})" class="infoButton">More Info</button>
            </div>
            `

    }


}


function moreInfo(id) {

    const coinDiv = document.getElementById("coinDiv" + id);

    //continue


    


}




async function getCoinsData() {

    // const Dollar url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=euro";
    // const Euro url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=euro";
    // const Ils url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=ils";

    const tempUrl = "coins.json"
    const response = await axios.get(tempUrl);
    const coins = response.data;
    return coins;

}



displayCoins();


