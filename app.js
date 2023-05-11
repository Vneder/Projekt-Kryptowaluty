const apiUrl = 'https://api.coingecko.com/api/v3';
const coins = [
    { id: 'bitcoin', class: 'bitcoin__value' },
    { id: 'solana', class: 'solana__value' },
    { id: 'ethereum', class: 'ethereum__value' },
    { id: 'tether', class: 'tether__value' },
    { id: 'litecoin', class: 'litecoin__value' }
];


coins.forEach((coin) => {
    fetch(`${apiUrl}/simple/price?ids=${coin.id}&vs_currencies=usd`)
        .then((response) => response.json())
        .then((data) => {
            const price = data[coin.id].usd;
            const priceElement = document.querySelector(`.${coin.class}`);
            priceElement.textContent = price;
        });
});