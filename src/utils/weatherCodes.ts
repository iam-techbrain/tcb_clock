export interface WeatherInfo {
  label: string;
  shortDesc: string;
  iconName: 'sun' | 'moon' | 'cloud' | 'cloud-sun' | 'cloud-rain' | 'cloud-lightning' | 'cloud-snow' | 'cloud-fog';
}

export function getWeatherInfo(code: number, isDay: boolean = true): WeatherInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? "Clear Sky" : "Clear Night",
        shortDesc: isDay ? "Crisp and sunny" : "Starry and clear",
        iconName: isDay ? "sun" : "moon",
      };
    case 1:
      return {
        label: "Mainly Clear",
        shortDesc: "Mild sunny intervals",
        iconName: isDay ? "cloud-sun" : "moon",
      };
    case 2:
      return {
        label: "Partly Cloudy",
        shortDesc: "Scattered cloud cover",
        iconName: "cloud-sun",
      };
    case 3:
      return {
        label: "Overcast",
        shortDesc: "Dense overcast sky",
        iconName: "cloud",
      };
    case 45:
    case 48:
      return {
        label: "Foggy",
        shortDesc: "Low visibility fog",
        iconName: "cloud-fog",
      };
    case 51:
    case 53:
    case 55:
      return {
        label: "Drizzle",
        shortDesc: "Light soothing drizzle",
        iconName: "cloud-rain",
      };
    case 61:
    case 63:
    case 65:
      return {
        label: "Rain",
        shortDesc: "Steady showers",
        iconName: "cloud-rain",
      };
    case 71:
    case 73:
    case 75:
      return {
        label: "Snowfall",
        shortDesc: "Cold snow flurries",
        iconName: "cloud-snow",
      };
    case 80:
    case 81:
    case 82:
      return {
        label: "Rain Showers",
        shortDesc: "Passing showers",
        iconName: "cloud-rain",
      };
    case 95:
    case 96:
    case 99:
      return {
        label: "Thunderstorm",
        shortDesc: "Stormy with lightning",
        iconName: "cloud-lightning",
      };
    default:
      return {
        label: "Clear",
        shortDesc: "Fair conditions",
        iconName: isDay ? "sun" : "moon",
      };
  }
}
