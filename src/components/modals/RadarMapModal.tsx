"use client";

import React, { useState } from "react";
import styles from "@/app/page.module.css";
import { Map, X } from "lucide-react";
import { soundFX } from "@/utils/audio";
import { LocationMeta } from "@/types";

interface RadarMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationMeta;
}

export const RadarMapModal: React.FC<RadarMapModalProps> = ({
  isOpen,
  onClose,
  location,
}) => {
  const [mapLayer, setMapLayer] = useState<"wind" | "radar" | "clouds" | "waves">("wind");

  if (!isOpen) return null;

  const handleLayerSwitch = (layer: "wind" | "radar" | "clouds" | "waves") => {
    soundFX.playClick();
    setMapLayer(layer);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Map size={18} color="#38bdf8" />
            <span>
              Live Weather & Radar Map • {location.city}
              {location.region ? `, ${location.region}` : ""}
            </span>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Layer Switcher Controls */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
            <button
              onClick={() => handleLayerSwitch("wind")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: mapLayer === "wind" ? "#2563eb" : "rgba(255, 255, 255, 0.04)",
                color: "#ffffff",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              💨 Wind Streams (Hawa)
            </button>

            <button
              onClick={() => handleLayerSwitch("radar")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: mapLayer === "radar" ? "#2563eb" : "rgba(255, 255, 255, 0.04)",
                color: "#ffffff",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🌧️ Rain & Radar (Barish)
            </button>

            <button
              onClick={() => handleLayerSwitch("clouds")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: mapLayer === "clouds" ? "#2563eb" : "rgba(255, 255, 255, 0.04)",
                color: "#ffffff",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ☁️ Satellite Clouds (Badal)
            </button>

            <button
              onClick={() => handleLayerSwitch("waves")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: mapLayer === "waves" ? "#2563eb" : "rgba(255, 255, 255, 0.04)",
                color: "#ffffff",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🌊 Waves & Tsunami (Toofan)
            </button>
          </div>

          {/* Live Interactive Map Iframe */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "420px",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "#060911",
            }}
          >
            <iframe
              src={`https://embed.windy.com/embed2.html?lat=${location.lat}&lon=${location.lon}&detailLat=${location.lat}&detailLon=${location.lon}&width=100%25&height=100%25&zoom=6&level=surface&overlay=${mapLayer}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={`Weather Map for ${location.city}`}
              allow="geolocation"
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              color: "#94a3b8",
            }}
          >
            <span>
              Layer: <strong>{mapLayer.toUpperCase()}</strong> • Centered on {location.city}
            </span>
            <span>
              Coordinates: {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
