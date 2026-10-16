"use client";

import React, { useState } from "react";
import styles from "@/app/page.module.css";
import { Newspaper, X, ImageOff, ExternalLink } from "lucide-react";
import { NewsItem } from "@/types";
import { soundFX } from "@/utils/audio";

interface NewsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  news: NewsItem[];
}

export const NewsListModal: React.FC<NewsListModalProps> = ({
  isOpen,
  onClose,
  cityName,
  news,
}) => {
  const [modalImgErrors, setModalImgErrors] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Newspaper size={18} color="#38bdf8" />
            <span>All Regional & Global Headlines • {cityName}</span>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {news.length === 0 ? (
            <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
              No news items available right now.
            </div>
          ) : (
            news.map((item, idx) => {
              const itemKey = item.id || String(idx);
              const hasValidImage = item.imageUrl && !modalImgErrors[itemKey];

              return (
                <a
                  key={itemKey}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundFX.playClick()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "0.75rem 1rem",
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: "#38bdf8",
                      width: "24px",
                      flexShrink: 0,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <strong style={{ color: "#cbd5e1" }}>{item.source}</strong> • {item.pubDate}
                      <ExternalLink size={10} style={{ opacity: 0.7 }} />
                    </div>
                    <div
                      style={{
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        color: "#f8fafc",
                        marginTop: "2px",
                        lineHeight: 1.35,
                      }}
                    >
                      {item.title}
                    </div>
                  </div>

                  {hasValidImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      onError={() =>
                        setModalImgErrors((prev) => ({ ...prev, [itemKey]: true }))
                      }
                      style={{
                        width: "64px",
                        height: "46px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        flexShrink: 0,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "64px",
                        height: "46px",
                        borderRadius: "8px",
                        background: "rgba(17, 24, 39, 0.7)",
                        border: "1px dashed rgba(255, 255, 255, 0.14)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2px",
                        flexShrink: 0,
                        color: "#64748b",
                        fontSize: "0.52rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        userSelect: "none",
                      }}
                    >
                      <ImageOff size={13} style={{ color: "#475569" }} />
                      <span>NO IMAGE</span>
                    </div>
                  )}
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
