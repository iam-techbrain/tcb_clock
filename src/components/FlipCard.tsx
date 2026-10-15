"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./FlipCard.module.css";
import { soundFX } from "@/utils/audio";

interface FlipCardProps {
  value: string;
  subLabel?: string; // e.g. "PM" or "AM"
  labelTitle?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  value,
  subLabel,
  labelTitle,
}) => {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setPrevious(prevValueRef.current);
      setCurrent(value);
      setIsFlipping(true);
      prevValueRef.current = value;
      soundFX.playFlip();

      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 550);

      return () => clearTimeout(timer);
    }
  }, [value]);

  const isTwoDigits = (val: string) => String(val).length >= 2;

  return (
    <div className={styles.flipWrapper}>
      {labelTitle && <div className={styles.labelTitle}>{labelTitle}</div>}
      <div className={styles.cardContainer}>
        {/* Left and Right axle notches */}
        <div className={styles.notchLeft} />
        <div className={styles.notchRight} />

        {/* 1. UPPER STATIC */}
        <div className={`${styles.halfCard} ${styles.upper} ${styles.upperStatic}`}>
          <span
            className={`${styles.digitText} ${
              isTwoDigits(current) ? styles.twoDigits : styles.singleDigit
            }`}
          >
            {current}
          </span>
        </div>

        {/* 2. LOWER STATIC */}
        <div className={`${styles.halfCard} ${styles.lower} ${styles.lowerStatic}`}>
          <span
            className={`${styles.digitText} ${
              isTwoDigits(previous) ? styles.twoDigits : styles.singleDigit
            }`}
          >
            {previous}
          </span>
          {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
        </div>

        {/* 3. UPPER FLIPPING */}
        <div
          key={`flip-up-${current}`}
          className={`${styles.halfCard} ${styles.upper} ${styles.upperFlip} ${
            isFlipping ? styles.animateUpper : ""
          }`}
        >
          <span
            className={`${styles.digitText} ${
              isTwoDigits(previous) ? styles.twoDigits : styles.singleDigit
            }`}
          >
            {previous}
          </span>
          <div className={`${styles.shadowOverlay} ${styles.upperShadow}`} />
        </div>

        {/* 4. LOWER FLIPPING */}
        <div
          key={`flip-down-${current}`}
          className={`${styles.halfCard} ${styles.lower} ${styles.lowerFlip} ${
            isFlipping ? styles.animateLower : ""
          }`}
        >
          <span
            className={`${styles.digitText} ${
              isTwoDigits(current) ? styles.twoDigits : styles.singleDigit
            }`}
          >
            {current}
          </span>
          {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
          <div className={`${styles.shadowOverlay} ${styles.lowerShadow}`} />
        </div>

        {/* Horizontal split crease */}
        <div className={styles.splitLine} />
      </div>
    </div>
  );
};
