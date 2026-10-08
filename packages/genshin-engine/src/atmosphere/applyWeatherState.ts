import type { WeatherState } from "#src/models/atmosphere/WeatherState";
import type { WeatherTargets } from "#src/models/atmosphere/WeatherTargets";

import { applyPrecipitationSettings } from "#src/atmosphere/applyPrecipitationSettings";
import { PRECIPITATION_SETTINGS_MAP } from "#src/atmosphere/constants";
import { PrecipitationKind } from "#src/models/atmosphere/PrecipitationKind";

// The weather as it stands written into what it moves: the clouds and the haze raised over the region's own clear values
// And never below them, the ground's wetness, and the particles of the kind falling at their share, rain's splashes
// With them. The haze's colour is the sky's, written every frame, so the weather's tint over it is laid apart
export const applyWeatherState = (
  { cloudCoverage, fogDensity, precipitationDensity, precipitationKind, wetness }: WeatherState,
  { fogUniforms, lightUniforms, precipitationUniforms, skyUniforms }: WeatherTargets,
  baseCloudCoverage: number,
  baseFogDensity: number,
): void => {
  skyUniforms.cloudCoverage.value = Math.max(baseCloudCoverage, cloudCoverage);
  fogUniforms.density.value = Math.max(baseFogDensity, fogDensity);
  lightUniforms.wetness.value = wetness;
  precipitationUniforms.density.value = precipitationDensity;
  precipitationUniforms.splashDensity.value = precipitationKind === PrecipitationKind.Rain ? precipitationDensity : 0;
  applyPrecipitationSettings(PRECIPITATION_SETTINGS_MAP[precipitationKind], precipitationUniforms);
};
