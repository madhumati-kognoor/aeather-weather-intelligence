const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

export async function searchCity(city) {
  const params = new URLSearchParams({
    name: city,
    count: '1',
    language: 'en',
    format: 'json',
  })

  const response = await fetch(`${GEOCODING_URL}?${params}`)

  if (!response.ok) {
    throw new Error('Unable to search for this city.')
  }

  const data = await response.json()

  if (!data.results || data.results.length === 0) {
    throw new Error('City not found. Try another city name.')
  }

  return data.results[0]
}

export async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
  })

  const response = await fetch(`${WEATHER_URL}?${params}`)

  if (!response.ok) {
    throw new Error('Unable to load weather data. Please try again.')
  }

  return response.json()
}