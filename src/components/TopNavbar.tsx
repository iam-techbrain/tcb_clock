"use client";

import React from "react";
import styles from "./TopNavbar.module.css";
import {
  MapPin,
  ChevronDown,
  LayoutDashboard,
  Newspaper,
  CloudSun,
  Compass,
  Calendar,
  Volume2,
  VolumeX,
  Moon,
  Sun,
} from "lucide-react";
import { soundFX } from "@/utils/audio";

export type NavTabType = "dashboard" | "news" | "weather" | "maps";

interface TopNavbarProps {
  cityName: string;
  regionName: string;
  timezone: string;
  currentDateStr: string;
  is24Hour: boolean;
  onToggle24Hour: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFahrenheit: boolean;
  onToggleFahrenheit: () => void;
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onOpenLocationModal: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  cityName,
  regionName,
  timezone,
  currentDateStr,
  is24Hour,
  onToggle24Hour,
  soundEnabled,
  onToggleSound,
  isFahrenheit,
  onToggleFahrenheit,
  activeTab,
  onSelectTab,
  onOpenLocationModal,
  isDarkMode = true,
  onToggleTheme,
}) => {
  const displayLocation = cityName ? (regionName ? `${cityName}, ${regionName}` : cityName) : "Patna, Bihar";

  const handleSoundBtnClick = () => {
    const nextState = !soundEnabled;
    soundFX.enabled = nextState;
    soundFX.unlock();
    soundFX.playToggle(nextState);
    onToggleSound();
  };

  const handle24HClick = () => {
    soundFX.unlock();
    soundFX.playClick();
    onToggle24Hour();
  };

  const handleTempClick = () => {
    soundFX.unlock();
    soundFX.playClick();
    onToggleFahrenheit();
  };

  const handleTabClick = (tab: NavTabType) => {
    soundFX.unlock();
    soundFX.playClick();
    onSelectTab(tab);
  };

  const handleLocationClick = () => {
    soundFX.unlock();
    soundFX.playClick();
    onOpenLocationModal();
  };

  const handleThemeClick = () => {
    soundFX.unlock();
    soundFX.playClick();
    onToggleTheme?.();
  };

  return (
    <header className={styles.navbar}>
      {/* 1. Left: Location Selector & Timezone */}
      <div className={styles.leftSection}>
        <button
          className={styles.locationTrigger}
          onClick={handleLocationClick}
          title="Select city or region"
        >
          <MapPin size={15} className={styles.pinIcon} />
          <span className={styles.cityName}>{displayLocation.toUpperCase()}</span>
          <ChevronDown size={14} className={styles.chevron} />
        </button>

        <span className={styles.tzBadge} title="Timezone">
          {timezone}
        </span>
      </div>

      {/* 2. Center: Navigation Tabs */}
      <nav className={styles.centerNav}>
        <button
          className={`${styles.navTab} ${activeTab === "dashboard" ? styles.activeTab : ""}`}
          onClick={() => handleTabClick("dashboard")}
        >
          <LayoutDashboard size={14} />
          <span>Dashboard</span>
        </button>

        <button
          className={`${styles.navTab} ${activeTab === "news" ? styles.activeTab : ""}`}
          onClick={() => handleTabClick("news")}
        >
          <Newspaper size={14} />
          <span>News</span>
        </button>

        <button
          className={`${styles.navTab} ${activeTab === "weather" ? styles.activeTab : ""}`}
          onClick={() => handleTabClick("weather")}
        >
          <CloudSun size={14} />
          <span>Weather</span>
        </button>

        <button
          className={`${styles.navTab} ${activeTab === "maps" ? styles.activeTab : ""}`}
          onClick={() => handleTabClick("maps")}
        >
          <Compass size={14} />
          <span>Maps</span>
        </button>
      </nav>

      {/* 3. Right: Date & Controls */}
      <div className={styles.rightSection}>
        <div className={styles.dateDisplay}>
          <Calendar size={13} className={styles.calendarIcon} />
          <span>{currentDateStr || "Fri, Oct 16, 2026"}</span>
        </div>

        <button
          className={`${styles.ctrlPill} ${is24Hour ? styles.activePill : ""}`}
          onClick={handle24HClick}
          title="Switch between 12-hour and 24-hour format"
        >
          <span>{is24Hour ? "24H" : "12H"}</span>
        </button>

        <button
          className={`${styles.ctrlPill} ${soundEnabled ? styles.activePill : ""}`}
          onClick={handleSoundBtnClick}
          title="Toggle UI audio clicks"
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span>{soundEnabled ? "SOUND" : "MUTE"}</span>
        </button>

        <button
          className={`${styles.ctrlPill} ${isFahrenheit ? styles.activePill : ""}`}
          onClick={handleTempClick}
          title="Toggle Celsius / Fahrenheit"
        >
          <span>{isFahrenheit ? "°F" : "°C"}</span>
        </button>

        <button
          className={styles.themeBtn}
          onClick={handleThemeClick}
          title="Toggle theme"
        >
          {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </header>
  );
};
