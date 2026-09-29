<script setup lang="ts">
import type { QualityTier } from "genshin-engine";

import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import {
  BARK_COLOR,
  CLOUD_COVERAGE,
  CLOUD_DRIFT_PER_SECOND,
  FOG_DENSITY,
  FOG_HEIGHT_FALLOFF,
  FOG_START_DISTANCE,
  GODRAYS_HALF_EXTENT,
  GODRAYS_SHADOW_MAP_SIZE,
  LEAF_COLOR,
  RIM_STRENGTH,
  SHADOW_MAX_FAR,
  STATUE_OFFSET_X,
  STATUE_OFFSET_Z,
  STONE_COLOR,
  SUN_DISTANCE,
  SUN_TILT,
  WINDRISE_GRADE_OPTIONS,
  WINDRISE_OAK_OPTIONS,
  WINDRISE_RAMP_OPTIONS,
  WINDRISE_SKY_KEYFRAMES,
  WINDRISE_START_MINUTES,
  WINDRISE_TERRAIN_OPTIONS,
} from "@/services/genshin/windrise/constants";
import { getWindriseHeight } from "@/services/genshin/windrise/getWindriseHeight";
import {
  createFogUniforms,
  createGodraysLight,
  createGradeLutTexture,
  createLeafMaterial,
  createLightUniforms,
  createPostUniforms,
  createRampTexture,
  createSkyUniforms,
  createStatueGeometry,
  createSunLight,
  createToonMaterial,
  createTreeGeometry,
  QualityTierSettingsMap,
} from "genshin-engine";
import { HemisphereLight } from "three";

interface Props {
  qualityTier: QualityTier;
}

const { qualityTier } = defineProps<Props>();
const { scene } = useTres();
const knollHeight = getWindriseHeight(0, 0);
const statueHeight = getWindriseHeight(STATUE_OFFSET_X, STATUE_OFFSET_Z);
const rampTexture = createRampTexture(WINDRISE_RAMP_OPTIONS);
const lightUniforms = createLightUniforms();
lightUniforms.rimStrength.value = RIM_STRENGTH;

const { branchGeometry, leafGeometry } = createTreeGeometry(WINDRISE_OAK_OPTIONS);
const barkMaterial = createToonMaterial({ color: BARK_COLOR, lightUniforms, rampTexture });
const leafMaterial = createLeafMaterial({ color: LEAF_COLOR, lightUniforms, rampTexture });
const statueGeometry = createStatueGeometry();
const stoneMaterial = createToonMaterial({ color: STONE_COLOR, lightUniforms, rampTexture });
// The tier is read once: its cascades are built with the sun, and the scene is remounted to change it
const { cascadeCount, shadowMapSize } = QualityTierSettingsMap[qualityTier];
const { cascadedShadowNode, light: sun } = createSunLight({ cascadeCount, maxFar: SHADOW_MAX_FAR, shadowMapSize });
// The god rays' sun looks at the oak, so its one map is centred on what the camera circles
const godraysLight = createGodraysLight(GODRAYS_SHADOW_MAP_SIZE, GODRAYS_HALF_EXTENT);
godraysLight.target.position.set(0, knollHeight, 0);
// Shade is lit only by this, so the sky's colour above and the grass's below are the shade's colours
const hemisphere = new HemisphereLight();
const { origin, worldOffset } = useFloatingOrigin();
const fogUniforms = createFogUniforms();
fogUniforms.density.value = FOG_DENSITY;
fogUniforms.heightFalloff.value = FOG_HEIGHT_FALLOFF;
fogUniforms.startDistance.value = FOG_START_DISTANCE;
const postUniforms = createPostUniforms();
const skyUniforms = createSkyUniforms();
skyUniforms.cloudCoverage.value = CLOUD_COVERAGE;
const gameClock = useSky({
  cloudDriftPerSecond: CLOUD_DRIFT_PER_SECOND,
  skyKeyframes: WINDRISE_SKY_KEYFRAMES,
  skyTargets: {
    fogUniforms,
    godraysLight,
    hemisphere,
    light: sun,
    lightDistance: SUN_DISTANCE,
    lightUniforms,
    postUniforms,
    skyUniforms,
  },
  startMinutes: WINDRISE_START_MINUTES,
  tilt: SUN_TILT,
});
const gradeLutTexture = createGradeLutTexture(WINDRISE_GRADE_OPTIONS);
const postPipeline = usePostPipeline(() => qualityTier, { fogUniforms, godraysLight, gradeLutTexture, postUniforms });
if (IS_DEVELOPMENT)
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
  });

onUnmounted(() => {
  for (const geometry of [branchGeometry, leafGeometry, statueGeometry]) geometry.dispose();
  for (const material of [barkMaterial, leafMaterial, stoneMaterial]) material.dispose();
  rampTexture.dispose();
  gradeLutTexture.dispose();
  cascadedShadowNode.dispose();
  sun.dispose();
  godraysLight.dispose();
  hemisphere.dispose();
});
</script>

<template>
  <primitive :object="sun" />
  <primitive :object="sun.target" />
  <primitive :object="hemisphere" />
  <!-- Everything placed in the world is in this group, which the floating origin offsets -->
  <TresGroup :position="worldOffset">
    <primitive :object="godraysLight" />
    <primitive :object="godraysLight.target" />
    <GenshinTerrain
      :light-uniforms
      :origin
      :ramp-texture
      :terrain-options="WINDRISE_TERRAIN_OPTIONS"
      @change="godraysLight.shadow.needsUpdate = true"
    />
    <TresGroup :position="[0, knollHeight - 0.5, 0]">
      <TresMesh :geometry="branchGeometry" :material="barkMaterial" cast-shadow receive-shadow />
      <TresMesh :geometry="leafGeometry" :material="leafMaterial" cast-shadow receive-shadow />
    </TresGroup>
    <TresMesh
      :geometry="statueGeometry"
      :material="stoneMaterial"
      :position="[STATUE_OFFSET_X, statueHeight - 0.2, STATUE_OFFSET_Z]"
      cast-shadow
      receive-shadow
    />
  </TresGroup>
</template>
