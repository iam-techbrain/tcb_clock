"use client";

import { useState, useCallback, useEffect } from "react";
import { GeoLocationData, LocationMeta } from "@/types";

const DEFAULT_LOCATION: LocationMeta = {
  city: "Patna",
  region: "Bihar",
  country: "India",
  countryCode: "IN",
  lat: 25.5941,
  lon: 85.1376,
  timezone: "Asia/Kolkata",
  flagEmoji: "🇮🇳",
};

export function useLocation() {
  const [geo, setGeo] = useState<GeoLocationData | null>(null);
  const [locationMeta, setLocationMeta] = useState<LocationMeta>(DEFAULT_LOCATION);
  const [loadingGeo, setLoadingGeo] = useState(true);

  // Auto detect location from IP
  const detectLocation = useCallback(async () => {
    setLoadingGeo(true);
    try {
      let geoData: GeoLocationData | null = null;
      try {
        const res = await fetch("https://ipwho.is/", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success !== false) {
            geoData = json;
          }
        }
      } catch {
        const fallbackRes = await fetch("/api/geo");
        if (fallbackRes.ok) {
          geoData = await fallbackRes.json();
        }
      }

      if (geoData) {
        setGeo(geoData);
        const newMeta: LocationMeta = {
          city: geoData.city || "Patna",
          region: geoData.region || "Bihar",
          country: geoData.country || "India",
          countryCode: geoData.country_code || "IN",
          lat: geoData.latitude || 25.5941,
          lon: geoData.longitude || 85.1376,
          timezone: geoData.timezone?.id || "Asia/Kolkata",
          flagEmoji: geoData.flag?.emoji || "🇮🇳",
        };
        setLocationMeta(newMeta);
        return newMeta;
      }
    } catch (err) {
      console.error("Location detection error:", err);
    } finally {
      setLoadingGeo(false);
    }
    return DEFAULT_LOCATION;
  }, []);

  // Update location when user selects city from CitySearchModal
  const selectCity = useCallback((selected: {
    name: string;
    region: string;
    country: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }) => {
    const newMeta: LocationMeta = {
      city: selected.name,
      region: selected.region,
      country: selected.country,
      countryCode: selected.countryCode,
      lat: selected.latitude,
      lon: selected.longitude,
      timezone: selected.timezone,
      flagEmoji: "📍",
    };
    setLocationMeta(newMeta);

    setGeo((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        city: selected.name,
        region: selected.region,
        country: selected.country,
        country_code: selected.countryCode,
        latitude: selected.latitude,
        longitude: selected.longitude,
        timezone: {
          ...prev.timezone,
          id: selected.timezone,
        },
      };
    });

    return newMeta;
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return {
    geo,
    locationMeta,
    loadingGeo,
    detectLocation,
    selectCity,
  };
}
