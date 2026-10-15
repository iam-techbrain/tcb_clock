"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { CenterStation } from "@/components/CenterStation";
import { LeftNewsFeed } from "@/components/LeftNewsFeed";
import { RightRegionalPulse } from "@/components/RightRegionalPulse";
import { CitySearchModal } from "@/components/CitySearchModal";
import { GeoLocationData, WeatherData, AIBriefingData } from "@/types";
import { getWeatherInfo } from "@/utils/weatherCodes";

export default function Home() {
  const [geo, setGeo] = useState<GeoLocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [briefing, setBriefing] = useState<AIBriefingData | null>(null);

  const [loadingGeo, setLoadingGeo] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingBriefing, setLoadingBriefing] = useState(true);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"left" | "right">("left");

  // Dynamic location state without hardcoding any specific city; defaults country to India
  const [locationMeta, setLocationMeta] = useState({
    city: "",
    region: "",
    country: "India",
    countryCode: "IN",
    lat: 20.5937,
    lon: 78.9629,
    timezone: "Asia/Kolkata",
    flagEmoji: "🇮🇳",
  });

  // 1. Fetch Weather from Open-Meteo
  const fetchWeather = useCallback(async (lat: number, lon: number, cityName: string) => {
    setLoadingWeather(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");

      const data = await res.json();
      const current = data.current;
      const daily = data.daily;

      const weatherInfo = getWeatherInfo(current.weather_code, current.is_day === 1);

      const temp = Math.round(current.temperature_2m);
      const humidity = current.relative_humidity_2m;
      const wind = Math.round(current.wind_speed_10m);

      const placeLabel = cityName || "your location";
      let shortDescription = `${weatherInfo.label} in ${placeLabel} with temperature around ${temp}°C. Humidity is ${humidity}% and wind speed is ${wind} km/h. Comfortable atmospheric conditions.`;

      let aiAdvisory = "Clear atmospheric window.";

      let sunriseStr = "";
      let sunsetStr = "";
      if (daily.sunrise && daily.sunrise[0]) {
        sunriseStr = new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      if (daily.sunset && daily.sunset[0]) {
        sunsetStr = new Date(daily.sunset[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      const weatherObj: WeatherData = {
        current: {
          temperature: current.temperature_2m,
          apparentTemperature: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          weatherCode: current.weather_code,
          isDay: current.is_day === 1,
          conditionText: weatherInfo.label,
          uvIndex: daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : 4,
          surfacePressure: Math.round(current.surface_pressure),
        },
        daily: [],
        sunrise: sunriseStr,
        sunset: sunsetStr,
        shortDescription,
        aiAdvisory,
      };

      setWeather(weatherObj);

      // Record daily date, time and atmospheric weather to Supabase via Prisma
      fetch("/api/weather-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: cityName,
          temperature: weatherObj.current.temperature,
          apparentTemperature: weatherObj.current.apparentTemperature,
          conditionText: weatherObj.current.conditionText,
          weatherCode: weatherObj.current.weatherCode,
          humidity: weatherObj.current.humidity,
          windSpeed: weatherObj.current.windSpeed,
          uvIndex: weatherObj.current.uvIndex,
          surfacePressure: weatherObj.current.surfacePressure,
          sunrise: weatherObj.sunrise,
          sunset: weatherObj.sunset,
          shortDescription: weatherObj.shortDescription,
        }),
      }).catch((err) => {
        console.warn("Prisma Supabase sync warning:", err);
      });

      return weatherObj;
    } catch (err) {
      console.error("Weather load error:", err);
      return null;
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  // 2. Fetch AI Briefing & News from internal API (10 latest stories)
  const fetchBriefing = useCallback(async (
    city: string,
    region: string,
    country: string,
    countryCode: string,
    weatherObj?: WeatherData | null
  ) => {
    setLoadingBriefing(true);
    try {
      const desc = weatherObj?.current.conditionText || "Clear";
      const temp = weatherObj?.current.temperature.toString() || "26";
      const res = await fetch(
        `/api/briefing?city=${encodeURIComponent(city)}&region=${encodeURIComponent(
          region
        )}&country=${encodeURIComponent(country)}&countryCode=${encodeURIComponent(
          countryCode
        )}&weatherDesc=${encodeURIComponent(desc)}&temp=${encodeURIComponent(temp)}`
      );
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (err) {
      console.error("Briefing load error:", err);
    } finally {
      setLoadingBriefing(false);
    }
  }, []);

  // 3. Dynamic Location Detection via https://ipwho.is/
  const detectLocation = useCallback(async () => {
    setLoadingGeo(true);
    try {
      let geoData: GeoLocationData | null = null;
      try {
        const res = await fetch("https://ipwho.is/", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success !== false) {
            geoData = json;
          }
        }
      } catch {
        const fallbackRes = await fetch("/api/geo");
        if (fallbackRes.ok) {
          geoData = await fallbackRes.json();
        }
      }

      if (geoData) {
        setGeo(geoData);
        const newMeta = {
          city: geoData.city || "",
          region: geoData.region || "",
          country: geoData.country || "India",
          countryCode: geoData.country_code || "IN",
          lat: geoData.latitude || 20.5937,
          lon: geoData.longitude || 78.9629,
          timezone: geoData.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
          flagEmoji: geoData.flag?.emoji || "🇮🇳",
        };
        setLocationMeta(newMeta);

        const wObj = await fetchWeather(newMeta.lat, newMeta.lon, newMeta.city);
        await fetchBriefing(newMeta.city, newMeta.region, newMeta.country, newMeta.countryCode, wObj);
      }
    } catch (err) {
      console.error("Location detection error:", err);
    } finally {
      setLoadingGeo(false);
    }
  }, [fetchWeather, fetchBriefing]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchWeather(locationMeta.lat, locationMeta.lon, locationMeta.city).then((wObj) => {
        fetchBriefing(locationMeta.city, locationMeta.region, locationMeta.country, locationMeta.countryCode, wObj);
      });
    }, 120000);

    return () => clearInterval(timer);
  }, [locationMeta, fetchWeather, fetchBriefing]);

  const handleSelectCity = async (selected: {
    name: string;
    region: string;
    country: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }) => {
    const newMeta = {
      city: selected.name,
      region: selected.region,
      country: selected.country,
      countryCode: selected.countryCode,
      lat: selected.latitude,
      lon: selected.longitude,
      timezone: selected.timezone,
      flagEmoji: "📍",
    };
    setLocationMeta(newMeta);

    if (geo) {
      setGeo({
        ...geo,
        city: selected.name,
        region: selected.region,
        country: selected.country,
        country_code: selected.countryCode,
        latitude: selected.latitude,
        longitude: selected.longitude,
        timezone: {
          ...geo.timezone,
          id: selected.timezone,
        },
      });
    }

    const wObj = await fetchWeather(newMeta.lat, newMeta.lon, newMeta.city);
    await fetchBriefing(newMeta.city, newMeta.region, newMeta.country, newMeta.countryCode, wObj);
  };

  const handleManualRefresh = async () => {
    const wObj = await fetchWeather(locationMeta.lat, locationMeta.lon, locationMeta.city);
    await fetchBriefing(locationMeta.city, locationMeta.region, locationMeta.country, locationMeta.countryCode, wObj);
  };

  return (
    <main className={styles.mainContainer}>
      {/* DESKTOP LAYOUT (3 Columns: Left News | Center Station | Right News) */}
      <div className={styles.cockpitLayout}>
        {/* Left Column: 5 Latest Headlines */}
        <section className={styles.sideColumn}>
          <LeftNewsFeed
            news={briefing?.news || []}
            loading={loadingBriefing}
            onRefresh={handleManualRefresh}
          />
        </section>

        {/* Center Column: 2-Card Retro Flip Clock + Docked Weather Console */}
        <section className={styles.centerColumn}>
          <CenterStation
            timezone={locationMeta.timezone}
            cityName={locationMeta.city || locationMeta.country}
            weather={weather}
            loadingWeather={loadingWeather}
            onChangeArea={() => setIsSearchModalOpen(true)}
          />
        </section>

        {/* Right Column: 5 Regional Radar Stories + Telemetry */}
        <section className={styles.sideColumn}>
          <RightRegionalPulse
            briefing={briefing}
            geo={geo}
            loading={loadingBriefing}
          />
        </section>
      </div>

      {/* MOBILE LAYOUT: Full-sized Clock & Weather on Top, Tabbed News Below */}
      <div className={styles.mobileContainer}>
        {/* Clock & Weather Station */}
        <section className={styles.mobileCenterSection}>
          <CenterStation
            timezone={locationMeta.timezone}
            cityName={locationMeta.city || locationMeta.country}
            weather={weather}
            loadingWeather={loadingWeather}
            onChangeArea={() => setIsSearchModalOpen(true)}
          />
        </section>

        {/* Clean Mobile News Tabs Switcher */}
        <div className={styles.mobileTabs}>
          <button
            className={`${styles.mobileTabBtn} ${activeMobileTab === "left" ? styles.activeMobileTab : ""}`}
            onClick={() => setActiveMobileTab("left")}
          >
            LATEST HEADLINES (1–5)
          </button>
          <button
            className={`${styles.mobileTabBtn} ${activeMobileTab === "right" ? styles.activeMobileTab : ""}`}
            onClick={() => setActiveMobileTab("right")}
          >
            REGIONAL RADAR (6–10)
          </button>
        </div>

        {/* Selected Mobile News Feed */}
        <section className={styles.mobileNewsSection}>
          {activeMobileTab === "left" ? (
            <LeftNewsFeed
              news={briefing?.news || []}
              loading={loadingBriefing}
              onRefresh={handleManualRefresh}
            />
          ) : (
            <RightRegionalPulse
              briefing={briefing}
              geo={geo}
              loading={loadingBriefing}
            />
          )}
        </section>
      </div>

      {/* Area Selector Modal */}
      <CitySearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectCity={handleSelectCity}
        onUseCurrentLocation={detectLocation}
      />
    </main>
  );
}
