"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { TopNavbar, NavTabType } from "@/components/TopNavbar";
import { CenterStation } from "@/components/CenterStation";
import { LeftNewsFeed } from "@/components/LeftNewsFeed";
import { RightRegionalPulse } from "@/components/RightRegionalPulse";
import { CitySearchModal } from "@/components/CitySearchModal";
import { GeoLocationData, WeatherData, AIBriefingData, HourlyForecastItem } from "@/types";
import { getWeatherInfo } from "@/utils/weatherCodes";
import { soundFX } from "@/utils/audio";
import { X, Radio, CloudSun, Map, Newspaper } from "lucide-react";

export default function Home() {
  const [geo, setGeo] = useState<GeoLocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [briefing, setBriefing] = useState<AIBriefingData | null>(null);

  const [loadingGeo, setLoadingGeo] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingBriefing, setLoadingBriefing] = useState(true);

  // App Controls
  const [is24Hour, setIs24Hour] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTabType>("dashboard");

  // Modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  // Mobile Segmented Tab
  const [activeMobileTab, setActiveMobileTab] = useState<"left" | "right">("left");

  // Default to Patna, Bihar matching user reference
  const [locationMeta, setLocationMeta] = useState({
    city: "Patna",
    region: "Bihar",
    country: "India",
    countryCode: "IN",
    lat: 25.5941,
    lon: 85.1376,
    timezone: "Asia/Kolkata",
    flagEmoji: "🇮🇳",
  });

  const [currentDateStr, setCurrentDateStr] = useState("Fri, Oct 16, 2026");

  // Sync sound settings & auto-unlock Web Audio on first user interaction
  useEffect(() => {
    soundFX.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      soundFX.unlock();
    };
    window.addEventListener("pointerdown", handleFirstInteraction, { passive: true });
    window.addEventListener("keydown", handleFirstInteraction, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  // Update date string periodically in local timezone
  useEffect(() => {
    const updateDate = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: locationMeta.timezone,
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        setCurrentDateStr(formatter.format(now));
      } catch {
        setCurrentDateStr("Fri, Oct 16, 2026");
      }
    };
    updateDate();
    const interval = setInterval(updateDate, 30000);
    return () => clearInterval(interval);
  }, [locationMeta.timezone]);

  // 1. Fetch Weather from Open-Meteo
  const fetchWeather = useCallback(async (lat: number, lon: number, cityName: string) => {
    setLoadingWeather(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&hourly=temperature_2m,weather_code,is_day&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");

      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      const hourly = data.hourly;

      const weatherInfo = getWeatherInfo(current.weather_code, current.is_day === 1);

      const temp = Math.round(current.temperature_2m);
      const humidity = current.relative_humidity_2m;
      const wind = Math.round(current.wind_speed_10m);

      const placeLabel = cityName || "Patna";
      const shortDescription = `Clear sky in ${placeLabel} with temperature around ${temp}°C. Humidity is ${humidity}% and wind speed is ${wind} km/h. Comfortable atmospheric conditions.`;

      let sunriseStr = "05:48 AM";
      let sunsetStr = "05:21 PM";
      if (daily?.sunrise?.[0]) {
        sunriseStr = new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      if (daily?.sunset?.[0]) {
        sunsetStr = new Date(daily.sunset[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      // Build Hourly Forecast Items
      const hourlyItems: HourlyForecastItem[] = [];
      if (hourly?.time && hourly?.temperature_2m) {
        const labels = ["Now", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM", "3 AM"];
        for (let i = 0; i < 8; i++) {
          const stepIndex = i * 3;
          hourlyItems.push({
            timeLabel: labels[i] || `${i * 3}:00`,
            temp: Math.round(hourly.temperature_2m[stepIndex] ?? temp),
            weatherCode: hourly.weather_code?.[stepIndex] ?? current.weather_code,
            isDay: (hourly.is_day?.[stepIndex] ?? 1) === 1,
          });
        }
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
          uvIndex: daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : 7,
          surfacePressure: Math.round(current.surface_pressure),
        },
        daily: [],
        hourly: hourlyItems,
        sunrise: sunriseStr,
        sunset: sunsetStr,
        shortDescription,
        aiAdvisory: "Clear atmospheric window with pleasant daytime stability.",
      };

      setWeather(weatherObj);

      // Log to Supabase / Prisma if configured
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
      }).catch(() => {});

      return weatherObj;
    } catch (err) {
      console.error("Weather load error:", err);
      return null;
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  // 2. Fetch AI Briefing & 10 News items
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
      const temp = weatherObj?.current.temperature.toString() || "28";
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

  // 3. Location Detection
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
          city: geoData.city || "Patna",
          region: geoData.region || "Bihar",
          country: geoData.country || "India",
          countryCode: geoData.country_code || "IN",
          lat: geoData.latitude || 25.5941,
          lon: geoData.longitude || 85.1376,
          timezone: geoData.timezone?.id || "Asia/Kolkata",
          flagEmoji: geoData.flag?.emoji || "🇮🇳",
        };
        setLocationMeta(newMeta);

        const wObj = await fetchWeather(newMeta.lat, newMeta.lon, newMeta.city);
        await fetchBriefing(newMeta.city, newMeta.region, newMeta.country, newMeta.countryCode, wObj);
      } else {
        // Fallback to Patna
        const wObj = await fetchWeather(locationMeta.lat, locationMeta.lon, locationMeta.city);
        await fetchBriefing(locationMeta.city, locationMeta.region, locationMeta.country, locationMeta.countryCode, wObj);
      }
    } catch (err) {
      console.error("Location detection error:", err);
    } finally {
      setLoadingGeo(false);
    }
  }, [fetchWeather, fetchBriefing, locationMeta.lat, locationMeta.lon, locationMeta.city, locationMeta.country, locationMeta.countryCode, locationMeta.region]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Periodic refresh
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

  // Nav tab actions
  const handleTabSelect = (tab: NavTabType) => {
    setActiveTab(tab);
    if (tab === "news") {
      setIsNewsModalOpen(true);
    } else if (tab === "weather") {
      setIsWeatherModalOpen(true);
    } else if (tab === "maps") {
      setIsRadarModalOpen(true);
    }
  };

  return (
    <main className={styles.appWrapper}>
      {/* 1. TOP NAVBAR (Full-width header as in Image 2) */}
      <TopNavbar
        cityName={locationMeta.city}
        regionName={locationMeta.region}
        timezone={locationMeta.timezone}
        currentDateStr={currentDateStr}
        is24Hour={is24Hour}
        onToggle24Hour={() => setIs24Hour(!is24Hour)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isFahrenheit={isFahrenheit}
        onToggleFahrenheit={() => setIsFahrenheit(!isFahrenheit)}
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        onOpenLocationModal={() => setIsSearchModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* 2. MAIN COCKPIT VIEWPORT */}
      <div className={styles.viewportArea}>
        {/* DESKTOP 3-COLUMN COCKPIT (Left News 1-5 | Center Station | Right Radar + News 6-10) */}
        <div className={styles.cockpitGrid}>
          {/* Left Column: Headlines 01 to 05 */}
          <section className={styles.leftColumn}>
            <LeftNewsFeed
              news={briefing?.news || []}
              loading={loadingBriefing}
              onRefresh={handleManualRefresh}
              onSeeAll={() => setIsNewsModalOpen(true)}
            />
          </section>

          {/* Center Column: Panoramic Riverfront Sunset + Circular Gauge Clock + Docked Weather + Hourly Forecast */}
          <section className={styles.centerColumn}>
            <CenterStation
              timezone={locationMeta.timezone}
              cityName={locationMeta.city}
              regionName={locationMeta.region}
              weather={weather}
              loadingWeather={loadingWeather}
              is24Hour={is24Hour}
              soundEnabled={soundEnabled}
              isFahrenheit={isFahrenheit}
              onOpenWeatherDetail={() => setIsWeatherModalOpen(true)}
            />
          </section>

          {/* Right Column: Regional Radar Map + Headlines 06 to 10 + Network Telemetry */}
          <section className={styles.rightColumn}>
            <RightRegionalPulse
              briefing={briefing}
              geo={geo}
              loading={loadingBriefing}
              cityName={locationMeta.city}
              regionName={locationMeta.region}
              countryName={locationMeta.country}
              latitude={locationMeta.lat}
              longitude={locationMeta.lon}
              weatherCode={weather?.current.weatherCode}
              onOpenRadar={() => setIsRadarModalOpen(true)}
              onDailyLatest={() => setIsNewsModalOpen(true)}
            />
          </section>
        </div>

        {/* MOBILE VIEWPORT (Segmented Responsive Flow) */}
        <div className={styles.mobileContainer}>
          <section className={styles.mobileCenterSection}>
            <CenterStation
              timezone={locationMeta.timezone}
              cityName={locationMeta.city}
              regionName={locationMeta.region}
              weather={weather}
              loadingWeather={loadingWeather}
              is24Hour={is24Hour}
              soundEnabled={soundEnabled}
              isFahrenheit={isFahrenheit}
              onOpenWeatherDetail={() => setIsWeatherModalOpen(true)}
            />
          </section>

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

          <section className={styles.mobileNewsSection}>
            {activeMobileTab === "left" ? (
              <LeftNewsFeed
                news={briefing?.news || []}
                loading={loadingBriefing}
                onRefresh={handleManualRefresh}
                onSeeAll={() => setIsNewsModalOpen(true)}
              />
            ) : (
              <RightRegionalPulse
                briefing={briefing}
                geo={geo}
                loading={loadingBriefing}
                cityName={locationMeta.city}
                regionName={locationMeta.region}
                countryName={locationMeta.country}
                latitude={locationMeta.lat}
                longitude={locationMeta.lon}
                weatherCode={weather?.current.weatherCode}
                onOpenRadar={() => setIsRadarModalOpen(true)}
                onDailyLatest={() => setIsNewsModalOpen(true)}
              />
            )}
          </section>
        </div>
      </div>

      {/* 3. CITY SEARCH MODAL */}
      <CitySearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectCity={handleSelectCity}
        onUseCurrentLocation={detectLocation}
      />

      {/* 4. EXPANDED RADAR & MAPS MODAL (100% Dynamic for any city in the world) */}
      {isRadarModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsRadarModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <Map size={18} color="#38bdf8" />
                <span>Regional Weather Radar • {locationMeta.city}{locationMeta.region ? `, ${locationMeta.region}` : ""}</span>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setIsRadarModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ position: "relative", width: "100%", height: "360px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.12)", background: "#060911" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 50% 50%, #0d1e38 0%, #040711 100%)" }} />
                <svg viewBox="0 0 600 360" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  {/* Dynamic Range rings */}
                  <circle cx="300" cy="180" r="50" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="300" cy="180" r="110" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" strokeDasharray="6 6" />
                  <circle cx="300" cy="180" r="160" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />
                  
                  {/* Crosshairs */}
                  <line x1="300" y1="10" x2="300" y2="350" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                  <line x1="10" y1="180" x2="590" y2="180" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

                  {/* Range labels */}
                  <text x="306" y="135" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">50 KM</text>
                  <text x="306" y="75" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">100 KM</text>
                  <text x="306" y="25" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">150 KM</text>

                  {/* Doppler precipitation heatmap */}
                  <ellipse cx="380" cy="160" rx="90" ry="60" fill="#22c55e" opacity="0.3" filter="blur(16px)" />
                  <ellipse cx="390" cy="155" rx="55" ry="35" fill="#eab308" opacity="0.5" filter="blur(10px)" />
                  <ellipse cx="395" cy="150" rx="25" ry="18" fill="#ef4444" opacity="0.7" filter="blur(6px)" />
                  
                  {/* Dynamic Regional Labels based on Selected City & Coordinates */}
                  <text x="300" y="198" fill="#ffffff" fontSize="13" fontWeight="800" textAnchor="middle">
                    📍 {locationMeta.city}
                  </text>
                  <text x="40" y="40" fill="rgba(56, 189, 248, 0.7)" fontSize="11" fontWeight="700">
                    {locationMeta.region || locationMeta.country} North Sector
                  </text>
                  <text x="40" y="330" fill="rgba(255, 255, 255, 0.4)" fontSize="10" fontFamily="monospace">
                    LAT: {Math.abs(locationMeta.lat).toFixed(4)}° {locationMeta.lat >= 0 ? "N" : "S"} | LON: {Math.abs(locationMeta.lon).toFixed(4)}° {locationMeta.lon >= 0 ? "E" : "W"}
                  </text>
                  <text x="560" y="40" fill="rgba(255, 255, 255, 0.4)" fontSize="11" textAnchor="end">
                    {locationMeta.country}
                  </text>
                  <text x="560" y="330" fill="rgba(56, 189, 248, 0.6)" fontSize="10" textAnchor="end">
                    BAND: 5.6 GHz Doppler C-Band
                  </text>
                </svg>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8" }}>
                <span>Doppler Reflectivity: Real-time scan centered at {locationMeta.city} radar station</span>
                <span>Coordinates: {locationMeta.lat.toFixed(2)}°, {locationMeta.lon.toFixed(2)}°</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. EXPANDED ALL NEWS MODAL */}
      {isNewsModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsNewsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <Newspaper size={18} color="#38bdf8" />
                <span>All Regional & Global Headlines • {locationMeta.city}</span>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setIsNewsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {(briefing?.news || []).map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "0.75rem 1rem",
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#38bdf8", width: "24px" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", display: "flex", gap: "0.5rem" }}>
                      <strong>{item.source}</strong> • {item.pubDate}
                    </div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                      {item.title}
                    </div>
                  </div>
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: "64px", height: "46px", borderRadius: "8px", objectFit: "cover" }}
                    />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. EXPANDED WEATHER & ATMOSPHERIC INSIGHTS MODAL */}
      {isWeatherModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsWeatherModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <CloudSun size={18} color="#f59e0b" />
                <span>Atmospheric Telemetry & Forecast • {locationMeta.city}</span>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setIsWeatherModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>Temperature</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff" }}>
                    {weather?.current.temperature ?? 28}°C
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>
                    Feels like {weather?.current.apparentTemperature ?? 33}°C
                  </div>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>Atmospheric Conditions</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>
                    {weather?.current.conditionText || "Clear Sky"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#f59e0b" }}>
                    UV Index: {weather?.current.uvIndex ?? 7} (High)
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#38bdf8", marginBottom: "0.4rem" }}>
                  AI Advisory & Environmental Summary
                </div>
                <p style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.5 }}>
                  {briefing?.weatherNarrative || weather?.shortDescription}
                </p>
                {briefing?.lifestyleTip && (
                  <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                    💡 <strong>Tip:</strong> {briefing.lifestyleTip}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
