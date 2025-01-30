window.onload = async function () {
    const selectedCoinsJSON = localStorage.getItem("selectedCoins");
    const selectedCoins = JSON.parse(selectedCoinsJSON);

    
    
    if (selectedCoinsJSON === null || selectedCoinsJSON === "[]"){
        alert("No coins selected! Please select a coin");
        window.location.replace("index.html")
        return
    }

    // Chart configuration
    let options = {
        exportEnabled: true,
        animationEnabled: true,
        title: {
            text: "Crypto Coin Price"
        },
        subtitles: [{
            text: "Click Legend to Hide or Unhide Data Series"
        }],
        axisX: {
            title: "Time",
            valueFormatString: "HH:mm:ss",  // Added time format
            labelFormatter: function (e) {
                return e.value.toLocaleTimeString();  // Format x-axis labels
            }
        },
        axisY: {
            title: "1 Coin in USD",
            titleFontColor: "#228b22",
            lineColor: "#228b22",
            labelFontColor: "#228b22",
            tickColor: "#228b22"
        },
        toolTip: {
            shared: true,
            contentFormatter: function (e) {  // Format tooltip time
                let content = "Time: " + e.entries[0].dataPoint.x.toLocaleTimeString() + "<br/>";
                for (let entry of e.entries) {
                    content += entry.dataSeries.name + ": $" + entry.dataPoint.y.toFixed(2) + "<br/>";
                }
                return content;
            }
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
        },
        data: []
    };

    // Rest of the code remains the same
    const initialCoins = await getCoinData();
    initializeChartSeries(initialCoins);

    $("#chartContainer").CanvasJSChart(options);

    startDataCollection();

    async function getCoinData() {
        try {
            // const url = "coins.json" // for testing if there's fetch error
            const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
            const response = await fetch(url);
            const coins = await response.json();
            return coins;
        } catch (error) {
            
            console.log("Error fetching coin data:");
            return null;
        }
    }

    function initializeChartSeries(coins) {
        if (!coins) return;

        for (const s of selectedCoins) {
            const content = {
                type: "spline",
                name: coins[s].id,
                showInLegend: true,
                xValueType: "dateTime",  // Specify that x values are dates
                dataPoints: []
            };
            options.data.push(content);
        }
    }

    function startDataCollection() {
        const intervalId = setInterval(async () => {
            try {
                const coins = await getCoinData();

                if (!coins) {
                    clearInterval(intervalId);
                    return;
                }

                const currentTime = new Date();

                selectedCoins.forEach((s, index) => {
                    const coinPrice = coins[s].current_price;
                    options.data[index].dataPoints.push({
                        x: currentTime,
                        y: coinPrice
                    });
                });

                $("#chartContainer").CanvasJSChart().render();

            } catch (error) {
                console.error("Error updating chart:", error);
                clearInterval(intervalId);
            }
        }, 2000);
    }

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }
};