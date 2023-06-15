const cache = {};

async function getCryptoPrices(currency = 'usd') {
    if (
        cache.prices &&
        cache.timestamp &&
        Date.now() - cache.timestamp < 600000 &&
        cache.currency === currency
    ) {
        return cache.prices;
    }

    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,litecoin,tether&vs_currencies=${currency}`
        );
        const data = await response.json();

        cache.prices = data;
        cache.timestamp = Date.now();
        cache.currency = currency;

        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function getCryptoPriceHistory(cryptoId, currency, hours) {
    try {
        const now = new Date();
        const start = new Date(now);
        start.setHours(now.getHours() - hours);

        const startTimestamp = Math.floor(start.getTime() / 1000);
        const endTimestamp = Math.floor(now.getTime() / 1000);

        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart/range?vs_currency=${currency}&from=${startTimestamp}&to=${endTimestamp}`
        );
        const data = await response.json();

        const prices = data.prices.map(([timestamp, price]) => [new Date(timestamp), price]);
        return prices;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function updatePriceElements(prices, selectedCurrency) {
    const priceElements = document.querySelectorAll('[class$="__value"]');

    priceElements.forEach((element) => {
        const cryptocurrency = element.classList[0].split('__')[0];
        const price = prices[cryptocurrency][selectedCurrency];

        element.textContent = price + ' ' + selectedCurrency.toUpperCase();
    });
}

function updatePriceChart(cryptoId, hours, currency) {
    const chartContainer = document.getElementById('chart-container');

    const data = new google.visualization.DataTable();
    data.addColumn('date', 'Data');
    data.addColumn('number', 'Cena');

    const options = {
        title: 'Wykres historii cen',
        curveType: 'function',
        height: 400,
        legend: {
            position: 'none',
            textStyle: {
                color: '#343434',
            },
        },
        backgroundColor: '#343434',
        titleTextStyle: {
            color: '#fff',
            fontSize: 24,
            bold: true,
        },
        hAxis: {
            textStyle: {
                color: '#ccc',
            },
            gridlines: {
                color: '#444',
            },
            format: 'dd.MM-HH:mm',
        },
        vAxis: {
            textStyle: {
                color: '#ccc',
            },
            gridlines: {
                color: '#444',
            },
        },
        series: {
            0: { color: getLineColor(cryptoId) },
        },
        chartArea: {
            backgroundColor: {
                stroke: '#666',
                strokeWidth: 0,
            },
        },
        pointSize: 3,
        pointShapeType: 'circle',
    };

    getCryptoPriceHistory(cryptoId, currency, hours)
        .then((priceHistory) => {
            data.addRows(priceHistory);

            const chart = new google.visualization.LineChart(chartContainer);
            chart.draw(data, options);
        })
        .catch((error) => {
            console.error('Error:', error);
            chartContainer.innerHTML = '<h1>Przekroczono limit pobrań informacji z API</h1>';
        });
}

function getLineColor(cryptoId) {
    switch (cryptoId) {
        case 'bitcoin':
            return '#f89c2d';
        case 'ethereum':
            return '#8c8c8c';
        case 'litecoin':
            return '#345d9d';
        case 'tether':
            return '#50af95';
        case 'solana':
            return '#c436f4';
        default:
            return '#ff0000';
    }
}

function handleCurrencyChange() {
    updateCryptoPrices();
}

function handleCryptocurrencyChange() {
    updateCryptoPrices();
}

async function updateCryptoPrices() {
    const currencySelect = document.getElementById('currencySelect');
    const selectedCurrency = currencySelect.value;
    const prices = await getCryptoPrices(selectedCurrency);

    if (!prices) {
        return;
    }

    updatePriceElements(prices, selectedCurrency);

    const cryptocurrencySelect = document.getElementById('cryptocurrencySelect');
    const selectedCryptocurrency = cryptocurrencySelect.value;
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    const selectedTimeRange = parseInt(timeRangeSelect.value);

    updatePriceChart(selectedCryptocurrency, selectedTimeRange, selectedCurrency);
}

function handleTimeRangeChange() {
    const cryptocurrencySelect = document.getElementById('cryptocurrencySelect');
    const selectedCryptocurrency = cryptocurrencySelect.value;
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    const selectedTimeRange = parseInt(timeRangeSelect.value);
    const currencySelect = document.getElementById('currencySelect');
    const selectedCurrency = currencySelect.value;

    updatePriceChart(selectedCryptocurrency, selectedTimeRange, selectedCurrency);
}

function initGoogleCharts() {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(updateCryptoPrices);
}

document.addEventListener('DOMContentLoaded', initGoogleCharts);

const currencySelect = document.getElementById('currencySelect');
currencySelect.addEventListener('change', handleCurrencyChange);

const cryptocurrencySelect = document.getElementById('cryptocurrencySelect');
cryptocurrencySelect.addEventListener('change', handleCryptocurrencyChange);

const timeRangeSelect = document.getElementById('timeRangeSelect');
timeRangeSelect.addEventListener('change', handleTimeRangeChange);
