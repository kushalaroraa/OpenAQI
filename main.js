const checkbox = document.getElementById("checkbox")
checkbox.addEventListener("change", () => {
  document.body.classList.toggle("dark")
})

let aqiResult;

// IIFE function
(function () {

    const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
    const AIR_URL = "http://api.weatherapi.com/v1/current.json";
    const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API;
    const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API;


    const cityInput = document.querySelector("#city-input");
    const checkBtn = document.querySelector("#chkbtn");
    const locBtn = document.querySelector("#locBtn");

    const card = document.querySelector("#card");
    const aqiIcon = document.querySelector("#aqi-icon i");
    const aqiText = card.children[1];
    const categoryText = card.children[2];
    const adviceText = card.children[3];

    const coordsText = document.createElement("h3");
    coordsText.id = "coords-text";
    card.appendChild(coordsText);


    
    // AQI logic

    function getAQICategory(aqi) {
        if (aqi <= 50) return { cat: "Good", color: "#7ed957", icon: "fa-face-smile", advice:"Enjoy the fresh air outside!" };
        if (aqi <= 100) return { cat: "Moderate", color: "#f5d142", icon: "fa-face-meh", advice: "Air quality is acceptable, stay cautious." };
        if (aqi <= 150) return { cat: "Unhealthy for Sensitive Groups", color: "#ff914d", icon: "fa-face-frown", advice: "Limit long outdoor activities." };
        if (aqi <= 200) return { cat: "Unhealthy", color: "#ff5757", icon: "fa-face-dizzy", advice: "Avoid going outside if possible." };
        if (aqi <= 300) return { cat: "Very Unhealthy", color: "#8a2be2", icon: "fa-skull-crossbones", advice: "Stay indoors and wear a mask." };
        return { cat: "Hazardous", color: "#551a8b", icon: "fa-radiation", advice: "Health emergency. Avoid exposure!" };
    }


 // logic to fetch aqi from lat & lon
    async function fetchAQI(lat, lon) {
        try {
            const url = `${AIR_URL}?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=yes`;
            const res = await fetch(url);

            if (!res.ok) throw new Error("AQI fetch failed");

            let data = await res.json();
            return data.current.air_quality["pm2_5"];  
        } catch (err) {
            console.log(err);
            alert("Error fetching AQI.");
        }
    }


    //fetching using city entered
    async function fetchCoords(city) {
    const url = `${GEO_URL}?q=${city}&limit=1&appid=${OPENWEATHER_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");

    let data = await res.json();

    if (data.length === 0) {
        alert("City not found!");
        return null;
    }

    return { lat: data[0].lat, lon: data[0].lon };
}

    // ui card update
    function updateCard(aqi,lat,lon) {
        const { cat, color, icon, advice } = getAQICategory(aqi);

        aqiIcon.className = `fa-solid ${icon}`;
        aqiText.innerHTML = `Air Quality Index (PM2.5) in your area: <b>${Math.round(aqi)}</b> 
µg/m³`;
        categoryText.innerHTML = `Category: <b>${cat}</b>`;
        adviceText.innerHTML = `OpenAQI Suggestion: <b>${advice}</b>`;
        coordsText.innerHTML = `Coordinates: <b>${lat}</b>, <b>${lon}</b>`;

        card.style.background = color;
        card.style.color = "#fff";
    }


    //city search
    async function handleCitySearch() {
        const city = cityInput.value.trim();

        
        if (!city) return alert("Enter a city name!");

        const coords = await fetchCoords(city);
        if (!coords) return;

        const aqi = await fetchAQI(coords.lat, coords.lon);
        updateCard(aqi,coords.lat, coords.lon);
    }


 //geolocation button
    locBtn.addEventListener("click", () => {
        navigator.geolocation.getCurrentPosition(async pos => {
            let lat = pos.coords.latitude;
            let lon = pos.coords.longitude;

            const aqi = await fetchAQI(lat, lon);
            updateCard(aqi,lat,lon);

        }, () => {
            alert("Location access denied!");
        });
    });


    checkBtn.addEventListener("click", handleCitySearch);

})();
