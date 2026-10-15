"use client";

import React, { useState, useEffect } from "react";
import styles from "./CitySearchModal.module.css";
import { Search, MapPin, X, Navigation, Globe, Loader2 } from "lucide-react";

interface CitySearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  timezone: string;
}

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (cityData: {
    name: string;
    region: string;
    country: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }) => void;
  onUseCurrentLocation: () => void;
}

const POPULAR_CITIES = [
  { name: "Patna", region: "Bihar", country: "India", code: "IN", lat: 25.5941, lon: 85.1356, tz: "Asia/Kolkata" },
  { name: "New Delhi", region: "Delhi", country: "India", code: "IN", lat: 28.6139, lon: 77.2090, tz: "Asia/Kolkata" },
  { name: "Mumbai", region: "Maharashtra", country: "India", code: "IN", lat: 19.0760, lon: 72.8777, tz: "Asia/Kolkata" },
  { name: "Bengaluru", region: "Karnataka", country: "India", code: "IN", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  { name: "Dubai", region: "Dubai", country: "UAE", code: "AE", lat: 25.2048, lon: 55.2708, tz: "Asia/Dubai" },
  { name: "London", region: "England", country: "United Kingdom", code: "GB", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  { name: "Tokyo", region: "Tokyo", country: "Japan", code: "JP", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
  { name: "New York", region: "New York", country: "USA", code: "US", lat: 40.7128, lon: -74.0060, tz: "America/New_York" },
];

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  onUseCurrentLocation,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query
          )}&count=6&language=en&format=json`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error("Geocoding search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleWithIcon}>
            <Globe size={18} className={styles.globeIcon} />
            <h3>Select Area & Location</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Use My IP Location Button */}
        <button
          className={styles.useGpsBtn}
          onClick={() => {
            onUseCurrentLocation();
            onClose();
          }}
        >
          <Navigation size={16} />
          <span>Auto-Detect Current Area (via ipwho.is)</span>
        </button>

        {/* Search Input */}
        <div className={styles.inputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Type any city or region (e.g. Patna, Mumbai, Paris)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {isSearching && <Loader2 size={16} className={styles.spinIcon} />}
        </div>

        {/* Live Search Results */}
        {results.length > 0 && (
          <div className={styles.resultsList}>
            <span className={styles.sectionLabel}>Search Results</span>
            {results.map((r) => (
              <button
                key={r.id}
                className={styles.resultItem}
                onClick={() => {
                  onSelectCity({
                    name: r.name,
                    region: r.admin1 || "",
                    country: r.country,
                    countryCode: r.country_code,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    timezone: r.timezone,
                  });
                  onClose();
                }}
              >
                <MapPin size={16} className={styles.pinIcon} />
                <div className={styles.resultText}>
                  <span className={styles.cityName}>{r.name}</span>
                  <span className={styles.regionName}>
                    {r.admin1 ? `${r.admin1}, ` : ""}
                    {r.country} ({r.timezone})
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Popular Area Quick Picks */}
        <div className={styles.quickPicks}>
          <span className={styles.sectionLabel}>Popular Global Hubs</span>
          <div className={styles.chipGrid}>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c.name}
                className={styles.cityChip}
                onClick={() => {
                  onSelectCity({
                    name: c.name,
                    region: c.region,
                    country: c.country,
                    countryCode: c.code,
                    latitude: c.lat,
                    longitude: c.lon,
                    timezone: c.tz,
                  });
                  onClose();
                }}
              >
                <span>{c.name}</span>
                <span className={styles.chipCountry}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
