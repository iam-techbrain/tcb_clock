"use client";

import React from "react";
import styles from "./RightRegionalPulse.module.css";
import { AIBriefingData, GeoLocationData } from "@/types";
import { ExternalLink, MapPin, Globe } from "lucide-react";

interface RightRegionalPulseProps {
  briefing: AIBriefingData | null;
  geo: GeoLocationData | null;
  loading: boolean;
}

export const RightRegionalPulse: React.FC<RightRegionalPulseProps> = ({
  briefing,
  geo,
  loading,
}) => {
  // Take next 5 latest news items (indices 5 to 10) to complete the 10 daily latest stories
  const newsStories = (briefing?.news || []).slice(5, 10);
  const displayStories = newsStories.length > 0 ? newsStories : (briefing?.news || []).slice(0, 5);

  return (
    <div className={styles.pulseCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleRow}>
          <Globe size={12} className={styles.globeIcon} />
          <h3 className={styles.cardTitle}>REGIONAL RADAR</h3>
          <span className={styles.countBadge}>6–10</span>
        </div>

        <span className={styles.dailyBadge}>DAILY LATEST</span>
      </div>

      {/* 5 News items filling vertical height */}
      <div className={styles.newsList}>
        {loading && !briefing ? (
          <div className={styles.skeletonList}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : displayStories.length > 0 ? (
          displayStories.map((item, index) => (
            <a
              key={item.id || index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.newsItem}
            >
              <div className={styles.itemHeader}>
                <span className={styles.indexTag}>
                  {String(index + 6).padStart(2, "0")}
                </span>
                <span className={styles.sourceBadge}>{item.source}</span>
                <span className={styles.dotSeparator}>•</span>
                <span className={styles.timeTag}>{item.pubDate}</span>
                <ExternalLink size={11} className={styles.extIcon} />
              </div>
              <h4 className={styles.itemTitle}>
                {item.title}
              </h4>
            </a>
          ))
        ) : (
          <div className={styles.emptyState}>Syncing regional radar...</div>
        )}
      </div>

      {/* Area & Network Telemetry Footer (Gracefully fills the bottom) */}
      <div className={styles.cardFooter}>
        <div className={styles.geoFooterRow}>
          <div className={styles.geoPill}>
            <MapPin size={11} className={styles.geoIcon} />
            <span className={styles.geoText}>
              {geo?.city || "Detecting"}, {geo?.region || geo?.country || "India"}
            </span>
          </div>
          <div className={styles.ipPill}>
            <span>IP: <strong>{geo?.ip || "Auto"}</strong></span>
            {geo?.connection?.isp && (
              <span>• {geo.connection.isp.split(" ")[0]}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
