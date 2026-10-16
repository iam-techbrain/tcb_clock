"use client";

import React, { useState, useEffect } from "react";
import styles from "./CenterStation.module.css";
import { WeatherData } from "@/types";
import {
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
  Maximize2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { soundFX } from "@/utils/audio";

interface CenterStationProps {
  timezone?: string;
  cityName?: string;
  regionName?: string;
  weather: WeatherData | null;
  loadingWeather: boolean;
  is24Hour: boolean;
  soundEnabled: boolean;
  isFahrenheit: boolean;
  onOpenWeatherDetail?: () => void;
}

export const CenterStation: React.FC<CenterStationProps> = ({
  timezone = "Asia/Kolkata",
  cityName = "Patna",
  weather,
  loadingWeather,
  is24Hour,
  soundEnabled,
  isFahrenheit,
  onOpenWeatherDetail,
}) => {
  const [time, setTime] = useState<{
    hoursStr: string;
    minutesStr: string;
    secondsNum: number;
    periodStr: string;
    dateFullStr: string;
    hourOfDay: number;
  }>({
    hoursStr: "08",
    minutesStr: "31",
    secondsNum: 0,
    periodStr: "AM",
    dateFullStr: "Friday, Oct 16, 2026",
    hourOfDay: 8,
  });

  const [lastSecond, setLastSecond] = useState<number>(-1);

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
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        };

        const timeFormatter = new Intl.DateTimeFormat("en-US", options);
        const parts = timeFormatter.formatToParts(now);

        let h = "08";
        let m = "31";
        let s = "00";
        let dayPeriod = "AM";

        parts.forEach((p) => {
          if (p.type === "hour") h = p.value;
          if (p.type === "minute") m = p.value;
          if (p.type === "second") s = p.value;
          if (p.type === "dayPeriod") dayPeriod = p.value.toUpperCase();
        });

        const secNum = parseInt(s, 10) || 0;

        // Play gentle audio click on minute change if sound enabled
        if (secNum === 0 && lastSecond === 59) {
          soundFX.playFlip();
        }
        setLastSecond(secNum);

        const dateFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        // Determine hour of day in local timezone for greeting
        const hour24Opt = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour12: false,
          hour: "numeric",
        });
        const currentHour24 = parseInt(hour24Opt.format(now), 10) || 8;

        setTime({
          hoursStr: h,
          minutesStr: m,
          secondsNum: secNum,
          periodStr: !is24Hour ? dayPeriod : "",
          dateFullStr: dateFormatter.format(now),
          hourOfDay: currentHour24,
        });
      } catch (err) {
        console.error("Clock update error:", err);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone, is24Hour, lastSecond]);

  // Greeting based on current hour of day
  const getGreeting = () => {
    const h = time.hourOfDay;
    if (h >= 4 && h < 12) return "Good Morning";
    if (h >= 12 && h < 17) return "Good Afternoon";
    if (h >= 17 && h < 22) return "Good Evening";
    return "Good Night";
  };

  const isNight = time.hourOfDay < 5 || time.hourOfDay >= 18;

  const formatTemp = (celsius?: number) => {
    if (celsius === undefined) return "28°C";
    if (isFahrenheit) {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const formatTempDegreeOnly = (celsius?: number) => {
    if (celsius === undefined) return "28°";
    if (isFahrenheit) {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const renderWeatherIcon = (code?: number, isDay: boolean = true, size: number = 24) => {
    if (code === undefined) return <Sun size={size} className={styles.weatherIconPrimary} />;
    switch (code) {
      case 0:
        return isDay ? (
          <Sun size={size} className={styles.weatherIconPrimary} />
        ) : (
          <Moon size={size} className={styles.weatherIconPrimary} />
        );
      case 1:
      case 2:
        return <CloudSun size={size} className={styles.weatherIconPrimary} />;
      case 3:
        return <Cloud size={size} className={styles.weatherIconPrimary} />;
      case 45:
      case 48:
        return <CloudFog size={size} className={styles.weatherIconPrimary} />;
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return <CloudRain size={size} className={styles.weatherIconPrimary} />;
      case 71:
      case 73:
      case 75:
        return <CloudSnow size={size} className={styles.weatherIconPrimary} />;
      case 95:
      case 96:
      case 99:
        return <CloudLightning size={size} className={styles.weatherIconPrimary} />;
      default:
        return <CloudSun size={size} className={styles.weatherIconPrimary} />;
    }
  };

  // 8 Hourly Forecast Slots (Now, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM, 12 AM, 3 AM)
  const defaultHourlySlots = [
    { label: "Now", temp: weather?.current.temperature ?? 28, code: weather?.current.weatherCode ?? 0, isDay: !isNight, active: true },
    { label: "9 AM", temp: 29, code: 0, isDay: true, active: false },
    { label: "12 PM", temp: 32, code: 1, isDay: true, active: false },
    { label: "3 PM", temp: 34, code: 2, isDay: true, active: false },
    { label: "6 PM", temp: 31, code: 1, isDay: true, active: false },
    { label: "9 PM", temp: 27, code: 0, isDay: false, active: false },
    { label: "12 AM", temp: 26, code: 0, isDay: false, active: false },
    { label: "3 AM", temp: 25, code: 0, isDay: false, active: false },
  ];

  // SVG Dial Geometry for 60 Ticks
  const dialTicks = Array.from({ length: 60 }).map((_, i) => {
    const angle = i * 6; // 360 / 60 = 6 deg
    const isMajor = i % 5 === 0;
    const isPassed = i <= time.secondsNum;
    return {
      index: i,
      angle,
      isMajor,
      isPassed,
    };
  });

  const cityDisplay = cityName || "Patna";

  return (
    <div className={styles.stationContainer}>
      {/* 1. HERO TOP STAGE WITH PANORAMIC SUNSET BACKGROUND */}
      <div className={styles.heroStage}>
        <div className={styles.heroBackground} />
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          {/* Header Greeting Cluster */}
          <div className={styles.greetingRow}>
            <div className={styles.greetingTextCluster}>
              <span className={styles.scriptGreeting}>{getGreeting()}</span>
              <h1 className={styles.cityNameTitle}>{cityDisplay}</h1>
              <p className={styles.greetingSubtitle}>
                Clear skies and a beautiful start to your day!
              </p>
            </div>
          </div>

          {/* Main Hero: Circular Dial Clock & Weather Card */}
          <div className={styles.displayRow}>
            {/* CIRCULAR GAUGE CLOCK */}
            <div className={styles.clockGaugeWrapper}>
              <svg viewBox="0 0 240 240" className={styles.gaugeSvg}>
                <defs>
                  <linearGradient id="cyanArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="glowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                  <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Ambient back circle */}
                <circle
                  cx="120"
                  cy="120"
                  r="108"
                  fill="rgba(8, 14, 26, 0.75)"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1.5"
                />

                {/* Glowing neon arc for seconds */}
                <circle
                  cx="120"
                  cy="120"
                  r="104"
                  fill="none"
                  stroke="url(#cyanArcGrad)"
                  strokeWidth="3.5"
                  strokeDasharray={`${(time.secondsNum / 60) * 653} 653`}
                  strokeLinecap="round"
                  transform="rotate(-90 120 120)"
                  filter="url(#neonBlur)"
                />

                {/* 60 Radial Dial Ticks */}
                {dialTicks.map((tick) => (
                  <line
                    key={tick.index}
                    x1="120"
                    y1={tick.isMajor ? "16" : "20"}
                    x2="120"
                    y2="25"
                    stroke={
                      tick.isPassed
                        ? "#38bdf8"
                        : tick.isMajor
                        ? "rgba(255, 255, 255, 0.45)"
                        : "rgba(255, 255, 255, 0.15)"
                    }
                    strokeWidth={tick.isMajor ? "2" : "1"}
                    strokeLinecap="round"
                    transform={`rotate(${tick.angle} 120 120)`}
                  />
                ))}

                {/* Inner subtle glow ring */}
                <circle
                  cx="120"
                  cy="120"
                  r="86"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.12)"
                  strokeWidth="1"
                />
              </svg>

              {/* Inside Content */}
              <div className={styles.clockInnerContent}>
                <div className={styles.clockIconBox}>
                  {isNight ? <Moon size={22} /> : <Sun size={22} />}
                </div>

                <span className={styles.clockGreetingSub}>
                  {getGreeting()} • {cityDisplay}
                </span>

                <div className={styles.digitalTime}>
                  {time.hoursStr}:{time.minutesStr}
                </div>

                {time.periodStr && (
                  <div className={styles.ampmText}>{time.periodStr}</div>
                )}

                <div className={styles.clockDateStr}>{time.dateFullStr}</div>
              </div>
            </div>

            {/* DOCKED WEATHER CARD */}
            <div className={styles.weatherCard}>
              <div className={styles.weatherTopRow}>
                <div className={styles.weatherGraphic}>
                  {renderWeatherIcon(weather?.current.weatherCode, weather?.current.isDay, 34)}
                </div>

                <button
                  className={styles.expandBtn}
                  onClick={() => {
                    soundFX.playClick();
                    onOpenWeatherDetail?.();
                  }}
                  title="Expand weather details"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

              <div className={styles.tempSection}>
                <div className={styles.tempValue}>
                  {formatTemp(weather?.current.temperature)}
                </div>
                <div className={styles.conditionLabel}>
                  {weather?.current.conditionText || "Clear Sky"}
                </div>
                <div className={styles.feelsLikeLabel}>
                  Feels like {formatTemp(weather?.current.apparentTemperature || 33)}
                </div>
              </div>

              {/* 4-Row Telemetry Matrix */}
              <div className={styles.telemetryMatrix}>
                <div className={styles.telemetryRow}>
                  <span className={styles.telemetryLeft}>
                    <Droplets size={12} color="#38bdf8" />
                    <span>Humidity</span>
                  </span>
                  <span className={styles.telemetryVal}>
                    {weather?.current.humidity ?? 68}%
                  </span>
                </div>

                <div className={styles.telemetryRow}>
                  <span className={styles.telemetryLeft}>
                    <Wind size={12} color="#06b6d4" />
                    <span>Wind</span>
                  </span>
                  <span className={styles.telemetryVal}>
                    {weather?.current.windSpeed ?? 0.8} km/h
                  </span>
                </div>

                <div className={styles.telemetryRow}>
                  <span className={styles.telemetryLeft}>
                    <Sun size={12} color="#f97316" />
                    <span>UV Index</span>
                  </span>
                  <span className={styles.uvHighBadge}>
                    {weather?.current.uvIndex ?? 7} High
                  </span>
                </div>

                <div className={styles.telemetryRow}>
                  <span className={styles.telemetryLeft}>
                    <Gauge size={12} color="#818cf8" />
                    <span>Pressure</span>
                  </span>
                  <span className={styles.telemetryVal}>
                    {weather?.current.surfacePressure ?? 1008} hPa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM HOURLY FORECAST & SOLAR CONSOLE */}
      <div className={styles.bottomConsole}>
        {/* Header */}
        <div className={styles.consoleHeader}>
          <div className={styles.headerTitle}>
            <TrendingUp size={14} className={styles.weatherHeaderIcon} />
            <span>Today&apos;s Weather • {cityDisplay}</span>
          </div>

          <div className={styles.solarPills}>
            <div className={styles.solarItem}>
              <Sunrise size={13} className={styles.solarIcon} />
              <span>
                Sunrise <strong>{weather?.sunrise || "05:48 AM"}</strong>
              </span>
            </div>
            <div className={styles.solarItem}>
              <Sunset size={13} className={styles.solarIcon} />
              <span>
                Sunset <strong>{weather?.sunset || "05:21 PM"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 8 Hourly Forecast Cards */}
        <div className={styles.hourlyGrid}>
          {defaultHourlySlots.map((slot, idx) => (
            <div
              key={idx}
              className={`${styles.hourlyCard} ${slot.active ? styles.activeHourlyCard : ""}`}
              onClick={() => soundFX.playClick()}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.hourLabel}>{slot.label}</span>
              <span className={styles.hourIcon}>
                {renderWeatherIcon(slot.code, slot.isDay, 18)}
              </span>
              <span className={styles.hourTemp}>
                {formatTempDegreeOnly(slot.temp)}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Ticker Description */}
        <div className={styles.tickerBar}>
          <Wind size={13} className={styles.tickerIcon} />
          <p className={styles.tickerText}>
            {weather?.shortDescription ||
              `Clear sky in ${cityDisplay} with temperature around 28°C. Humidity is 68% and wind speed is 1 km/h. Comfortable morning.`}
          </p>
          <ChevronRight size={13} className={styles.tickerArrow} />
        </div>
      </div>
    </div>
  );
};
