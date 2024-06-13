const APIkey = '109d93e7db292a88cd86f65f818e07b8';
const cityInput = document.getElementById('city-input');
const searchBTN = document.getElementById('search-btn');
const currentWeatherDiv = document.querySelector('.current-weather .details');
const weatherCardsDiv = document.querySelector('.weather-cards');
const pastCitiesSelect = document.getElementById('pastSearches');

const createWeatherCard = (cityName, weatherItem, index) => {
    const tempFahrenheit = ((weatherItem.main.temp - 273.15) * 9 / 5) + 32;
    const date = weatherItem.dt_txt ? new Date(weatherItem.dt_txt).toDateString() : '';
    if (index === 0) {
        return (`<div class="details">
                    <h2>${cityName} (${date})</h2>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>Temp: ${tempFahrenheit.toFixed(2)} °F</h4>
                    <h4>Wind: ${weatherItem.wind.speed} MPH</h4>
                    <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                </div>`);
    }
    return (
        `<li class="card">
            <h3>(${date})</h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>Temp: ${tempFahrenheit.toFixed(2)} °F</h4>
            <h4>Wind: ${weatherItem.wind.speed} MPH</h4>
            <h4>Humidity: ${weatherItem.main.humidity} %</h4>
        </li>`
    );
}

const getWeatherDetails = (cityName, lat, lon) => {
    const weatherAPIurl = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${APIkey}`;

    fetch(weatherAPIurl)
        .then(res => {
            if (!res.ok) {
                throw new Error('Error fetching forecast');
            }
            return res.json();
        })
        .then(data => {
            const forecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!forecastDays.includes(forecastDate)) {
                    return forecastDays.push(forecastDate);
                }
            });

            cityInput.value = '';
            currentWeatherDiv.innerHTML = '';
            weatherCardsDiv.innerHTML = '';

            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index);
                } else {
                    weatherCardsDiv.insertAdjacentHTML('beforeend', createWeatherCard(cityName, weatherItem, index));
                }
            });

            saveCityToLocal(cityName);
            updatePastCities();
        })
        .catch(error => {
            console.error('Error fetching forecast', error.message);
            alert('Error fetching forecast');
        });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const geocodingAPIurl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIkey}`;

    fetch(geocodingAPIurl)
        .then(res => {
            if (!res.ok) {
                throw new Error('Error fetching coordinates');
            }
            return res.json();
        })
        .then(data => {
            if (!data.length) {
                throw new Error(`No coordinates found for ${cityName}`);
            }
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(error => {
            console.error('Error fetching coordinates', error.message);
            alert('Error fetching coordinates');
        });
}

const saveCityToLocal = (cityName) => {
    let cities = JSON.parse(localStorage.getItem('cities')) || [];
    if (!cities.includes(cityName)) {
        cities.push(cityName);
        localStorage.setItem('cities', JSON.stringify(cities));
    }
}

const getWeatherForSelectedCity = () => {
    const selectedCity = pastCitiesSelect.value;
    const geocodingAPIurl = `https://api.openweathermap.org/geo/1.0/direct?q=${selectedCity}&limit=1&appid=${APIkey}`;

    fetch(geocodingAPIurl)
        .then(res => {
            if (!res.ok) {
                throw new Error('Error fetching coordinates');
            }
            return res.json();
        })
        .then(data => {
            if (!data.length) {
                throw new Error(`No coordinates found for ${selectedCity}`);
            }
            const { lat, lon } = data[0];
            getWeatherDetails(selectedCity, lat, lon);
        })
        .catch(error => {
            console.error('Error fetching coordinates', error.message);
            alert('Error fetching coordinates');
        });
}

pastCitiesSelect.addEventListener('change', getWeatherForSelectedCity);

const updatePastCities = () => {
    const cities = JSON.parse(localStorage.getItem('cities')) || [];
    pastCitiesSelect.innerHTML = cities.map(city => `<option value="${city}">${city}</option>`).join('');
}

searchBTN.addEventListener('click', getCityCoordinates);

updatePastCities();














