<script setup lang="ts">
import type {
  FogUniforms,
  GroundCapture,
  LightUniforms,
  SkyUniforms,
  WaterUniforms,
  WeatherKind,
  WeatherState,
  WindUniforms,
} from "genshin-engine";
import type { HemisphereLight, Vector3 } from "three";

import { useLoop, useTres } from "@tresjs/core";
import { watchImmediate } from "@vueuse/core";
import {
  applyLightningFlash,
  applyWeatherState,
  blendWeatherState,
  computeLightningBolt,
  computeLightningFlash,
  createLightningBoltGeometry,
  createLightningBoltMaterial,
  createPrecipitationGeometry,
  createPrecipitationMaterial,
  createPrecipitationUniforms,
  createSplashMaterial,
  LIGHTNING_BOLT_OPTIONS,
  LIGHTNING_FLASH_COLOR,
  LIGHTNING_FLASH_END,
  LIGHTNING_MAX_DISTANCE,
  LIGHTNING_MIN_DISTANCE,
  PRECIPITATION_COUNT,
  PrecipitationKind,
  SPLASH_COUNT,
  toSceneColor,
  WEATHER_SETTINGS_MAP,
  WEATHER_TRANSITION_SECONDS,
} from "genshin-engine";
import { Color, MathUtils, Mesh } from "three";
import { uniform } from "three/tsl";

interface Props {
  // The cloud coverage and fog density the region holds clear, which a weather raises and never lowers
  baseCloudCoverage: number;
  baseFogDensity: number;
  fogUniforms: FogUniforms;
  // The ground's height at a point in world coordinates, where a bolt strikes
  getGroundHeight: (x: number, z: number) => number;
  // The ground under the camera from above, which the rain's splashes stand on
  groundCapture: GroundCapture;
  // The ambient light a strike's flash raises over the sky's
  hemisphere: HemisphereLight;
  lightUniforms: LightUniforms;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  skyUniforms: SkyUniforms;
  waterUniforms: WaterUniforms;
  weather: WeatherKind;
  windUniforms: WindUniforms;
}

const {
  baseCloudCoverage,
  baseFogDensity,
  fogUniforms,
  getGroundHeight,
  groundCapture,
  hemisphere,
  lightUniforms,
  origin,
  skyUniforms,
  waterUniforms,
  weather,
  windUniforms,
} = defineProps<Props>();
const { camera } = useTres();
const { onBeforeRender } = useLoop();
const precipitationUniforms = createPrecipitationUniforms();
const weatherTargets = { fogUniforms, lightUniforms, precipitationUniforms, skyUniforms };
const precipitationMesh = new Mesh(
  createPrecipitationGeometry(PRECIPITATION_COUNT),
  createPrecipitationMaterial({ lightUniforms, precipitationUniforms, windUniforms }),
);
precipitationMesh.frustumCulled = false;
const splashMesh = new Mesh(
  createPrecipitationGeometry(SPLASH_COUNT),
  createSplashMaterial({ groundCapture, lightUniforms, precipitationUniforms, waterUniforms }),
);
splashMesh.frustumCulled = false;
const boltFlash = uniform(0);
const boltMesh = new Mesh(
  createLightningBoltGeometry(computeLightningBolt({ ...LIGHTNING_BOLT_OPTIONS, seed: 0 })),
  createLightningBoltMaterial(boltFlash),
);
boltMesh.visible = false;
const flashColor = toSceneColor(new Color(LIGHTNING_FLASH_COLOR));
const weatherFogColor = new Color();
// Where the weather stood when it last began to change, and where it stands now. The weather the world loads with is
// Set at once; each change after it blends over the transition's length, eased in and out
const fromWeatherState: WeatherState = {
  cloudCoverage: 0,
  fogColor: 0,
  fogColorAmount: 0,
  fogDensity: 0,
  lightningRate: 0,
  precipitationDensity: 0,
  precipitationKind: PrecipitationKind.Rain,
  wetness: 0,
};
const weatherState: WeatherState = { ...fromWeatherState };
blendWeatherState(fromWeatherState, WEATHER_SETTINGS_MAP[weather], 1, weatherState);
let transitionSeconds = WEATHER_TRANSITION_SECONDS;
// Long past any strike, so the world loads dark
let strikeSeconds = Infinity;
watchImmediate(
  () => [baseCloudCoverage, baseFogDensity],
  () => {
    applyWeatherState(weatherState, weatherTargets, baseCloudCoverage, baseFogDensity);
  },
);
watch(
  () => weather,
  () => {
    Object.assign(fromWeatherState, weatherState);
    transitionSeconds = 0;
  },
);

// After the sky, whose fog colour, sky colours and ambient light the weather's haze and a strike's flash are laid over,
// And before the water, whose haze replaces the weather's under its surface. The particles gather round the eye, in the
// World group's coordinates as the ground's grass does, and a strike comes at the weather's rate, one at a time, its
// Bolt standing on the ground somewhere round the eye for as long as its flash lasts
onBeforeRender(({ delta }) => {
  const activeCamera = camera.value;
  if (!activeCamera) return;
  precipitationUniforms.eye.value.copy(activeCamera.position).add(origin);
  if (transitionSeconds < WEATHER_TRANSITION_SECONDS) {
    transitionSeconds = Math.min(transitionSeconds + delta, WEATHER_TRANSITION_SECONDS);
    const amount = MathUtils.smoothstep(transitionSeconds, 0, WEATHER_TRANSITION_SECONDS);
    blendWeatherState(fromWeatherState, WEATHER_SETTINGS_MAP[weather], amount, weatherState);
    applyWeatherState(weatherState, weatherTargets, baseCloudCoverage, baseFogDensity);
  }
  if (weatherState.fogColorAmount > 0)
    fogUniforms.color.value.lerp(
      toSceneColor(weatherFogColor.set(weatherState.fogColor), weatherFogColor),
      weatherState.fogColorAmount,
    );
  strikeSeconds += delta;
  const flash = computeLightningFlash(strikeSeconds);
  if (flash >= LIGHTNING_FLASH_END) {
    boltFlash.value = Math.min(flash, 1);
    applyLightningFlash(flash, flashColor, skyUniforms, hemisphere);
    return;
  }

  boltMesh.visible = false;
  if (Math.random() >= (weatherState.lightningRate / 60) * delta) return;
  const { x, z } = precipitationUniforms.eye.value;
  const angle = Math.random() * Math.PI * 2;
  const distance = MathUtils.lerp(LIGHTNING_MIN_DISTANCE, LIGHTNING_MAX_DISTANCE, Math.random());
  const strikeX = x + Math.cos(angle) * distance;
  const strikeZ = z + Math.sin(angle) * distance;
  boltMesh.position.set(strikeX, getGroundHeight(strikeX, strikeZ), strikeZ);
  boltMesh.rotation.y = Math.random() * Math.PI * 2;
  boltMesh.visible = true;
  strikeSeconds = 0;
});

onUnmounted(() => {
  precipitationMesh.geometry.dispose();
  precipitationMesh.material.dispose();
  splashMesh.geometry.dispose();
  splashMesh.material.dispose();
  boltMesh.geometry.dispose();
  boltMesh.material.dispose();
});
</script>

<template>
  <primitive :object="precipitationMesh" />
  <primitive :object="splashMesh" />
  <primitive :object="boltMesh" />
</template>
