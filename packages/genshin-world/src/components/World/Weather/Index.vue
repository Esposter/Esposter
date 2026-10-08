<script setup lang="ts">
import type { FogUniforms, LightUniforms, SkyUniforms, WeatherKind, WindUniforms } from "genshin-engine";
import type { Vector3 } from "three";

import { useLoop, useTres } from "@tresjs/core";
import { watchImmediate } from "@vueuse/core";
import {
  applyPrecipitationSettings,
  applyWeatherSettings,
  createPrecipitationGeometry,
  createPrecipitationMaterial,
  createPrecipitationUniforms,
  PRECIPITATION_COUNT,
  PRECIPITATION_SETTINGS_MAP,
  WEATHER_SETTINGS_MAP,
} from "genshin-engine";
import { Mesh } from "three";

interface Props {
  // The cloud coverage and fog density the region holds clear, which a weather raises and never lowers
  baseCloudCoverage: number;
  baseFogDensity: number;
  fogUniforms: FogUniforms;
  lightUniforms: LightUniforms;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  skyUniforms: SkyUniforms;
  weather: WeatherKind;
  windUniforms: WindUniforms;
}

const { baseCloudCoverage, baseFogDensity, fogUniforms, lightUniforms, origin, skyUniforms, weather, windUniforms } =
  defineProps<Props>();
const { camera } = useTres();
const { onBeforeRender } = useLoop();
const precipitationUniforms = createPrecipitationUniforms();
const precipitationMesh = new Mesh(
  createPrecipitationGeometry(PRECIPITATION_COUNT),
  createPrecipitationMaterial({ lightUniforms, precipitationUniforms, windUniforms }),
);
precipitationMesh.frustumCulled = false;
// The weather writes the sky, fog, wetness and particles it sets over the region's own, each whenever the weather or
// The region's clear values change
const writeWeather = () => {
  const weatherSettings = WEATHER_SETTINGS_MAP[weather];
  applyWeatherSettings(
    weatherSettings,
    { cloudCoverage: baseCloudCoverage, fogDensity: baseFogDensity },
    { fogUniforms, lightUniforms, skyUniforms },
  );
  const { precipitation } = weatherSettings;
  precipitationUniforms.density.value = precipitation?.density ?? 0;
  if (precipitation) applyPrecipitationSettings(PRECIPITATION_SETTINGS_MAP[precipitation.kind], precipitationUniforms);
};
watchImmediate(() => [weather, baseCloudCoverage, baseFogDensity], writeWeather);

// The particles gather round the eye, in the world group's coordinates as the ground's grass does
onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera) return;
  precipitationUniforms.eye.value.copy(activeCamera.position).add(origin);
});

onUnmounted(() => {
  precipitationMesh.geometry.dispose();
  precipitationMesh.material.dispose();
});
</script>

<template>
  <primitive :object="precipitationMesh" />
</template>
