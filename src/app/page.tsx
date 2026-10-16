"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { TopNavbar, NavTabType } from "@/components/TopNavbar";
import { CenterStation } from "@/components/CenterStation";
import { LeftNewsFeed } from "@/components/LeftNewsFeed";
import { RightRegionalPulse } from "@/components/RightRegionalPulse";
import { CitySearchModal } from "@/components/CitySearchModal";
import {
  RadarMapModal,
  NewsListModal,
  WeatherDetailModal,
} from "@/components/modals";
import { useLocation, useWeather, useNewsBriefing, useDataSync } from "@/hooks";
import { soundFX } from "@/utils/audio";

export default function Home() {
  // 1. Domain Hooks (Location, Weather, AI News Briefing)
  const { geo, locationMeta, detectLocation, selectCity } = useLocation();
  const { weather, loadingWeather, fetchWeather } = useWeather();
  const { briefing, loadingBriefing, fetchBriefing } = useNewsBriefing();

  // 2. Generic Data Post/Sync (Posts telemetry to backend API / Supabase)
  useDataSync({
    endpoint: "/api/weather-log",
    data: weather
      ? {
          city: locationMeta.city || "Patna",
          temperature: weather.current.temperature,
          apparentTemperature: weather.current.apparentTemperature,
          weather: weather.current.conditionText,
          conditionText: weather.current.conditionText,
          weatherCode: weather.current.weatherCode,
          humidity: weather.current.humidity,
          windSpeed: weather.current.windSpeed,
          uvIndex: weather.current.uvIndex,
          surfacePressure: weather.current.surfacePressure,
          sunrise: weather.sunrise,
          sunset: weather.sunset,
          shortDescription: weather.shortDescription,
        }
      : null,
    syncKey: weather
      ? `${locationMeta.city}_${weather.current.temperature}_${weather.current.weatherCode}`
      : undefined,
  });

  // 2. Cockpit Preferences & Display State
  const [is24Hour, setIs24Hour] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTabType>("dashboard");
  const [activeMobileTab, setActiveMobileTab] = useState<"left" | "right">("left");
  const [currentDateStr, setCurrentDateStr] = useState("Fri, Oct 16, 2026");

  // 3. Modal Dialog Triggers
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  // Sync sound setting & unlock Web Audio context on user gesture
  useEffect(() => {
    soundFX.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const unlockAudio = () => soundFX.unlock();
    window.addEventListener("pointerdown", unlockAudio, { passive: true, once: true });
    window.addEventListener("keydown", unlockAudio, { passive: true, once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  // Update date formatted to active city's timezone
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

  // Synchronize weather and news briefing whenever location changes
  useEffect(() => {
    let isMounted = true;
    fetchWeather(locationMeta.lat, locationMeta.lon, locationMeta.city).then((wObj) => {
      if (isMounted) {
        fetchBriefing(
          locationMeta.city,
          locationMeta.region,
          locationMeta.country,
          locationMeta.countryCode,
          wObj
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    locationMeta.lat,
    locationMeta.lon,
    locationMeta.city,
    locationMeta.region,
    locationMeta.country,
    locationMeta.countryCode,
    fetchWeather,
    fetchBriefing,
  ]);

  // 120-second background telemetry refresh
  useEffect(() => {
    const timer = setInterval(() => {
      fetchWeather(locationMeta.lat, locationMeta.lon, locationMeta.city).then((wObj) => {
        fetchBriefing(
          locationMeta.city,
          locationMeta.region,
          locationMeta.country,
          locationMeta.countryCode,
          wObj
        );
      });
    }, 120000);

    return () => clearInterval(timer);
  }, [locationMeta, fetchWeather, fetchBriefing]);

  // Action Handlers
  const handleManualRefresh = async () => {
    const wObj = await fetchWeather(locationMeta.lat, locationMeta.lon, locationMeta.city);
    await fetchBriefing(
      locationMeta.city,
      locationMeta.region,
      locationMeta.country,
      locationMeta.countryCode,
      wObj
    );
  };

  const handleSelectCity = (selected: {
    name: string;
    region: string;
    country: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }) => {
    selectCity(selected);
  };

  const handleTabSelect = (tab: NavTabType) => {
    setActiveTab(tab);
    if (tab === "news") setIsNewsModalOpen(true);
    else if (tab === "weather") setIsWeatherModalOpen(true);
    else if (tab === "maps") setIsRadarModalOpen(true);
  };

  return (
    <main className={styles.appWrapper}>
      {/* 1. TOP NAVBAR */}
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

      {/* 2. COCKPIT VIEWPORT */}
      <div className={styles.viewportArea}>
        {/* DESKTOP 3-COLUMN COCKPIT GRID */}
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

          {/* Center Column: Clock, Gauge, Sun/Moon, Weather, 8h Forecast */}
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

          {/* Right Column: Live Radar Map + Headlines 06 to 10 */}
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

        {/* MOBILE VIEWPORT (Segmented responsive layout) */}
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

      {/* 3. MODAL DIALOGS */}
      <CitySearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectCity={handleSelectCity}
        onUseCurrentLocation={detectLocation}
      />

      <RadarMapModal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        location={locationMeta}
      />

      <NewsListModal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        cityName={locationMeta.city}
        news={briefing?.news || []}
      />

      <WeatherDetailModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        cityName={locationMeta.city}
        weather={weather}
        weatherNarrative={briefing?.weatherNarrative}
        lifestyleTip={briefing?.lifestyleTip}
      />
    </main>
  );
}
