<script setup lang="ts">
import type { QualityTier } from "genshin-engine";

import WorldGrass from "#src/components/World/Grass/Index.vue";
import WorldLandmarks from "#src/components/World/Landmarks/Index.vue";
import WorldTerrain from "#src/components/World/Terrain/Index.vue";
import WorldWater from "#src/components/World/Water/Index.vue";
import { useFloatingOrigin } from "#src/composables/useFloatingOrigin";
import { useGenshinTuning } from "#src/composables/useGenshinTuning";
import { usePostPipeline } from "#src/composables/usePostPipeline";
import { useRegionData } from "#src/composables/useRegionData";
import { useSky } from "#src/composables/useSky";
import water from "#src/data/windrise/water.json";
import { WindrisePartFamily } from "#src/models/windrise/WindrisePartFamily";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import {
  CLOUD_COVERAGE,
  FOG_DENSITY,
  FOG_HEIGHT_FALLOFF,
  FOG_START_DISTANCE,
  GRASS_BLADE_HEIGHT,
  GRASS_BLADE_WIDTH,
  MIDDLE_GRASS_RING,
  NEAR_GRASS_RING,
  RIM_STRENGTH,
  SHADOW_MAX_FAR,
  SUN_DISTANCE,
  SUN_TILT,
  UNDERWATER_FOG_COLOR,
  UNDERWATER_FOG_DENSITY,
  WATER_CAUSTIC_STRENGTH,
  WATER_DEEP_COLOR,
  WATER_DEEP_DEPTH,
  WATER_FOAM_DEPTH,
  WATER_SHALLOW_COLOR,
  WIND_DIRECTION,
  WIND_GUST_SPEED,
  WIND_GUST_STRENGTH,
  WIND_GUST_WIDTH,
  WIND_STRENGTH,
  WINDRISE_GRADE_OPTIONS,
  WINDRISE_RAMP_OPTIONS,
  WINDRISE_SKY_KEYFRAMES,
  WINDRISE_START_MINUTES,
  WINDRISE_TERRAIN_OPTIONS,
} from "#src/services/windrise/constants";
import { whenever } from "@vueuse/core";
import {
  createFogUniforms,
  createGradeLutTexture,
  createLightUniforms,
  createPostUniforms,
  createRampTexture,
  createSkyUniforms,
  createSunLight,
  createWaterUniforms,
  createWindUniforms,
  QualityTierSettingsMap,
} from "genshin-engine";
import { HemisphereLight } from "three";

interface Props {
  createTerrainWorker: () => Worker;
  // The game's minute of the day the clock is held at, in place of its running from the region's start
  heldMinutes?: number;
  // Whether the development tuning panel is shown, which the app decides
  isTuning: boolean;
  qualityTier: QualityTier;
  // Where the app serves each region's data, fetched by id as the camera comes within reach
  regionDataBaseUrl: string;
}

const { createTerrainWorker, heldMinutes, isTuning, qualityTier, regionDataBaseUrl } = defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
// The witness render's parts, drawn in place of ours of each family it names when the parity page provides them, beside
// Ours rather than in the floating origin's group, since the page's tools find the camera among their siblings and stay
// Within reach of the origin
const witness = inject(SceneWitnessKey, null);
const checkIsOwnFamilyDrawn = (family: WindrisePartFamily): boolean => !witness?.families.value.includes(family);
const hiddenLandmarkKinds = computed(() => [
  ...(checkIsOwnFamilyDrawn(WindrisePartFamily.Oak) ? [] : [LandmarkKind.Tree]),
  ...(checkIsOwnFamilyDrawn(WindrisePartFamily.Statue) ? [] : [LandmarkKind.StatueOfTheSeven]),
]);
const rampTexture = createRampTexture(WINDRISE_RAMP_OPTIONS);
const lightUniforms = createLightUniforms();
lightUniforms.rimStrength.value = RIM_STRENGTH;

