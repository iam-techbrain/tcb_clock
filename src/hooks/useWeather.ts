"use client";

import { useState, useCallback } from "react";
import { WeatherData, HourlyForecastItem } from "@/types";
import { getWeatherInfo } from "@/utils/weatherCodes";

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const fetchWeather = useCallback(async (lat: number, lon: number, cityName: string) => {
    setLoadingWeather(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&hourly=temperature_2m,weather_code,is_day&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");

      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      const hourly = data.hourly;

      const weatherInfo = getWeatherInfo(current.weather_code, current.is_day === 1);

      const temp = Math.round(current.temperature_2m);
      const humidity = current.relative_humidity_2m;
      const wind = Math.round(current.wind_speed_10m);

      const placeLabel = cityName || "Patna";
      const shortDescription = `Clear sky in ${placeLabel} with temperature around ${temp}°C. Humidity is ${humidity}% and wind speed is ${wind} km/h. Comfortable atmospheric conditions.`;

      let sunriseStr = "05:48 AM";
      let sunsetStr = "05:21 PM";
      if (daily?.sunrise?.[0]) {
        sunriseStr = new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      if (daily?.sunset?.[0]) {
        sunsetStr = new Date(daily.sunset[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      // Build Hourly Forecast Items (8 slots)
      const hourlyItems: HourlyForecastItem[] = [];
      if (hourly?.time && hourly?.temperature_2m) {
        const labels = ["Now", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM", "3 AM"];
        for (let i = 0; i < 8; i++) {
          const stepIndex = i * 3;
          hourlyItems.push({
            timeLabel: labels[i] || `${i * 3}:00`,
            temp: Math.round(hourly.temperature_2m[stepIndex] ?? temp),
            weatherCode: hourly.weather_code?.[stepIndex] ?? current.weather_code,
            isDay: (hourly.is_day?.[stepIndex] ?? 1) === 1,
          });
        }
      }

      const weatherObj: WeatherData = {
        current: {
          temperature: current.temperature_2m,
          apparentTemperature: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          weatherCode: current.weather_code,
          isDay: current.is_day === 1,
          conditionText: weatherInfo.label,
          uvIndex: daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : 7,
          surfacePressure: Math.round(current.surface_pressure),
        },
        daily: [],
        hourly: hourlyItems,
        sunrise: sunriseStr,
        sunset: sunsetStr,
        shortDescription,
        aiAdvisory: "Clear atmospheric window with pleasant daytime stability.",
      };

      setWeather(weatherObj);
      return weatherObj;
    } catch (err) {
      console.error("Weather load error:", err);
      return null;
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  return {
    weather,
    loadingWeather,
    fetchWeather,
  };
}
