"use client";

import React, { useState } from "react";
import styles from "./RightRegionalPulse.module.css";
import { AIBriefingData, GeoLocationData } from "@/types";
import {
  ExternalLink,
  Crosshair,
  ArrowRight,
  Maximize2,
  MapPin,
  ImageOff,
  Wind,
  CloudRain,
  Cloud,
  Waves,
} from "lucide-react";
import { soundFX } from "@/utils/audio";

export type WeatherMapLayer = "wind" | "radar" | "clouds" | "waves";

interface RightRegionalPulseProps {
  briefing: AIBriefingData | null;
  geo: GeoLocationData | null;
  loading: boolean;
  cityName?: string;
  regionName?: string;
  countryName?: string;
  latitude?: number;
  longitude?: number;
  weatherCode?: number;
  onOpenRadar?: () => void;
  onDailyLatest?: () => void;
}

export const RightRegionalPulse: React.FC<RightRegionalPulseProps> = ({
  briefing,
  geo,
  loading,
  cityName,
  regionName,
  countryName,
  latitude = 25.5941,
  longitude = 85.1376,
  weatherCode = 0,
  onOpenRadar,
  onDailyLatest,
}) => {
  const allNews = briefing?.news || [];
  const displayStories = allNews.length >= 10 ? allNews.slice(5, 10) : allNews.slice(0, 5);

  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [activeLayer, setActiveLayer] = useState<WeatherMapLayer>("wind");

  const handleImageError = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  const getBadgeClass = (index: number) => {
    switch (index) {
      case 0:
        return styles.badge_6;
      case 1:
        return styles.badge_7;
      case 2:
        return styles.badge_8;
      case 3:
        return styles.badge_9;
      case 4:
        return styles.badge_10;
      default:
        return styles.badge_6;
    }
  };

  const cityLabel = cityName || geo?.city || briefing?.city || "Local";
  const regionLabel = regionName || geo?.region || briefing?.region || "";
  const countryLabel = countryName || geo?.country || briefing?.country || "Global";

  // Dynamic live weather map iframe URL (Windy ECMWF engine with live wind particles, clouds, radar & tsunami/waves)
  const mapIframeUrl = `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&detailLat=${latitude}&detailLon=${longitude}&width=100%25&height=100%25&zoom=5&level=surface&overlay=${activeLayer}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

  const handleLayerSwitch = (layer: WeatherMapLayer) => {
    soundFX.playClick();
    setActiveLayer(layer);
  };

  return (
    <div className={styles.pulseCard}>
      {/* 1. Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleRow}>
          <Crosshair size={15} className={styles.radarIcon} />
          <h3 className={styles.cardTitle}>REGIONAL RADAR</h3>
          <span className={styles.countBadge}>6–10</span>
        </div>

        <button
          className={styles.dailyLatestBtn}
          onClick={() => {
            soundFX.playClick();
            onDailyLatest?.();
          }}
          title="View all daily regional news"
        >
          <span>Daily Latest</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* 2. LIVE INTERACTIVE WEATHER RADAR MAP (Hawa, Badal, Sunami / Waves, Barish) */}
      <div className={styles.radarWidget}>
        {/* Layer Controls Bar */}
        <div className={styles.mapLayerBar}>
          <button
            className={`${styles.layerBtn} ${activeLayer === "wind" ? styles.activeLayerBtn : ""}`}
            onClick={() => handleLayerSwitch("wind")}
            title="Live Wind Streams (Hawa)"
          >
            <Wind size={10} />
            <span>Wind</span>
          </button>

          <button
            className={`${styles.layerBtn} ${activeLayer === "radar" ? styles.activeLayerBtn : ""}`}
            onClick={() => handleLayerSwitch("radar")}
            title="Live Doppler Weather Radar (Barish)"
          >
            <CloudRain size={10} />
            <span>Radar</span>
          </button>

          <button
            className={`${styles.layerBtn} ${activeLayer === "clouds" ? styles.activeLayerBtn : ""}`}
            onClick={() => handleLayerSwitch("clouds")}
            title="Live Satellite Clouds (Badal)"
          >
            <Cloud size={10} />
            <span>Clouds</span>
          </button>

          <button
            className={`${styles.layerBtn} ${activeLayer === "waves" ? styles.activeLayerBtn : ""}`}
            onClick={() => handleLayerSwitch("waves")}
            title="Sea Waves & Tsunami / Cyclone Track"
          >
            <Waves size={10} />
            <span>Waves</span>
          </button>
        </div>

        {/* Live Weather Map Iframe */}
        <iframe
          src={mapIframeUrl}
          className={styles.radarIframe}
          title={`Live Weather Radar for ${cityLabel}`}
          loading="lazy"
          allow="geolocation"
        />

        {/* Fullscreen / Expand Trigger */}
        <button
          className={styles.radarExpandBtn}
          onClick={() => {
            soundFX.playClick();
            onOpenRadar?.();
          }}
          title="Expand live interactive weather map"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      {/* 3. 5 Regional Stories (06–10) with designed NO IMAGE placeholder */}
      <div className={styles.newsList}>
        {loading && allNews.length === 0 ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </>
        ) : displayStories.length > 0 ? (
          displayStories.map((item, index) => {
            const itemKey = item.id || `right-${index}`;
            const hasValidImage = item.imageUrl && !failedImages[itemKey];

            return (
              <a
                key={itemKey}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.newsItem}
                onClick={() => soundFX.playClick()}
              >
                <div className={styles.itemLeft}>
                  <span className={`${styles.indexBadge} ${getBadgeClass(index)}`}>
                    {String(index + 6).padStart(2, "0")}
                  </span>

                  <div className={styles.itemContent}>
                    <div className={styles.metaRow}>
                      <span className={styles.sourcePill}>{item.source}</span>
                      <span className={styles.timeText}>{item.pubDate}</span>
                      <ExternalLink size={11} className={styles.extIcon} />
                    </div>

                    <h4 className={styles.newsTitle}>{item.title}</h4>
                  </div>
                </div>

                {hasValidImage ? (
                  <div className={styles.thumbWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className={styles.thumbImg}
                      loading="lazy"
                      onError={() => handleImageError(itemKey)}
                    />
                  </div>
                ) : (
                  <div className={styles.noImagePlaceholder} title="No preview available">
                    <ImageOff size={13} className={styles.noImageIcon} />
                    <span>NO IMAGE</span>
                  </div>
                )}
              </a>
            );
          })
        ) : (
          <div style={{ color: "#64748b", fontSize: "0.8rem", padding: "1rem" }}>
            Syncing regional radar...
          </div>
        )}
      </div>

      {/* 4. Dynamic Area & Network Telemetry Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.footerLocation}>
          <MapPin size={12} className={styles.footerPin} />
          <span>
            {cityLabel}{regionLabel ? `, ${regionLabel}` : (countryLabel ? `, ${countryLabel}` : "")}
          </span>
        </div>

        <div className={styles.footerIp}>
          <span>
            IP: <strong>{geo?.ip || "103.47.218.206"}</strong>
          </span>
          {geo?.connection?.isp ? (
            <span> • {geo.connection.isp.split(" ")[0]}</span>
          ) : (
            <span> • Connected</span>
          )}
        </div>
      </div>
    </div>
  );
};
