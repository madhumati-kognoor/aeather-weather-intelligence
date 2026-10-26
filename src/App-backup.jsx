
import { useEffect, useState } from 'react';
import { getWeather, searchCity } from './services/weatherApi.js';

function weatherDescription(code) {
  if (code === 0) return 'Clear sky';
  if ([1, 2].includes(code)) return 'Mostly clear';
  if (code === 3) return 'Overcast';
  if ([45, 48].includes(code)) return 'Foggy';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rainy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowy';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Current conditions';
}

function weatherIcon(code, isDay) {
  if ([95, 96, 99].includes(code)) return '⛈️';
  if ([61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if (code === 3) return '☁️';
  if (code === 2) return '⛅';
  return isDay ? '☀️' : '🌙';
}

function App() {
  const [city, setCity] = useState('Bengaluru');
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  async function loadWeather(cityName) {
    setLoading(true);
    setError('');

    try {
      const foundPlace = await searchCity(cityName);
      const result = await getWeather(foundPlace.latitude, foundPlace.longitude);
      setPlace(foundPlace);
      setWeather(result);
      setCity(foundPlace.name);
    } catch (err) {
      setError(err.message || 'Unable to load weather. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather('Bengaluru');
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (city.trim()) loadWeather(city.trim());
  }

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const weatherCode = current?.weather_code ?? 0;
  const isDay = current?.is_day === 1;
  const atmosphereType = !isDay ? 'night' :
    [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)
      ? 'rainy' : 'sunny';

  return (
    <main className={`weather-app ${atmosphereType}`}>
      <div className="aether-atmosphere" aria-hidden="true" />

      <div className="weather-card">
        <header className="app-header">
          <div className="brand">
            <span className="brand-icon">✦</span>
            <div>
              <p className="eyebrow">WEATHER INTELLIGENCE</p>
              <h1>AETHER</h1>
            </div>
          </div>
          <span className="live-status"><span /> LIVE WEATHER</span>
        </header>

        <nav className="main-nav" aria-label="Weather sections">
          {['Overview', 'Forecast', 'Intelligence'].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'nav-tab active' : 'nav-tab'}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </nav>

        <section className="welcome-row">
          <div>
            <p className="eyebrow">YOUR PERSONAL WEATHER WORLD</p>
            <h2>
              {activeTab === 'Overview' ? 'Feel the atmosphere.' :
               activeTab === 'Forecast' ? 'What comes next?' :
               'Understand your sky.'}
            </h2>
            <p className="subtitle">Real-time conditions, beautifully understood.</p>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Search city..."
              aria-label="Search city"
            />
            <button type="submit" disabled={loading}>
              {loading ? '…' : 'Search'}
            </button>
          </form>
        </section>

        {error && <p role="alert" className="error-message">{error}</p>}
        {loading && !weather && <p>Loading live weather…</p>}

        {current && place && (
          <>
            {activeTab === 'Overview' && (
              <>
                <section className="hero-weather">
                  <div className="hero-copy">
                    <p className="eyebrow">CURRENT CONDITIONS</p>
                    <p className="location">
                      {place.name}{place.admin1 ? `, ${place.admin1}` : ''}
                      {place.country ? `, ${place.country}` : ''}
                    </p>
                    <div className="temperature">
                      {Math.round(current.temperature_2m)}°
                      <span>C</span>
                    </div>
                    <h3>{weatherDescription(weatherCode)}</h3>
                    <p className="subtitle">
                      Feels like {Math.round(current.apparent_temperature)}°C
                    </p>
                  </div>
                  <div className="hero-icon" role="img" aria-label={weatherDescription(weatherCode)}>
                    {weatherIcon(weatherCode, isDay)}
                  </div>
                </section>

                <section className="metric-grid">
                  <article className="metric-card">
                    <span>💧 Humidity</span>
                    <strong>{current.relative_humidity_2m ?? '—'}%</strong>
                    <small>Moisture in the air</small>
                  </article>
                  <article className="metric-card">
                    <span>💨 Wind speed</span>
                    <strong>{current.wind_speed_10m ?? '—'} <small>km/h</small></strong>
                    <small>Current wind conditions</small>
                  </article>
                  <article className="metric-card">
                    <span>🌧 Precipitation</span>
                    <strong>{current.precipitation ?? '—'} <small>mm</small></strong>
                    <small>Current precipitation</small>
                  </article>
                </section>
              </>
            )}

            {activeTab === 'Forecast' && (
              <section className="section-panel">
                <p className="eyebrow">PLAN AHEAD</p>
                <h2>7-day forecast</h2>
                {daily?.time?.length ? (
                  <div className="forecast-grid">
                    {daily.time.map((date, index) => (
                      <article className="forecast-day" key={date}>
                        <span>{index === 0 ? 'Today' :
                          new Date(`${date}T12:00:00`).toLocaleDateString('en', { weekday: 'short' })}</span>
                        <span className="forecast-icon">
                          {weatherIcon(daily.weather_code[index], true)}
                        </span>
                        <strong>{Math.round(daily.temperature_2m_max[index])}°</strong>
                        <span className="low-temperature">
                          {Math.round(daily.temperature_2m_min[index])}°
                        </span>
                      </article>
                    ))}
                  </div>
                ) : <p>Daily forecast data is not available.</p>}

                {hourly?.time?.length > 0 && (
                  <>
                    <h3>Upcoming hours</h3>
                    <div className="hourly-strip">
                      {hourly.time.slice(0, 8).map((time, index) => (
                        <article className="hour-card" key={time}>
                          <span>{new Date(time).toLocaleTimeString([], {
                            hour: 'numeric',
                          })}</span>
                          <strong>
                            {Math.round(hourly.temperature_2m?.[index] ?? 0)}°
                          </strong>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {activeTab === 'Intelligence' && (
              <section className="section-panel">
                <p className="eyebrow">ATMOSPHERIC INSIGHTS</p>
                <h2>Your weather snapshot</h2>
                <div className="metric-grid">
                  <article className="metric-card">
                    <span>🌡 Feels like</span>
                    <strong>{Math.round(current.apparent_temperature)}°C</strong>
                    <small>Perceived temperature</small>
                  </article>
                  <article className="metric-card">
                    <span>💧 Humidity</span>
                    <strong>{current.relative_humidity_2m ?? '—'}%</strong>
                    <small>Relative humidity</small>
                  </article>
                  <article className="metric-card">
                    <span>🌬 Wind</span>
                    <strong>{current.wind_speed_10m ?? '—'} km/h</strong>
                    <small>Wind speed at this location</small>
                  </article>
                </div>
                <div className="insight-card">
                  <span className="insight-icon">{weatherIcon(weatherCode, isDay)}</span>
                  <div>
                    <h3>{weatherDescription(weatherCode)} in {place.name}</h3>
                    <p>
                      Current temperature is {Math.round(current.temperature_2m)}°C.
                      {current.relative_humidity_2m != null
                        ? ` Humidity is ${current.relative_humidity_2m}%.` : ''}
                      {' '}Use the forecast tab to plan for the coming days.
                    </p>
                  </div>
                </div>
                <p className="data-note">
                  Insights use the current weather data available from Open-Meteo.
                  Air quality and UV readings are not included unless your API provides them.
                </p>
              </section>
            )}
          </>
        )}

        <footer className="footer-note">
          <span>✦ AETHER</span>
          <span>Live data powered by Open-Meteo</span>
        </footer>
      </div>
    </main>
  );
}

export default App;
