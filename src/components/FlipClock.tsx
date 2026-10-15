"use client";

import React, { useState, useEffect } from "react";
import { FlipCard } from "./FlipCard";
import styles from "./FlipClock.module.css";
import { Volume2, VolumeX, Clock, Eye, EyeOff, MapPin } from "lucide-react";
import { soundFX } from "@/utils/audio";

interface FlipClockProps {
  timezone?: string;
  cityName?: string;
  onChangeArea?: () => void;
}

export const FlipClock: React.FC<FlipClockProps> = ({
  timezone = "Asia/Kolkata",
  cityName = "Local",
  onChangeArea,
}) => {
  const [time, setTime] = useState<{
    hoursStr: string;
    minutesStr: string;
    secondsStr: string;
    periodStr: string;
    dateStr: string;
  }>({
    hoursStr: "08",
    minutesStr: "31",
    secondsStr: "00",
    periodStr: "PM",
    dateStr: "",
  });

  const [is24Hour, setIs24Hour] = useState(false);
  const [showSeconds, setShowSeconds] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    soundFX.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: timezone,
          hour12: !is24Hour,
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        };

        const timeFormatter = new Intl.DateTimeFormat("en-US", options);
        const parts = timeFormatter.formatToParts(now);

        let h = "";
        let m = "";
        let s = "";
        let dayPeriod = "";

        parts.forEach((p) => {
          if (p.type === "hour") h = p.value;
          if (p.type === "minute") m = p.value;
          if (p.type === "second") s = p.value;
          if (p.type === "dayPeriod") dayPeriod = p.value.toUpperCase();
        });

        const dateFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        setTime({
          hoursStr: h,
          minutesStr: m,
          secondsStr: s,
          periodStr: !is24Hour ? dayPeriod : "",
          dateStr: dateFormatter.format(now),
        });
      } catch (err) {
        console.error("Timezone format error:", err);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone, is24Hour]);

  return (
    <div className={styles.clockContainer}>
      {/* Top status bar above clock */}
      <div className={styles.clockHeader}>
        <div className={styles.liveIndicator}>
          <span className={styles.livePulse} />
          <span className={styles.liveText}>
            {cityName ? cityName.toUpperCase() : "LIVE"} TIME
          </span>
          <span className={styles.timezoneTag}>{timezone}</span>
          {onChangeArea && (
            <button
              className={styles.locationChangeBtn}
              onClick={onChangeArea}
              title="Change area or detect location"
            >
              <MapPin size={11} />
              <span>AREA</span>
            </button>
          )}
        </div>

        <div className={styles.controlButtons}>
          <button
            className={`${styles.ctrlBtn} ${!is24Hour ? styles.activeBtn : ""}`}
            onClick={() => setIs24Hour(!is24Hour)}
            title="Toggle 12h / 24h mode"
          >
            <Clock size={14} />
            <span>{is24Hour ? "24H" : "12H"}</span>
          </button>

          <button
            className={`${styles.ctrlBtn} ${showSeconds ? styles.activeBtn : ""}`}
            onClick={() => setShowSeconds(!showSeconds)}
            title="Toggle Seconds Card"
          >
            {showSeconds ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>SEC</span>
          </button>

          <button
            className={`${styles.ctrlBtn} ${soundEnabled ? styles.activeBtn : ""}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute mechanical flip sound" : "Unmute flip sound"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{soundEnabled ? "SOUND" : "MUTE"}</span>
          </button>
        </div>
      </div>

      {/* Retro Split-Flap Cards Display */}
      <div className={styles.cardsRow}>
        {/* HOURS PLATE - Matches image with AM/PM indicator in bottom-left */}
        <FlipCard
          value={time.hoursStr}
          subLabel={time.periodStr}
          labelTitle="HOURS"
        />

        {/* Separator dots or gap */}
        <div className={styles.cardSeparator}>
          <span className={styles.colonDot} />
          <span className={styles.colonDot} />
        </div>

        {/* MINUTES PLATE */}
        <FlipCard
          value={time.minutesStr}
          labelTitle="MINUTES"
        />

        {/* Optional SECONDS PLATE */}
        {showSeconds && (
          <>
            <div className={styles.cardSeparator}>
              <span className={styles.colonDot} />
              <span className={styles.colonDot} />
            </div>
            <FlipCard
              value={time.secondsStr}
              labelTitle="SECONDS"
            />
          </>
        )}
      </div>

      {/* Date & Day Banner */}
      <div className={styles.dateBanner}>
        {mounted && time.dateStr ? (
          <span>{time.dateStr}</span>
        ) : (
          <span>Synchronizing Precision Clock...</span>
        )}
      </div>
    </div>
  );
};
