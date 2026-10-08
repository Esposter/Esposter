import type { PrecipitationSettings } from "#src/models/atmosphere/PrecipitationSettings";
import type { SkyGradient } from "#src/models/atmosphere/SkyGradient";
import type { SkyShape } from "#src/models/atmosphere/SkyShape";
import type { WeatherSettings } from "#src/models/atmosphere/WeatherSettings";

import { PrecipitationKind } from "#src/models/atmosphere/PrecipitationKind";
import { WeatherKind } from "#src/models/atmosphere/WeatherKind";
import { MathUtils } from "three";

// The sky's shape where a state sets none of its own
export const DEFAULT_SKY_SHAPE: Readonly<SkyShape> = {
  frontBackBlend: 1,
  haloHeight: 1,
  horizonBand: 0.45,
  moonSize: 1,
  sunHaloSize: 1,
};
// The smoothstep a sky with no gradient of its own falls by, as 33 samples
const DEFAULT_SAMPLE_COUNT = 33;
export const DEFAULT_SKY_GRADIENT: SkyGradient = {
  green: Array.from({ length: DEFAULT_SAMPLE_COUNT }, () => 0),
  red: Array.from(
    { length: DEFAULT_SAMPLE_COUNT },
    (_value, index) => 1 - MathUtils.smoothstep(index, 0, DEFAULT_SAMPLE_COUNT - 1),
  ),
};
// The particles a weather draws, one draw of this many streaks in a box round the eye this many metres across and up,
// And the rate their sway turns
export const PRECIPITATION_COUNT = 2048;
export const PRECIPITATION_VOLUME_SIZE = 60;
export const PRECIPITATION_VOLUME_HEIGHT = 30;
export const PRECIPITATION_SWAY_SPEED = 1.3;
// Each kind's look, as starting values to be fitted to the game's recordings: rain's streaks fall fast and lean with the
// Wind a little, snow's flakes drift down slowly and sway, and sand is carried along the wind
export const PRECIPITATION_SETTINGS_MAP: Readonly<Record<PrecipitationKind, PrecipitationSettings>> = {
  [PrecipitationKind.Rain]: { fallSpeed: 14, length: 0.9, opacity: 0.35, sway: 0, width: 0.03, windDrift: 0.2 },
  [PrecipitationKind.Sand]: { fallSpeed: 1.5, length: 2.5, opacity: 0.3, sway: 0.2, width: 0.05, windDrift: 1 },
  [PrecipitationKind.Snow]: { fallSpeed: 1.6, length: 0.12, opacity: 0.9, sway: 0.8, width: 0.12, windDrift: 0.3 },
};
// Each weather's sky, fog, wetness and particles, as starting values to be fitted to the game's own weather settings.
// Clear keeps the region's own sky and haze; the others raise them over it
export const WEATHER_SETTINGS_MAP: Readonly<Record<WeatherKind, WeatherSettings>> = {
  [WeatherKind.Clear]: { cloudCoverage: 0, fogDensity: 0, wetness: 0 },
  [WeatherKind.Cloudy]: { cloudCoverage: 0.6, fogDensity: 0, wetness: 0 },
  [WeatherKind.Fog]: { cloudCoverage: 0.4, fogDensity: 0.006, wetness: 0 },
  [WeatherKind.Rain]: {
    cloudCoverage: 0.85,
    fogDensity: 0.001,
    precipitation: { density: 0.6, kind: PrecipitationKind.Rain },
    wetness: 1,
  },
  [WeatherKind.Sandstorm]: {
    cloudCoverage: 0.3,
    fogDensity: 0.008,
    precipitation: { density: 0.8, kind: PrecipitationKind.Sand },
    wetness: 0,
  },
  [WeatherKind.Snow]: {
    cloudCoverage: 0.8,
    fogDensity: 0.001,
    precipitation: { density: 0.5, kind: PrecipitationKind.Snow },
    wetness: 0,
  },
  [WeatherKind.Thunderstorm]: {
    cloudCoverage: 1,
    fogDensity: 0.002,
    precipitation: { density: 1, kind: PrecipitationKind.Rain },
    wetness: 1,
  },
};
