"use client";

import React, { useState } from "react";
import styles from "./AIBriefingCard.module.css";
import { AIBriefingData, GeoLocationData } from "@/types";
import { 
  Radio, 
  ExternalLink, 
  Cpu, 
  RefreshCw, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  Layers
} from "lucide-react";

interface AIBriefingCardProps {
  briefing: AIBriefingData | null;
  geo: GeoLocationData | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AIBriefingCard: React.FC<AIBriefingCardProps> = ({
  briefing,
  geo,
  loading,
  onRefresh,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const categories = ["All", "Local", "Governance", "Technology", "Business", "Culture"];

  const filteredNews = briefing?.news.filter((item) => {
    if (selectedFilter === "All") return true;
    return item.category === selectedFilter;
  }) || [];

  return (
    <div className={styles.briefingCard}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.tag}>
            <Radio size={14} className={styles.pulseIcon} />
            <span>AI REGIONAL INTELLIGENCE</span>
          </div>
          <h3 className={styles.mainTitle}>
            {geo ? `${geo.city} Regional Pulse` : "Regional Briefing"}
          </h3>
        </div>

        <button
          className={`${styles.refreshBtn} ${loading ? styles.refreshing : ""}`}
          onClick={onRefresh}
          disabled={loading}
          title="Refresh intelligence and news"
        >
          <RefreshCw size={14} />
          <span>{loading ? "SYNCING..." : "LIVE SYNC"}</span>
        </button>
      </div>

      {/* Geolocation Hardware & Network Insight Strip from ipwho.is */}
      {geo && (
        <div className={styles.geoStrip}>
          <div className={styles.geoItem}>
            <MapPin size={13} className={styles.geoIcon} />
            <span>
              <strong>IP:</strong> {geo.ip}
            </span>
          </div>
          <div className={styles.geoItem}>
            <Layers size={13} className={styles.geoIcon} />
            <span>
              <strong>Region:</strong> {geo.region} ({geo.postal || "N/A"})
            </span>
          </div>
          {geo.connection?.isp && (
            <div className={styles.geoItem}>
              <Cpu size={13} className={styles.geoIcon} />
              <span>
                <strong>ISP:</strong> {geo.connection.isp.split(" ")[0]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* AI Area Pulse & Lifestyle Brief */}
      {briefing && (
        <div className={styles.pulseBox}>
          <div className={styles.pulseTop}>
            <div className={styles.pulseScoreWrapper}>
              <TrendingUp size={18} className={styles.trendIcon} />
              <div className={styles.scoreText}>
                <span className={styles.scoreVal}>{briefing.areaPulseScore}%</span>
                <span className={styles.scoreLabel}>Area Activity Index</span>
              </div>
            </div>
            <div className={styles.pulseStatusBadge}>
              <ShieldCheck size={14} />
              <span>{briefing.areaPulseLabel}</span>
            </div>
          </div>

          <div className={styles.narrativeWrap}>
            <p className={styles.weatherNarrative}>
              {briefing.weatherNarrative}
            </p>
            {briefing.lifestyleTip && (
              <div className={styles.lifestyleTipBox}>
                <Building2 size={14} className={styles.tipIcon} />
                <span>
                  <strong>AI Commute / Lifestyle Advice:</strong> {briefing.lifestyleTip}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${selectedFilter === cat ? styles.activeFilter : ""}`}
            onClick={() => setSelectedFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Local News Feed List */}
      <div className={styles.newsList}>
        {loading && !briefing ? (
          <div className={styles.skeletonNews}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
          </div>
        ) : filteredNews.length > 0 ? (
          filteredNews.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.newsRow}
            >
              <div className={styles.newsMeta}>
                <span className={`${styles.catBadge} ${styles[`cat_${item.category.toLowerCase()}`] || ""}`}>
                  {item.category}
                </span>
                <span className={styles.sourceName}>{item.source}</span>
                <span className={styles.dotSeparator}>•</span>
                <span className={styles.pubTime}>{item.pubDate}</span>
              </div>
              <h4 className={styles.newsHeadline}>
                {item.title}
                <ExternalLink size={13} className={styles.linkIcon} />
              </h4>
            </a>
          ))
        ) : (
          <div className={styles.emptyFeed}>
            No stories matching {selectedFilter}. Try another category or refresh.
          </div>
        )}
      </div>

      {/* Footer Auto-Update status */}
      <div className={styles.footerInfo}>
        <span className={styles.autoStatus}>● Auto-refreshes periodically • No page reload needed</span>
        <span className={styles.poweredBy}>Powered by ipwho.is & Real-time AI Radar</span>
      </div>
    </div>
  );
};
