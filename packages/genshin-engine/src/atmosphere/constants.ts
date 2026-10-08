import type { LightningBoltOptions } from "#src/models/atmosphere/LightningBoltOptions";
import type { LightningFlashPulse } from "#src/models/atmosphere/LightningFlashPulse";
import type { PrecipitationSettings } from "#src/models/atmosphere/PrecipitationSettings";
import type { SkyGradient } from "#src/models/atmosphere/SkyGradient";
import type { SkyShape } from "#src/models/atmosphere/SkyShape";
import type { WeatherSettings } from "#src/models/atmosphere/WeatherSettings";

import { PrecipitationKind } from "#src/models/atmosphere/PrecipitationKind";
import { WeatherKind } from "#src/models/atmosphere/WeatherKind";
import { MathUtils } from "three";

// A sun shadow map is drawn again once the sun has turned this far, a little over the angle it turns in two real
// Seconds, so a moving sun costs its shadow passes every other second rather than one a frame
export const SUN_REDRAW_COSINE: number = Math.cos((0.6 * Math.PI) / 180);
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
// Each weather's sky, fog, wetness, particles and lightning, as starting values to be fitted to the game's own weather
// Settings. Clear keeps the region's own sky and haze; the others raise them over it. Provisional: the sandstorm's sand
// Haze is measured off a recording of the Desert of Hadramaveth's storm, and the thunderstorm's strikes a minute are
// Counted off a recording of one
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
    fogColor: 0xc9a66b,
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
    lightningRate: 4,
    precipitation: { density: 1, kind: PrecipitationKind.Rain },
    wetness: 1,
  },
};
// A weather changes over this many seconds, eased in and out, so the sky darkens and the rain thickens together.
// Provisional: measured off a recording of the game's weather turning
export const WEATHER_TRANSITION_SECONDS = 10;
// A strike's flash: two pulses, the second dimmer, each dying away over its decay, so the sky flickers and is dark
// Again within a second. The flash turns the sky's colours this far toward its own, sRGB as the palette sees it, and
// Adds this much to the ambient light, at its brightest. Provisional: each read off a recording of a thunderstorm
export const LIGHTNING_FLASH_PULSES: readonly LightningFlashPulse[] = [
  { seconds: 0, strength: 1 },
  { seconds: 0.15, strength: 0.6 },
];
export const LIGHTNING_FLASH_DECAY_SECONDS = 0.08;
export const LIGHTNING_FLASH_COLOR = 0xdadfff;
export const LIGHTNING_FLASH_SKY = 0.6;
export const LIGHTNING_FLASH_AMBIENT = 1.2;
// A flash dimmer than this is over: its bolt is hidden and the sky is the weather's own again
export const LIGHTNING_FLASH_END = 0.01;
// A bolt's shape, a new seed each strike, and its glow, sRGB as the palette sees it and brighter than white. It falls
// Between these distances from the eye, in metres. Provisional: each read off a recording of a thunderstorm
export const LIGHTNING_BOLT_OPTIONS: Readonly<
  Pick<LightningBoltOptions, "branchCount" | "height" | "roughness" | "segmentCount" | "width">
> = { branchCount: 3, height: 240, roughness: 1.2, segmentCount: 24, width: 1.6 };
export const LIGHTNING_BOLT_COLOR = 0xe8e6ff;
export const LIGHTNING_BOLT_BRIGHTNESS = 3;
export const LIGHTNING_MIN_DISTANCE = 150;
export const LIGHTNING_MAX_DISTANCE = 600;
// Where rain meets the ground: this many splashes in a square this many metres from the eye to its side, each living
// This many seconds, as wide as this at its widest, at this opacity, lifted this far off what it stands on so the
// Ground never hides it. Provisional: matched to a recording of rain by its statistics
export const SPLASH_COUNT = 768;
export const SPLASH_RADIUS = 16;
export const SPLASH_LIFETIME = 0.35;
export const SPLASH_SIZE = 0.4;
export const SPLASH_OPACITY = 0.5;
export const SPLASH_LIFT = 0.03;
