"use client";

import React from "react";
import styles from "./LeftNewsFeed.module.css";
import { NewsItem } from "@/types";
import { ExternalLink, RefreshCw, Radio } from "lucide-react";

interface LeftNewsFeedProps {
  news: NewsItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const LeftNewsFeed: React.FC<LeftNewsFeedProps> = ({
  news,
  loading,
  onRefresh,
}) => {
  // Take first 5 latest news items
  const displayNews = news.slice(0, 5);

  return (
    <div className={styles.newsCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleRow}>
          <Radio size={12} className={styles.radioIcon} />
          <h3 className={styles.cardTitle}>LATEST HEADLINES</h3>
          <span className={styles.countBadge}>1–5</span>
        </div>

        <button
          className={`${styles.refreshBtn} ${loading ? styles.refreshing : ""}`}
          onClick={onRefresh}
          disabled={loading}
          title="Refresh latest news"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* 5 News Items with professional dark/light contrast */}
      <div className={styles.newsList}>
        {loading && news.length === 0 ? (
          <div className={styles.skeletonList}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : displayNews.length > 0 ? (
          displayNews.map((item, index) => (
            <a
              key={item.id || index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.newsItem}
            >
              <div className={styles.itemHeader}>
                <span className={styles.indexTag}>
                  {String(index + 1).padStart(2, "0")}
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
          <div className={styles.emptyState}>No recent updates available.</div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <span className={styles.livePulseDot} />
        <span className={styles.footerText}>REAL-TIME REGIONAL FEED • VERIFIED SOURCES</span>
      </div>
    </div>
  );
};
