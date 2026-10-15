"use client";

import React, { useState } from "react";
import styles from "./WeatherCard.module.css";
import { WeatherData } from "@/types";
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog, 
  Moon, 
  Wind, 
  Droplets, 
  Gauge, 
  ThermometerSun, 
  Sunrise, 
  Sunset,
  Sparkles
} from "lucide-react";

interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
  cityName: string;
  regionName: string;
  countryName: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  loading,
  cityName,
  regionName,
  countryName,
}) => {
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  const formatTemp = (celsius: number) => {
    if (isFahrenheit) {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const renderWeatherIcon = (code: number, isDay: boolean, size: number = 36) => {
    switch (code) {
      case 0:
        return isDay ? <Sun size={size} className={styles.iconSun} /> : <Moon size={size} className={styles.iconMoon} />;
      case 1:
      case 2:
        return <CloudSun size={size} className={styles.iconCloudSun} />;
      case 3:
        return <Cloud size={size} className={styles.iconCloud} />;
      case 45:
      case 48:
        return <CloudFog size={size} className={styles.iconFog} />;
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return <CloudRain size={size} className={styles.iconRain} />;
      case 71:
      case 73:
      case 75:
        return <CloudSnow size={size} className={styles.iconSnow} />;
      case 95:
      case 96:
      case 99:
        return <CloudLightning size={size} className={styles.iconThunder} />;
      default:
        return <CloudSun size={size} className={styles.iconCloudSun} />;
    }
  };

  if (loading && !weather) {
    return (
      <div className={styles.weatherCard}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonTemp} />
        <div className={styles.skeletonDesc} />
        <div className={styles.skeletonGrid} />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className={styles.weatherCard}>
      {/* Header bar */}
      <div className={styles.headerRow}>
        <div>
          <span className={styles.cardTag}>ATMOSPHERIC SENSOR</span>
          <h3 className={styles.locationTitle}>
            {cityName}{regionName ? `, ${regionName}` : ""}{countryName ? ` • ${countryName}` : ""}
          </h3>
        </div>

        <button
          className={styles.unitToggle}
          onClick={() => setIsFahrenheit(!isFahrenheit)}
          title="Toggle Celsius / Fahrenheit"
        >
          {isFahrenheit ? "°F" : "°C"}
        </button>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className={styles.mainDisplay}>
        <div className={styles.weatherVisual}>
          {renderWeatherIcon(weather.current.weatherCode, weather.current.isDay, 42)}
        </div>

        <div className={styles.tempBox}>
          <div className={styles.temperature}>
            {formatTemp(weather.current.temperature)}
          </div>
          <div className={styles.conditionStatus}>
            {weather.current.conditionText}
          </div>
        </div>

        <div className={styles.feelsLikeBox}>
          <span className={styles.statLabel}>FEELS LIKE</span>
          <span className={styles.statVal}>
            {formatTemp(weather.current.apparentTemperature)}
          </span>
        </div>
      </div>

      {/* AI Weather Short Description */}
      <div className={styles.aiDescriptionCard}>
        <div className={styles.aiDescHeader}>
          <Sparkles size={14} className={styles.sparkleIcon} />
          <span>AI WEATHER INTELLIGENCE</span>
        </div>
        <p className={styles.aiDescText}>
          {weather.shortDescription}
        </p>
        {weather.aiAdvisory && (
          <div className={styles.aiAdvisoryTag}>
            <span>Advisory:</span> {weather.aiAdvisory}
          </div>
        )}
      </div>

      {/* Atmospheric Metrics 4-Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <Droplets size={16} className={styles.metricIcon} />
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Humidity</span>
            <span className={styles.metricValue}>{weather.current.humidity}%</span>
          </div>
        </div>

        <div className={styles.metricItem}>
          <Wind size={16} className={styles.metricIcon} />
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Wind</span>
            <span className={styles.metricValue}>{weather.current.windSpeed} km/h</span>
          </div>
        </div>

        <div className={styles.metricItem}>
          <ThermometerSun size={16} className={styles.metricIcon} />
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>UV Index</span>
            <span className={styles.metricValue}>{weather.current.uvIndex ?? "3"}</span>
          </div>
        </div>

        <div className={styles.metricItem}>
          <Gauge size={16} className={styles.metricIcon} />
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Pressure</span>
            <span className={styles.metricValue}>{weather.current.surfacePressure ?? 1012} hPa</span>
          </div>
        </div>
      </div>

      {/* Sun Times */}
      {(weather.sunrise || weather.sunset) && (
        <div className={styles.sunRow}>
          {weather.sunrise && (
            <div className={styles.sunItem}>
              <Sunrise size={14} className={styles.sunIcon} />
              <span>Sunrise: <strong>{weather.sunrise}</strong></span>
            </div>
          )}
          {weather.sunset && (
            <div className={styles.sunItem}>
              <Sunset size={14} className={styles.sunIcon} />
              <span>Sunset: <strong>{weather.sunset}</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