const windUniforms = createWindUniforms();
windUniforms.direction.value.copy(WIND_DIRECTION);
windUniforms.gustSpeed.value = WIND_GUST_SPEED;
windUniforms.gustStrength.value = WIND_GUST_STRENGTH;
windUniforms.gustWidth.value = WIND_GUST_WIDTH;
windUniforms.strength.value = WIND_STRENGTH;
// The tier is read once: its cascades are built with the sun, and the scene is remounted to change it
const { cascadeCount, shadowMapSize } = QualityTierSettingsMap[qualityTier];
const { cascadedShadowNode, light: sun } = createSunLight({ cascadeCount, maxFar: SHADOW_MAX_FAR, shadowMapSize });
// Shade is lit only by this, so the sky's colour above and the grass's below are the shade's colours
const hemisphere = new HemisphereLight();
const { origin, worldOffset } = useFloatingOrigin();
const { isRegionDataSettled, regionDataMap } = useRegionData(origin, regionDataBaseUrl);
const fogUniforms = createFogUniforms();
fogUniforms.density.value = FOG_DENSITY;
fogUniforms.heightFalloff.value = FOG_HEIGHT_FALLOFF;
fogUniforms.startDistance.value = FOG_START_DISTANCE;
const postUniforms = createPostUniforms();
const waterUniforms = createWaterUniforms();
waterUniforms.causticStrength.value = WATER_CAUSTIC_STRENGTH;
waterUniforms.deepColor.value.set(WATER_DEEP_COLOR);
waterUniforms.deepDepth.value = WATER_DEEP_DEPTH;
waterUniforms.foamDepth.value = WATER_FOAM_DEPTH;
waterUniforms.level.value = water.level;
waterUniforms.shallowColor.value.set(WATER_SHALLOW_COLOR);
waterUniforms.underwaterFogColor.value.set(UNDERWATER_FOG_COLOR);
waterUniforms.underwaterFogDensity.value = UNDERWATER_FOG_DENSITY;
const skyUniforms = createSkyUniforms();
skyUniforms.cloudCoverage.value = CLOUD_COVERAGE;
const gameClock = useSky({
  checkIsHeld: () => heldMinutes !== undefined || (witness?.isClockHeld.value ?? false),
  skyKeyframes: WINDRISE_SKY_KEYFRAMES,
  skyTargets: {
    fogUniforms,
    hemisphere,
    light: sun,
    lightDistance: SUN_DISTANCE,
    lightUniforms,
    postUniforms,
    skyUniforms,
  },
  startMinutes: heldMinutes ?? WINDRISE_START_MINUTES,
  tilt: SUN_TILT,
  windUniforms,
});
// The clock only starts at its held minute, so a minute held anew is set on it
watch(
  () => heldMinutes,
  (minutes) => {
    if (minutes !== undefined) gameClock.minutes = minutes;
  },
);
// Alone, the witness's exports are drawn with no haze and no clouds, so a pose is matched on their edges alone
if (witness)
  watchEffect(() => {
    fogUniforms.density.value = witness.isAlone.value ? 0 : FOG_DENSITY;
    skyUniforms.cloudCoverage.value = witness.isAlone.value ? 0 : CLOUD_COVERAGE;
  });
// Counts every tile that arrives, so what reads the ground under the view knows to read it again
const terrainChanges = { count: 0 };
const gradeLutTexture = createGradeLutTexture(WINDRISE_GRADE_OPTIONS);
// No god rays and no bloom: neither is measured off a reference of Windrise, and drawn as they stand they veil the
// Whole frame, the god rays marching hundreds of metres of lit air to their most opacity and bloom lifting the whole
// Sky past its threshold, so the frame is drawn through the haze, the grade and the tone mapping alone
const postPipeline = usePostPipeline(() => qualityTier, {
  fogUniforms,
  gradeLutTexture,
  isBloomed: false,
  postUniforms,
});
// The world is ready once the ground of its first view and the regions in reach of it have arrived, so what shows it
// Never shows the bare water under a ground still streaming in
const isTerrainSettled = ref(false);
whenever(
  () => isTerrainSettled.value && isRegionDataSettled.value,
  () => {
    emit("ready");
  },
  { once: true },
);
if (isTuning)
  useGenshinTuning({
    fogUniforms,
    gameClock,
    gradeLutTexture,
    gradeOptions: WINDRISE_GRADE_OPTIONS,
    lightUniforms,
    postPipeline,
    postUniforms,
    rampOptions: WINDRISE_RAMP_OPTIONS,
    rampTexture,
    skyUniforms,
    waterUniforms,
    windUniforms,
  });

onUnmounted(() => {
  rampTexture.dispose();
  gradeLutTexture.dispose();
  cascadedShadowNode.dispose();
  sun.dispose();
  hemisphere.dispose();
});
</script>

<template>
  <primitive :object="sun" />
  <primitive :object="sun.target" />
  <primitive :object="hemisphere" />
  <primitive v-if="witness" :object="witness.parts" />
  <!-- Everything placed in the world is in this group, which the floating origin offsets -->
  <TresGroup :position="worldOffset">
    <!-- Hidden rather than unmounted where the witness draws the ground, since the world is ready once its ground is -->
    <TresGroup :visible="checkIsOwnFamilyDrawn(WindrisePartFamily.Ground)">
      <WorldTerrain
        :create-terrain-worker
        :light-uniforms
        :origin
        :ramp-texture
        :terrain-options="WINDRISE_TERRAIN_OPTIONS"
        :water-uniforms
        @change="terrainChanges.count++"
        @ready="isTerrainSettled = true"
      />
      <WorldGrass
        :blade-height="GRASS_BLADE_HEIGHT"
        :blade-width="GRASS_BLADE_WIDTH"
        :light-uniforms
        :origin
        :quality-tier
        :ramp-texture
        :rings="[NEAR_GRASS_RING, MIDDLE_GRASS_RING]"
        :terrain-changes
        :terrain-options="WINDRISE_TERRAIN_OPTIONS"
        :water-uniforms
        :wind-uniforms
      />
    </TresGroup>
    <WorldWater :fog-uniforms :light-uniforms :origin :sky-uniforms :water-uniforms />
    <WorldLandmarks :hidden-kinds="hiddenLandmarkKinds" :light-uniforms :ramp-texture :region-data-map :wind-uniforms />
  </TresGroup>
</template>
