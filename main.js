// WHO Air quality guidelines (2021) in µg/m³
const WHO_GUIDELINES = {
    'PM2.5': { good: 5, moderate: 10, unhealthy: 25, very_unhealthy: 35 },
    'PM10': { good: 15, moderate: 30, unhealthy: 50, very_unhealthy: 70 },
    'NO2': { good: 10, moderate: 25, unhealthy: 50, very_unhealthy: 100 },
    'O3': { good: 50, moderate: 100, unhealthy: 150, very_unhealthy: 200 },
};

function getAirQualityLevel(pollutant, value) {
    const guidelines = WHO_GUIDELINES[pollutant];
    if (!guidelines || !value) return null;

    if (value <= guidelines.good) return 'good';
    if (value <= guidelines.moderate) return 'moderate';
    if (value <= guidelines.unhealthy) return 'unhealthy';
    if (value <= guidelines.very_unhealthy) return 'very-unhealthy';
    return 'hazardous';
}

async function fetchData() {
    try {
        const response = await fetch('https://valencia.opendatasoft.com/api/records/1.0/search/?dataset=estacions-contaminacio-atmosferiques-estaciones-contaminacion-atmosfericas&rows=100');
        const data = await response.json();
        displayData(data.records);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('stations-container').innerHTML = '<p>Error al cargar los datos. Por favor, intente más tarde.</p>';
    }
}

function displayData(stations) {
    const container = document.getElementById('stations-container');
    container.innerHTML = '';

    stations.forEach(station => {
        const stationDiv = document.createElement('div');
        stationDiv.className = 'station-card';

        const fields = station.fields;
        stationDiv.innerHTML = `            <div class="station-name">${fields.nombre || 'Estación sin nombre'}</div>
            ${createPollutantElement('PM2.5', fields.pm2_5)}
            ${createPollutantElement('PM10', fields.pm10)}
            ${createPollutantElement('NO2', fields.no2)}
            ${createPollutantElement('O3', fields.o3)}
        `;

        container.appendChild(stationDiv);
    });
}

function createPollutantElement(pollutant, value) {
    if (value === undefined) return '';
    
    const level = getAirQualityLevel(pollutant, value);
    if (!level) return '';

    return `
        <div class="pollutant ${level}">
            ${pollutant}: ${value} µg/m³
            <br>
            <small>Nivel: ${getLevelText(level)}</small>
        </div>
    `;
}

function getLevelText(level) {
    const texts = {
        'good': 'Bueno',
        'moderate': 'Moderado',
        'unhealthy': 'Insalubre',
        'very-unhealthy': 'Muy Insalubre',
        'hazardous': 'Peligroso'
    };
    return texts[level] || level;
}

// Fetch data when page loads
fetchData();

// Refresh data every 5 minutes
setInterval(fetchData, 5 * 60 * 1000);
