"use client";

import React, { useState } from "react";
import styles from "./RightRegionalPulse.module.css";
import { AIBriefingData, GeoLocationData } from "@/types";
import { ExternalLink, Crosshair, ArrowRight, Maximize2, MapPin, ImageOff } from "lucide-react";
import { soundFX } from "@/utils/audio";

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

  // Format real dynamic coordinates
  const latStr = `${Math.abs(latitude).toFixed(2)}° ${latitude >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(longitude).toFixed(2)}° ${longitude >= 0 ? "E" : "W"}`;

  // Doppler reflectivity based on current weather condition
  const hasPrecipitation = weatherCode >= 50 || weatherCode === 45 || weatherCode === 48;
  const isStormy = weatherCode >= 95;

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

      {/* 2. DYNAMIC REGIONAL WEATHER RADAR WIDGET (No hardcoded states) */}
      <div className={styles.radarWidget}>
        <div className={styles.radarMapBg} />

        {/* Dynamic Vector Radar Screen */}
        <svg viewBox="0 0 320 120" className={styles.radarSvgOverlay}>
          <defs>
            <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sweepBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Coordinate Grid & Radar Distance Rings (30km, 60km, 90km) */}
          <circle
            cx="160"
            cy="60"
            r="28"
            fill="none"
            stroke="rgba(56, 189, 248, 0.15)"
            strokeWidth="0.8"
            strokeDasharray="2 3"
          />
          <circle
            cx="160"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(56, 189, 248, 0.2)"
            strokeWidth="0.8"
          />
          <circle
            cx="160"
            cy="60"
            r="85"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />

          {/* Crosshairs */}
          <line
            x1="160"
            y1="5"
            x2="160"
            y2="115"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="0.8"
          />
          <line
            x1="10"
            y1="60"
            x2="310"
            y2="60"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="0.8"
          />

          {/* Range markings */}
          <text x="164" y="35" fill="rgba(255, 255, 255, 0.25)" fontSize="6" fontFamily="monospace">
            30km
          </text>
          <text x="164" y="11" fill="rgba(255, 255, 255, 0.25)" fontSize="6" fontFamily="monospace">
            60km
          </text>

          {/* Dynamic Geographic Sector Labels based on actual City & Region */}
          <text x="15" y="20" fill="rgba(56, 189, 248, 0.45)" fontSize="7" fontWeight="700">
            {regionLabel || countryLabel} NW
          </text>
          <text x="15" y="110" fill="rgba(255, 255, 255, 0.3)" fontSize="7">
            {latStr} • {lonStr}
          </text>
          <text x="240" y="20" fill="rgba(255, 255, 255, 0.35)" fontSize="7" fontWeight="600">
            {countryLabel}
          </text>

          {/* Dynamic Weather Precipitation Layer (Doppler Blobs) */}
          <ellipse
            cx="220"
            cy="52"
            rx="35"
            ry="24"
            fill="#22c55e"
            opacity={hasPrecipitation ? 0.45 : 0.22}
            filter="blur(7px)"
          />
          <ellipse
            cx="225"
            cy="50"
            rx="20"
            ry="14"
            fill="#eab308"
            opacity={hasPrecipitation ? 0.55 : 0.3}
            filter="blur(5px)"
          />
          {isStormy && (
            <ellipse
              cx="228"
              cy="48"
              rx="12"
              ry="8"
              fill="#ef4444"
              opacity="0.75"
              filter="blur(3px)"
            />
          )}

          {/* Rotating Radar Sweep Line */}
          <g transform="translate(160, 60)">
            <line
              x1="0"
              y1="0"
              x2="75"
              y2="-40"
              stroke="url(#sweepBeam)"
              strokeWidth="1.5"
              style={{
                transformOrigin: "0 0",
                animation: "radarSweep 5s linear infinite",
              }}
            />
          </g>
        </svg>

        {/* Dynamic Center City Beacon */}
        <div className={styles.radarCityPin}>
          <span className={styles.radarPinDot} />
          <span className={styles.radarPinText}>{cityLabel}</span>
        </div>

        {/* Expand / Radar Action */}
        <button
          className={styles.radarExpandBtn}
          onClick={() => {
            soundFX.playClick();
            onOpenRadar?.();
          }}
          title="Open live radar map"
        >
          <Maximize2 size={12} />
        </button>

        {/* Doppler Reflectivity Legend */}
        <div className={styles.radarLegend}>
          <div className={styles.legendItem}>
            <span className={styles.legendColor_heavy} />
            <span>Heavy</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendColor_mod} />
            <span>Moderate</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendColor_light} />
            <span>Light</span>
          </div>
        </div>
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
