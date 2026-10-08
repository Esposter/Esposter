import type { SkyTargets } from "#src/models/atmosphere/SkyTargets";
import type { WeatherSettings } from "#src/models/atmosphere/WeatherSettings";

// The weather written over the region's clear sky and haze, raising its clouds and fog and never lowering them, and
// Wetting the ground as it says
export const applyWeatherSettings = (
  { cloudCoverage, fogDensity, wetness }: WeatherSettings,
  baseSettings: Pick<WeatherSettings, "cloudCoverage" | "fogDensity">,
  { fogUniforms, lightUniforms, skyUniforms }: Pick<SkyTargets, "fogUniforms" | "lightUniforms" | "skyUniforms">,
): void => {
  skyUniforms.cloudCoverage.value = Math.max(baseSettings.cloudCoverage, cloudCoverage);
  fogUniforms.density.value = Math.max(baseSettings.fogDensity, fogDensity);
  lightUniforms.wetness.value = wetness;
};
