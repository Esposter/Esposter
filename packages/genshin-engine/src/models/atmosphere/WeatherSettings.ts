import type { WeatherPrecipitation } from "#src/models/atmosphere/WeatherPrecipitation";

// What a weather does to the sky, fog and ground: the cloud coverage it raises the sky to, the fog density it raises
// The haze to, how wet the ground stands, and the particles it falls, if any. A weather only raises the sky and the
// Fog over the region's own, so a clear sky keeps the region's cloud and haze
export interface WeatherSettings {
  cloudCoverage: number;
  fogDensity: number;
  precipitation?: WeatherPrecipitation;
  wetness: number;
}
