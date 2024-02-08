import { WEATHER_API_KEY } from "./keys.js";
const KELVIN = 273.15;
/**
 * Retrieves the user's geolocation coordinates using the browser's geolocation API.
 *
 * @return {Promise<{lat: number, lon: number}>} A promise that resolves with the user's coordinates if successful, or rejects with an error message if unsuccessful.
 */
function getGeoLocation() {
    return new Promise((resolve, reject) => {
        const locationOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
        if (navigator.geolocation) {
            const coordinates = { lat: 0, lon: 0 };
            console.log("Geolocation is supported!")
            navigator.geolocation.getCurrentPosition((position) => {
                coordinates.lat = position.coords.latitude;
                coordinates.lon = position.coords.longitude;
                resolve(coordinates)
            }, (error) => {
                console.log(error)
                alert("Please allow location access to get weather data");
                reject(error)
            }, locationOptions)
            return coordinates

        } else {

            console.log("Geolocation is not supported by this browser.");
            alert("Your browser does not support geolocation");
            reject("Your browser does not support geolocation")
        }
    })
}

async function currentWeather() {
    const { lat, lon } = await getGeoLocation()
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&country=IN`;
    const res = await fetch(url)
    const data = res.json()
    data.then(setWeatherData)
}


currentWeather()

function setWeatherData(data) {
    const city = document.getElementById("city");
    const weatherCondition = document.getElementById("weatherCondition");
    const todayDegree = document.querySelector("#todayDegree > span");
    const weatherIcon = document.getElementById("weatherIcon");
    const airQuality = document.querySelector(".airQuality");
    const temperature = document.querySelector(".temperature");
    const windSpeedKMH = Math.round(data.wind.speed * 3600 / 1000).toFixed(2)

    document.title = data.name + " - " + data.weather[0].main + " " + Math.round(data.main.temp - KELVIN) + "°C";
    document.body.style.setProperty("--speed", windSpeedKMH + "s");

    temperature.innerText = data.weather[0].main + " " + Math.round(data.main.temp - KELVIN) + "°C";
    airQuality.innerText = "Air Quality: " + data.main.humidity + " Wind: " + windSpeedKMH + " km/hr";
    city.innerText = data.name;
    weatherCondition.innerText = data.weather[0].main;
    todayDegree.innerText = Math.round(data.main.temp - KELVIN)
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}


async function forecastWeather() {
    const { lat, lon } = await getGeoLocation()
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&country=IN`;
    const res = await fetch(url)
    const data = res.json()
    data.then(setForecastData)
}


forecastWeather()

function setForecastData(data) {
    const lengthOfData = data.list.length;
    let currentDateInTheList = new Date(data.list[0].dt_txt);
    const todaysDate = new Date();
    const container = document.getElementById("forecast");
    const arrayForMinMax = [];
    for (let i = 0; i < lengthOfData; i++) {
        const date = new Date(data.list[i].dt_txt);
        const icon = `http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png`;
        if (currentDateInTheList.getDate() == date.getDate()) {
            arrayForMinMax.push(data.list[i].main.temp);
            continue;
        }
        currentDateInTheList = date;
        const sortedArray = arrayForMinMax.sort();
        const minTemp = Math.round(sortedArray[0] - KELVIN);
        const maxTemp = Math.round(sortedArray[sortedArray.length - 1] - KELVIN);

        let adjacentHtml = `<div>
<div>
  <span class="forecastDate">${date.getMonth()}<span class="slash">/</span>${date.getDate()}</span>
  <span class="forecastDay">${date.getDate() == todaysDate.getDate() ? "today" : date.getDate() == todaysDate.getDate() + 1 ? "tomorrow" : date.toLocaleDateString("en-IN", { weekday: 'long' })}</span>
</div>
<img
  class="forecastIcon"
  src="${icon}"
  alt="weather icon"
/>
<p class="forecastDegree">
  <span>${minTemp}</span><sup>o</sup><span class="slash">/</span>${maxTemp}<sup
    >o</sup
  >
</p>
</div>`

        container.insertAdjacentHTML("beforeend", adjacentHtml);
    }

}

