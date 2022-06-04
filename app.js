const API_KEY = 'a7131d4ff497ef30e9b3c0e5136de3ae'
const randomCities = ['London', 'Paris', 'New York', 'Moscow', 'Dubai', 'Tokyo', 'Singapore', 'Los Angeles', 'Barcelona', 'Madrid'];

// Nav elements 
const searchIcon = document.querySelector('.nav__search-icon');
const searchBar = document.querySelector('.nav__search-bar');
const searchInput = document.querySelector('.nav__search-input');
const searchBtn = document.querySelector('.nav__search-button');
const popup = document.querySelector('.popup');

// Data fields to update 
const currentWeatherDate = document.querySelector('.current-weather__date');
const currentWeatherLocation = document.querySelector('.current-weather__location');
const currentWeatherIcon = document.querySelector('.current-weather__icon');
const currentWeatherTemperature = document.querySelector('.current-weather__current-temperature');
const currentWeatherFeelsTemperature = document.querySelector('.current-weather__feels-temperature');
const currentWeatherPressure = document.querySelector('[data-pressure]');
const currentWeatherHumidity = document.querySelector('[data-humidity]');
const currentWeatherWindspeed = document.querySelector('[data-windspeed]');
const currentWeatherWinddirection = document.querySelector('[data-winddirection]');
const currentWeatherWindicon = document.querySelector('[data-wind-icon]');
const forecastWeather = document.querySelector('.weather-forecast__data');

searchIcon.addEventListener('click', () => {
    searchInput.value = '';
    searchIcon.classList.toggle('nav__search-icon--hidden');
    searchBtn.classList.toggle('nav__search-button--hidden');
    searchBar.classList.toggle('nav__search-bar--hidden');
    searchInput.focus();
})

searchBtn.addEventListener('click', (e) => {
    e.preventDefault()
    if (!checkInputValue(searchInput.value)) return;
    searchBtn.classList.toggle('nav__search-button--hidden');
    searchIcon.classList.toggle('nav__search-icon--hidden');
    searchBar.classList.toggle('nav__search-bar--hidden');
    getLocation(searchInput.value)
})

function getLocation(location) {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${location},&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) return showPopup('Failed to connect to server.');
            return response.json();
        })
        .then(data => {
            if (data[0].name === undefined) return;
            getWeather(data[0].name, data[0].lat, data[0].lon)
        })
        .catch(() => {
            return showPopup(`Location ${location} wasn't found.`)
        })
}

function getWeather(name, lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const dateInfo = convertDate(data.current.dt);
            const windDirection = converWindDirection(data.current.wind_deg);

            currentWeatherDate.innerText = `${dateInfo.day}, ${dateInfo.date} ${dateInfo.month}`;
            currentWeatherLocation.innerText = name;
            currentWeatherIcon.src = `./img/${getWeatherIcon(data.current.weather[0].icon)}.svg`;
            currentWeatherTemperature.innerText = `${Math.floor(data.current.temp)}°`;
            currentWeatherFeelsTemperature.innerText = `Feels like: ${Math.floor(data.current.feels_like)}°C`;
            currentWeatherPressure.innerText = data.current.pressure;
            currentWeatherHumidity.innerText = data.current.humidity;
            currentWeatherWindspeed.innerText = data.current.wind_speed;
            currentWeatherWindicon.style.transform = `rotate(${180+data.current.wind_deg}deg)`
            currentWeatherWinddirection.innerText = windDirection;
            forecastWeather.innerHTML = generateForecast(data.daily.slice(1, 7));
        })
}

function getWeatherIcon(icon) {
    if (icon === '01d' || icon === '02d' || icon === '01n' || icon === '02n') {
        return icon;
    } else
        return icon.slice(0, 2);
}

function generateForecast(value) {
    let forecast = '';
    value.forEach(day => {
        const dateInfo = convertDate(day.dt)
        forecast += `<div class="weather-forecast__data-block">
        <p class="weather-forecast__data-day">${dateInfo.day}</p>
        <p class="weather-forecast__data-temperature">${parseInt(day.temp.day)}°</p>
        <img src="./img/${getWeatherIcon(day.weather[0].icon)}.svg" alt="" class="weather-forecast__data-icon" data-forecast>
        </div>`
    });
    return forecast
}

function convertDate(value) {
    const date = new Date(value * 1000)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const dateInfo = {
        day: days[date.getDay()],
        date: date.getDate(),
        month: months[date.getMonth()]
    }
    return dateInfo
}

function converWindDirection(value) {
    if (value >= 338 || value < 23) {
        return 'N'
    } else if (value >= 23 && value < 68) {
        return 'NE'
    } else if (value >= 68 && value < 113) {
        return 'E'
    } else if (value >= 113 && value < 158) {
        return 'SE'
    } else if (value >= 158 && value < 203) {
        return 'S'
    } else if (value >= 203 && value < 247) {
        return 'SE'
    } else if (value >= 247 && value < 293) {
        return 'W'
    } else if (value >= 293 && value < 338) return 'NW'
}

function checkInputValue(value) {
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?~1234567890]/;

    if (value === '') {
        showPopup('Enter a city name!');
        return
    } else if (specialChars.test(value)) {
        showPopup('Enter proper city name!');
        return
    } else return true

}

function showPopup(text) {
    const popupText = document.querySelector('.popup-text');
    popupText.innerText = text;
    popup.classList.remove('popup--hidden');
    setTimeout(() => {
        popup.classList.add('popup--hidden');
    }, 2000);
}

getLocation(randomCities[Math.floor(Math.random() * randomCities.length)])