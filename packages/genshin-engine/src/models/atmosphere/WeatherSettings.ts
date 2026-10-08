import type { WeatherPrecipitation } from "#src/models/atmosphere/WeatherPrecipitation";

// What a weather does to the sky, fog and ground: the cloud coverage it raises the sky to, the fog density it raises
// The haze to, the haze's own colour where the weather tints it as the palette sees it in sRGB, how wet the ground
// Stands, the particles it falls, if any, and how often lightning strikes in it, in strikes a minute, if it does. A
// Weather only raises the sky and the fog over the region's own, so a clear sky keeps the region's cloud and haze
export interface WeatherSettings {
  cloudCoverage: number;
  fogColor?: number;
  fogDensity: number;
  lightningRate?: number;
  precipitation?: WeatherPrecipitation;
  wetness: number;
}
