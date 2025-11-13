// src/components/WeatherWidget.jsx
import React, { useEffect, useState } from "react";

/**
 * WeatherWidget
 * Props:
 *  - location (string) : e.g. "Perth, Australia" or "Perth"
 *  - units (string) : "metric" | "imperial" (default "metric")
 *  - cacheTTL (number) : ms to keep cached weather (default 10 minutes)
 */
export default function WeatherWidget({ location = "", units = "metric", cacheTTL = 10 * 60 * 1000 }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(!!location);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

  // Helpers for caching
  const cacheKey = (q) => `weather_cache_v1::${q}::${units}`;
  const readCache = (q) => {
    try {
      const raw = localStorage.getItem(cacheKey(q));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - (parsed._fetchedAt || 0) > cacheTTL) {
        localStorage.removeItem(cacheKey(q));
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  };
  const writeCache = (q, data) => {
    try {
      localStorage.setItem(cacheKey(q), JSON.stringify({ _fetchedAt: Date.now(), data }));
    } catch {}
  };

  // Normalize location -> query string for OpenWeatherMap
  const makeQuery = (loc) => {
    if (!loc) return "";
    // Common patterns: "City, Region, Country" -> use first 2 parts if available
    const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 1) return parts[0];
    // prefer "City, Country" if there are many parts
    return `${parts[0]},${parts[parts.length - 1]}`;
  };

  useEffect(() => {
    let mounted = true;
    setWeather(null);
    setError(null);

    const q = makeQuery(location);
    if (!q) {
      setLoading(false);
      setError("No location provided");
      return;
    }

    // If no API key, bail with helpful message
    if (!API_KEY) {
      setLoading(false);
      setError("OpenWeather API key not set (VITE_OPENWEATHER_KEY)");
      return;
    }

    // Use cache if present
    const cached = readCache(q);
    if (cached) {
      setWeather(cached);
      setLoading(false);
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      q
    )}&units=${units}&appid=${API_KEY}`;

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`${res.status} ${res.statusText} ${txt}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        // data contains main.temp, weather[0].description, wind.speed, main.humidity, etc.
        const normalized = {
          temp: data.main?.temp ?? null,
          feels_like: data.main?.feels_like ?? null,
          description: data.weather?.[0]?.description ?? "",
          icon: data.weather?.[0]?.icon ?? null, // e.g. "04d"
          wind: data.wind?.speed ?? null,
          humidity: data.main?.humidity ?? null,
          name: data.name ?? q,
          raw: data,
        };
        setWeather(normalized);
        writeCache(q, normalized);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Weather fetch error:", err);
        setError("Failed to fetch weather.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, units, API_KEY]);

  // Small helpers
  const tempUnit = units === "imperial" ? "°F" : "°C";
  const windUnit = units === "imperial" ? "mph" : "m/s";

  // UI
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full max-w-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Weather</h3>

      {loading && (
        <div className="animate-pulse">
          <div className="h-20 bg-gray-100 rounded-md mb-3" />
          <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      )}

      {!loading && error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && weather && (
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg bg-gray-50 flex items-center justify-center">
            {weather.icon ? (
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                className="w-16 h-16"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/travel.jpg";
                }}
              />
            ) : (
              <div className="text-gray-400">—</div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <div className="text-2xl font-bold text-gray-800">
                {weather.temp !== null ? Math.round(weather.temp) : "—"}{tempUnit}
              </div>
              <div className="text-xs text-gray-500">feels like {weather.feels_like !== null ? Math.round(weather.feels_like) : "—"}{tempUnit}</div>
            </div>

            <div className="text-sm text-gray-600 capitalize">{weather.description}</div>

            <div className="mt-2 text-xs text-gray-500 flex gap-4">
              <div>💨 {weather.wind !== null ? weather.wind : "—"} {windUnit}</div>
              <div>💧 {weather.humidity !== null ? weather.humidity : "—"}%</div>
              <div className="truncate">📍 {weather.name}</div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !weather && (
        <div className="text-sm text-gray-500">No weather data available.</div>
      )}
    </div>
  );
}
