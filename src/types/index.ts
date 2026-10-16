export interface GeoLocationData {
  ip: string;
  success: boolean;
  city: string;
  region: string;
  region_code?: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  postal?: string;
  flag?: {
    img?: string;
    emoji?: string;
  };
  connection?: {
    isp?: string;
    org?: string;
  };
  timezone: {
    id: string;
    abbr?: string;
    offset?: number;
    utc?: string;
    current_time?: string;
  };
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  conditionText: string;
  uvIndex?: number;
  surfacePressure?: number;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  conditionText: string;
  tempMax: number;
  tempMin: number;
}

export interface HourlyForecastItem {
  timeLabel: string;
  temp: number;
  weatherCode: number;
  isDay: boolean;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly?: HourlyForecastItem[];
  sunrise?: string;
  sunset?: string;
  shortDescription: string;
  aiAdvisory: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet?: string;
  category: 'Local' | 'Governance' | 'Business' | 'Technology' | 'Culture' | 'Weather';
  imageUrl?: string;
}

export interface AIBriefingData {
  city: string;
  region: string;
  country: string;
  generatedAt: string;
  weatherNarrative: string;
  lifestyleTip: string;
  areaPulseScore: number;
  areaPulseLabel: string;
  news: NewsItem[];
  keyHighlights: string[];
}
