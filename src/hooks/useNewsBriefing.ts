"use client";

import { useState, useCallback } from "react";
import { AIBriefingData, WeatherData } from "@/types";

export function useNewsBriefing() {
  const [briefing, setBriefing] = useState<AIBriefingData | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);

  const fetchBriefing = useCallback(async (
    city: string,
    region: string,
    country: string,
    countryCode: string,
    weatherObj?: WeatherData | null
  ) => {
    setLoadingBriefing(true);
    try {
      const desc = weatherObj?.current.conditionText || "Clear";
      const temp = weatherObj?.current.temperature.toString() || "28";
      const res = await fetch(
        `/api/briefing?city=${encodeURIComponent(city)}&region=${encodeURIComponent(
          region
        )}&country=${encodeURIComponent(country)}&countryCode=${encodeURIComponent(
          countryCode
        )}&weatherDesc=${encodeURIComponent(desc)}&temp=${encodeURIComponent(temp)}`
      );
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
        return data;
      }
    } catch (err) {
      console.error("Briefing load error:", err);
    } finally {
      setLoadingBriefing(false);
    }
    return null;
  }, []);

  return {
    briefing,
    loadingBriefing,
    fetchBriefing,
  };
}
