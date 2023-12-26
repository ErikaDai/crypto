document.addEventListener('DOMContentLoaded', function () {
    const url = 'https://api.coingecko.com/api/v3/coins/markets';
    const coins = ['bitcoin', 'solana', 'ethereum'];

    coins.forEach(coin => {
        fetch(`${url}?vs_currency=usd&ids=${coin}`)
            .then(response => response.json())
            .then(data => {
                fillTable(data[0]);
            })
            .catch(error => console.error('Error al obtener datos:', error));
    });

    // Cargar datos desde el almacenamiento local al cargar la página
    loadDataFromLocalStorage();

    const tableBody = document.getElementById('cryptoTableBody');

    tableBody.addEventListener('input', function (event) {
        const target = event.target;
        const row = target.closest('tr');
        if (row) {
            updateCalculations(row);
            
            // Guardar datos actualizados en el almacenamiento local al realizar cambios
            saveDataToLocalStorage();
        }
    });
});

function fillTable(coinData) {
    const tableBody = document.getElementById('cryptoTableBody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td>${coinData.name}</td>
        <td>${coinData.symbol}</td>
        <td contenteditable="true">0</td>
        <td>${coinData.current_price}</td>
        <td>0</td>
        <td contenteditable="true">0</td>
        <td>${coinData.market_cap}</td>
        <td>0</td>
        <td>0%</td>
    `;

    tableBody.appendChild(newRow);
}

function updateCalculations(row) {
    const cells = row.cells;
    const cantidad = parseFloat(cells[2].textContent);
    const precioActual = parseFloat(cells[3].textContent);
    const dolaresInvertidos = parseFloat(cells[5].textContent);

    cells[4].textContent = (cantidad * precioActual).toFixed(2); // Equivalente en Dólares
    cells[7].textContent = (cells[4].textContent - dolaresInvertidos).toFixed(2); // USDT Profit/Loss

    let totalDolares = 0;
    const allRows = document.getElementById('cryptoTableBody').querySelectorAll('tr');
    allRows.forEach(row => {
        totalDolares += parseFloat(row.cells[4].textContent);
    });

    allRows.forEach(row => {
        const porcentaje = (parseFloat(row.cells[4].textContent) * 100) / totalDolares;
        row.cells[8].textContent = porcentaje.toFixed(2) + '%';
    });
}

function saveDataToLocalStorage() {
    const tableBody = document.getElementById('cryptoTableBody');
    const data = [];

    // Recorrer todas las filas y guardar datos en el formato adecuado
    tableBody.querySelectorAll('tr').forEach(row => {
        const rowData = {
            cantidad: row.cells[2].textContent,
            dolaresInvertidos: row.cells[5].textContent
        };

        data.push(rowData);
    });

    // Guardar datos en el almacenamiento local
    localStorage.setItem('cryptoData', JSON.stringify(data));
}

function loadDataFromLocalStorage() {
    const tableBody = document.getElementById('cryptoTableBody');
    const data = JSON.parse(localStorage.getItem('cryptoData')) || [];

    // Actualizar celdas editables con datos cargados desde el almacenamiento local
    tableBody.querySelectorAll('tr').forEach((row, index) => {
        if (data[index]) {
            row.cells[2].textContent = data[index].cantidad;
            row.cells[5].textContent = data[index].dolaresInvertidos;
        }
    });
}
