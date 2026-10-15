"use client";

import React, { useState, useEffect } from "react";
import styles from "./CenterStation.module.css";
import { FlipCard } from "./FlipCard";
import { WeatherData } from "@/types";
import { 
  Volume2, 
  VolumeX, 
  Clock, 
  MapPin, 
  Sun, 
  Moon, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog,
  Droplets,
  Wind,
  Gauge,
  Sunrise,
  Sunset,
  Sparkles
} from "lucide-react";
import { soundFX } from "@/utils/audio";

interface CenterStationProps {
  timezone?: string;
  cityName?: string;
  weather: WeatherData | null;
  loadingWeather: boolean;
  onChangeArea?: () => void;
}

export const CenterStation: React.FC<CenterStationProps> = ({
  timezone = "Asia/Kolkata",
  cityName = "Local",
  weather,
  loadingWeather,
  onChangeArea,
}) => {
  const [time, setTime] = useState<{
    hoursStr: string;
    minutesStr: string;
    secondsStr: string;
    periodStr: string;
    dateStr: string;
  }>({
    hoursStr: "8",
    minutesStr: "31",
    secondsStr: "00",
    periodStr: "PM",
    dateStr: "",
  });

  const [is24Hour, setIs24Hour] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    soundFX.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: timezone,
          hour12: !is24Hour,
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        };

        const timeFormatter = new Intl.DateTimeFormat("en-US", options);
        const parts = timeFormatter.formatToParts(now);

        let h = "";
        let m = "";
        let s = "";
        let dayPeriod = "";

        parts.forEach((p) => {
          if (p.type === "hour") h = p.value;
          if (p.type === "minute") m = p.value;
          if (p.type === "second") s = p.value;
          if (p.type === "dayPeriod") dayPeriod = p.value.toUpperCase();
        });

        // In 12-hour mode, single-digit hour 1-9 MUST NOT have leading zero (matches reference image: "8")
        if (!is24Hour && h) {
          const num = parseInt(h, 10);
          if (!isNaN(num)) {
            h = String(num);
          }
        }

        const dateFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        setTime({
          hoursStr: h,
          minutesStr: m,
          secondsStr: s,
          periodStr: !is24Hour ? dayPeriod : "",
          dateStr: dateFormatter.format(now),
        });
      } catch (err) {
        console.error("Timezone format error:", err);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone, is24Hour]);

  const formatTemp = (celsius?: number) => {
    if (celsius === undefined) return "--";
    if (isFahrenheit) {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const renderWeatherIcon = (code?: number, isDay: boolean = true) => {
    if (code === undefined) return <Cloud size={24} className={styles.weatherIcon} />;
    switch (code) {
      case 0:
        return isDay ? <Sun size={24} className={styles.weatherIcon} /> : <Moon size={24} className={styles.weatherIcon} />;
      case 1:
      case 2:
        return <CloudSun size={24} className={styles.weatherIcon} />;
      case 3:
        return <Cloud size={24} className={styles.weatherIcon} />;
      case 45:
      case 48:
        return <CloudFog size={24} className={styles.weatherIcon} />;
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return <CloudRain size={24} className={styles.weatherIcon} />;
      case 71:
      case 73:
      case 75:
        return <CloudSnow size={24} className={styles.weatherIcon} />;
      case 95:
      case 96:
      case 99:
        return <CloudLightning size={24} className={styles.weatherIcon} />;
      default:
        return <CloudSun size={24} className={styles.weatherIcon} />;
    }
  };

  return (
    <div className={styles.stationContainer}>
      {/* 1. TOP HEADER STATUS */}
      <div className={styles.stationHeader}>
        <div className={styles.locationMeta}>
          <span className={styles.livePulseDot} />
          <span className={styles.cityText}>
            {cityName ? cityName.toUpperCase() : "LIVE"} TIME
          </span>
          <span className={styles.tzPill}>{timezone}</span>
          {onChangeArea && (
            <button
              className={styles.areaSelectBtn}
              onClick={onChangeArea}
              title="Change area"
            >
              <MapPin size={11} />
              <span>AREA</span>
            </button>
          )}
        </div>

        <div className={styles.controlsCluster}>
          <button
            className={`${styles.ctrlPill} ${!is24Hour ? styles.activePill : ""}`}
            onClick={() => setIs24Hour(!is24Hour)}
            title="Toggle 12h / 24h"
          >
            <Clock size={12} />
            <span>{is24Hour ? "24H" : "12H"}</span>
          </button>

          <button
            className={`${styles.ctrlPill} ${soundEnabled ? styles.activePill : ""}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle Flip Sound"
          >
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            <span>{soundEnabled ? "SOUND" : "MUTE"}</span>
          </button>

          <button
            className={styles.tempUnitBtn}
            onClick={() => setIsFahrenheit(!isFahrenheit)}
            title="Toggle °C / °F"
          >
            {isFahrenheit ? "°F" : "°C"}
          </button>
        </div>
      </div>

      {/* 2. THE HERO: 2-CARD RETRO FLIP CLOCK (Exact match to user image) */}
      <div className={styles.clockStage}>
        <FlipCard
          value={time.hoursStr}
          subLabel={time.periodStr}
          labelTitle="HOURS"
        />

        <div className={styles.centerDivider}>
          <span className={styles.dividerDot} />
          <span className={styles.dividerDot} />
        </div>

        <FlipCard
          value={time.minutesStr}
          labelTitle="MINUTES"
        />
      </div>

      {/* 3. UNIFIED INSTRUMENT CONSOLE (Weather, Date, Metrics, AI Brief) */}
      <div className={styles.instrumentConsole}>
        {/* Row 1: Temp & Condition on Left, Date & Solar on Right */}
        <div className={styles.consoleRowTop}>
          <div className={styles.weatherHighlight}>
            {loadingWeather && !weather ? (
              <span className={styles.weatherLoading}>Loading local telemetry...</span>
            ) : weather ? (
              <div className={styles.weatherInline}>
                <span className={styles.iconBox}>
                  {renderWeatherIcon(weather.current.weatherCode, weather.current.isDay)}
                </span>
                <span className={styles.tempDegree}>
                  {formatTemp(weather.current.temperature)}
                </span>
                <div className={styles.conditionStack}>
                  <span className={styles.conditionTitle}>
                    {weather.current.conditionText}
                  </span>
                  <span className={styles.feelsLikeTitle}>
                    Feels {formatTemp(weather.current.apparentTemperature)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.dateAndSolar}>
            <div className={styles.dateString}>
              {mounted && time.dateStr ? time.dateStr : "Synchronizing..."}
            </div>
            {weather && (weather.sunrise || weather.sunset) && (
              <div className={styles.solarPills}>
                {weather.sunrise && (
                  <div className={styles.solarItem}>
                    <Sunrise size={12} />
                    <span>Sunrise: <strong>{weather.sunrise}</strong></span>
                  </div>
                )}
                {weather.sunrise && weather.sunset && <span className={styles.dotSep}>•</span>}
                {weather.sunset && (
                  <div className={styles.solarItem}>
                    <Sunset size={12} />
                    <span>Sunset: <strong>{weather.sunset}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: 4 Telemetry Metrics Grid */}
        {weather && (
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <Droplets size={14} className={styles.metricIcon} />
              <div className={styles.metricDetails}>
                <span className={styles.metricLabel}>Humidity</span>
                <strong className={styles.metricValue}>{weather.current.humidity}%</strong>
              </div>
            </div>

            <div className={styles.metricCard}>
              <Wind size={14} className={styles.metricIcon} />
              <div className={styles.metricDetails}>
                <span className={styles.metricLabel}>Wind</span>
                <strong className={styles.metricValue}>{weather.current.windSpeed} km/h</strong>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricDetails}>
                <span className={styles.metricLabel}>UV Index</span>
                <strong className={styles.metricValue}>{weather.current.uvIndex ?? 3}</strong>
              </div>
            </div>

            <div className={styles.metricCard}>
              <Gauge size={14} className={styles.metricIcon} />
              <div className={styles.metricDetails}>
                <span className={styles.metricLabel}>Pressure</span>
                <strong className={styles.metricValue}>{weather.current.surfacePressure ?? 1012} hPa</strong>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Clean AI Weather Brief */}
        {weather && weather.shortDescription && (
          <div className={styles.aiBriefLine}>
            <Sparkles size={12} className={styles.sparkle} />
            <p className={styles.aiBriefText}>{weather.shortDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
};
