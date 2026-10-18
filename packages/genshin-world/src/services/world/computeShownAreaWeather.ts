import { WeatherKind } from "genshin-engine";

// The weather an area's camera is shown: its turned weather, or clear where the camera stands in one of the area's
// Cities, which keep clear skies in every climate
export const computeShownAreaWeather = (areaWeather: WeatherKind, isInCity: boolean): WeatherKind =>
  isInCity ? WeatherKind.Clear : areaWeather;
