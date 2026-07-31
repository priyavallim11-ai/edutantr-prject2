const apiKey = "cc6b5dcc9fcd6c507456abe1458088da";

const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const todayDate = document.getElementById("todayDate");
const temp = document.getElementById("temp");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const icon = document.getElementById("icon");
const forecast = document.getElementById("forecast");
const error = document.getElementById("error");

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

const locationBtn = document.getElementById("locationBtn");
const loader = document.getElementById("loader");
const themeBtn = document.getElementById("themeBtn");
const recentSearches = document.getElementById("recentSearches");

let currentCity = "";
let currentUnit = "metric";

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {
        error.innerHTML = "Please enter a city.";
        return;
    }

    currentCity = city;
    getWeather(city);

});

cityInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {
        searchBtn.click();
    }

});

async function getWeather(city) {

    loader.style.display = "block";

    error.innerHTML = "";
    forecast.innerHTML = "";

    try {

        const weatherURL =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("City not found");
        }

        const weatherData = await weatherResponse.json();

        cityName.innerHTML = weatherData.name;

        todayDate.innerHTML =
        new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        temp.innerHTML =
        Math.round(weatherData.main.temp) +
        (currentUnit === "metric" ? "°C" : "°F");

        feelsLike.innerHTML =
        Math.round(weatherData.main.feels_like) +
        (currentUnit === "metric" ? "°C" : "°F");

        condition.innerHTML =
        weatherData.weather[0].main;

        humidity.innerHTML =
        weatherData.main.humidity + "%";

        wind.innerHTML =
        weatherData.wind.speed + " km/h";

        pressure.innerHTML =
        weatherData.main.pressure + " hPa";

        visibility.innerHTML =
        (weatherData.visibility / 1000).toFixed(1) + " km";

        sunrise.innerHTML =
        new Date(weatherData.sys.sunrise * 1000)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        sunset.innerHTML =
        new Date(weatherData.sys.sunset * 1000)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        icon.src =
        `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

        setBackground(weatherData.weather[0].main);
                // Weather Forecast API

        const forecastURL =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${currentUnit}`;

        const forecastResponse = await fetch(forecastURL);

        if (!forecastResponse.ok) {
            throw new Error("Forecast not available");
        }

        const forecastData = await forecastResponse.json();

        displayForecast(forecastData.list);

        saveSearch(currentCity);

        loader.style.display = "none";

    } catch (err) {

        loader.style.display = "none";

        error.innerHTML = "City not found.";

        cityName.innerHTML = "City Name";
        todayDate.innerHTML = "";

        temp.innerHTML = "--";
        feelsLike.innerHTML = "--";

        condition.innerHTML = "--";

        humidity.innerHTML = "--%";
        wind.innerHTML = "-- km/h";

        pressure.innerHTML = "--";
        visibility.innerHTML = "--";

        sunrise.innerHTML = "--";
        sunset.innerHTML = "--";

        icon.src = "";

        forecast.innerHTML = "";

    }

}

function setBackground(weather){

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "snowy",
        "thunder",
        "mist"
    );

    switch(weather){

        case "Clear":
            document.body.classList.add("sunny");
            break;

        case "Clouds":
            document.body.classList.add("cloudy");
            break;

        case "Rain":
        case "Drizzle":
            document.body.classList.add("rainy");
            break;

        case "Snow":
            document.body.classList.add("snowy");
            break;

        case "Thunderstorm":
            document.body.classList.add("thunder");
            break;

        case "Mist":
        case "Fog":
        case "Haze":
        case "Smoke":
            document.body.classList.add("mist");
            break;

        default:
            break;
    }

}

function displayForecast(data){

    forecast.innerHTML = "";

    const dailyData = data.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    dailyData.forEach(day => {

        const date = new Date(day.dt_txt);

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h4>${date.toLocaleDateString("en-US",{
                weekday:"short"
            })}</h4>

            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">

            <p>${Math.round(day.main.temp)}${currentUnit==="metric"?"°C":"°F"}</p>

            <p>${day.weather[0].main}</p>
        `;

        forecast.appendChild(card);

    });

}

celsiusBtn.addEventListener("click",()=>{

    if(currentCity==="") return;

    currentUnit="metric";

    celsiusBtn.classList.add("active");
    fahrenheitBtn.classList.remove("active");

    getWeather(currentCity);

});

fahrenheitBtn.addEventListener("click",()=>{

    if(currentCity==="") return;

    currentUnit="imperial";

    fahrenheitBtn.classList.add("active");
    celsiusBtn.classList.remove("active");

    getWeather(currentCity);

});

// ==========================
// Current Location
// ==========================

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        getPosition,
        showLocationError
    );

});

async function getPosition(position) {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    loader.style.display = "block";

    try {

        const url =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to fetch location.");
        }

        const data = await response.json();

        currentCity = data.name;
        cityInput.value = currentCity;

        getWeather(currentCity);

    } catch (err) {

        loader.style.display = "none";
        error.innerHTML = "Unable to fetch your location weather.";

    }

}

function showLocationError() {

    loader.style.display = "none";

    alert("Unable to access your location.");

}



function saveSearch(city) {

    let cities =
    JSON.parse(localStorage.getItem("cities")) || [];

    cities = cities.filter(c => c !== city);

    cities.unshift(city);

    if (cities.length > 5) {
        cities.pop();
    }

    localStorage.setItem(
        "cities",
        JSON.stringify(cities)
    );

    loadSearches();

}

function loadSearches() {

    if (!recentSearches) return;

    recentSearches.innerHTML = "";

    const cities =
    JSON.parse(localStorage.getItem("cities")) || [];

    cities.forEach(city => {

        const btn = document.createElement("button");

        btn.className = "recent-btn";

        btn.innerHTML = city;

        btn.onclick = () => {

            cityInput.value = city;
            currentCity = city;

            getWeather(city);

        };

        recentSearches.appendChild(btn);

    });

}



themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeBtn.innerHTML = "☀️ Light Mode";

    } else {

        themeBtn.innerHTML = "🌙 Dark Mode";

    }

});


loadSearches();

// Optional default city
getWeather("Chennai");