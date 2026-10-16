"use client";

import React, { useState } from "react";
import styles from "./LeftNewsFeed.module.css";
import { NewsItem } from "@/types";
import { ExternalLink, Sparkles, ArrowRight, ImageOff } from "lucide-react";
import { soundFX } from "@/utils/audio";

interface LeftNewsFeedProps {
  news: NewsItem[];
  loading: boolean;
  onRefresh?: () => void;
  onSeeAll?: () => void;
}

export const LeftNewsFeed: React.FC<LeftNewsFeedProps> = ({
  news,
  loading,
  onSeeAll,
}) => {
  const displayNews = news.slice(0, 5);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  const getBadgeClass = (index: number) => {
    switch (index) {
      case 0:
        return styles.badge_1;
      case 1:
        return styles.badge_2;
      case 2:
        return styles.badge_3;
      case 3:
        return styles.badge_4;
      case 4:
        return styles.badge_5;
      default:
        return styles.badge_1;
    }
  };

  return (
    <div className={styles.newsCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleRow}>
          <Sparkles size={15} className={styles.radarIcon} />
          <h3 className={styles.cardTitle}>LATEST HEADLINES</h3>
          <span className={styles.countBadge}>1–5</span>
        </div>

        <button
          className={styles.seeAllBtn}
          onClick={() => {
            soundFX.playClick();
            onSeeAll?.();
          }}
          title="See all news"
        >
          <span>See All</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* 5 News Items */}
      <div className={styles.newsList}>
        {loading && news.length === 0 ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </>
        ) : displayNews.length > 0 ? (
          displayNews.map((item, index) => {
            const itemKey = item.id || `left-${index}`;
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
                    {String(index + 1).padStart(2, "0")}
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
            No recent updates available.
          </div>
        )}
      </div>
    </div>
  );
};
