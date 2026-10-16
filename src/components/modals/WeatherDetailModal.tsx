"use client";

import React from "react";
import styles from "@/app/page.module.css";
import { CloudSun, X } from "lucide-react";
import { WeatherData } from "@/types";

interface WeatherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  weather: WeatherData | null;
  weatherNarrative?: string;
  lifestyleTip?: string;
}

export const WeatherDetailModal: React.FC<WeatherDetailModalProps> = ({
  isOpen,
  onClose,
  cityName,
  weather,
  weatherNarrative,
  lifestyleTip,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <CloudSun size={18} color="#f59e0b" />
            <span>Atmospheric Telemetry & Forecast • {cityName}</span>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>Temperature</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff" }}>
                {weather?.current.temperature ?? 28}°C
              </div>
              <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>
                Feels like {weather?.current.apparentTemperature ?? 33}°C
              </div>
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>Atmospheric Conditions</div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  marginTop: "4px",
                }}
              >
                {weather?.current.conditionText || "Clear Sky"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#f59e0b" }}>
                UV Index: {weather?.current.uvIndex ?? 7} (High)
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#38bdf8",
                marginBottom: "0.4rem",
              }}
            >
              AI Advisory & Environmental Summary
            </div>
            <p style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.5 }}>
              {weatherNarrative || weather?.shortDescription}
            </p>
            {lifestyleTip && (
              <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                💡 <strong>Tip:</strong> {lifestyleTip}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
