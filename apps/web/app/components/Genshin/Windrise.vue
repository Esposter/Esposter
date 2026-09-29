<script setup lang="ts">
import type { QualityTier } from "genshin-engine";

import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import {
  BARK_COLOR,
  FOG_DENSITY,
  FOG_HEIGHT_FALLOFF,
  FOG_START_DISTANCE,
  GODRAYS_HALF_EXTENT,
  GODRAYS_SHADOW_MAP_SIZE,
  GROUND_BOUNCE_COLOR,
  HEMISPHERE_INTENSITY,
  HORIZON_COLOR,
  LEAF_COLOR,
  RIM_STRENGTH,
  SHADOW_MAX_FAR,
  SKY_COLOR,
  STATUE_OFFSET_X,
  STATUE_OFFSET_Z,
  STONE_COLOR,
  SUN_DIRECTION,
  SUN_DISTANCE,
  SUN_INTENSITY,
  WINDRISE_GRADE_OPTIONS,
  WINDRISE_OAK_OPTIONS,
  WINDRISE_RAMP_OPTIONS,
  WINDRISE_RESOLUTION,
  WINDRISE_SIZE,
} from "@/services/genshin/windrise/constants";
import { getWindriseHeight } from "@/services/genshin/windrise/getWindriseHeight";
import { writeWindriseColor } from "@/services/genshin/windrise/writeWindriseColor";
import {
  createFogUniforms,
  createGodraysLight,
  createGradeLutTexture,
  createHeightfieldGeometry,
  createLeafMaterial,
  createLightUniforms,
  createPostUniforms,
  createRampTexture,
  createStatueGeometry,
  createSunLight,
  createToonMaterial,
  createTreeGeometry,
  QualityTierSettingsMap,
} from "genshin-engine";
import { Color, HemisphereLight, Vector3 } from "three";

interface Props {
  qualityTier: QualityTier;
}

const { qualityTier } = defineProps<Props>();
const { scene } = useTres();
const knollHeight = getWindriseHeight(0, 0);
const statueHeight = getWindriseHeight(STATUE_OFFSET_X, STATUE_OFFSET_Z);
const rampTexture = createRampTexture(WINDRISE_RAMP_OPTIONS);
const lightUniforms = createLightUniforms();
const sunDirection = new Vector3(...SUN_DIRECTION).normalize();
lightUniforms.sunDirection.value.copy(sunDirection);
lightUniforms.rimColor.value.set(HORIZON_COLOR);
lightUniforms.rimStrength.value = RIM_STRENGTH;

const groundGeometry = createHeightfieldGeometry({
  getHeight: getWindriseHeight,
  resolution: WINDRISE_RESOLUTION,
  size: WINDRISE_SIZE,
  writeColor: writeWindriseColor,
});
const groundMaterial = createToonMaterial({ isOutlined: false, isVertexColors: true, lightUniforms, rampTexture });
const { branchGeometry, leafGeometry } = createTreeGeometry(WINDRISE_OAK_OPTIONS);
const barkMaterial = createToonMaterial({ color: BARK_COLOR, lightUniforms, rampTexture });
const leafMaterial = createLeafMaterial({ color: LEAF_COLOR, lightUniforms, rampTexture });
const statueGeometry = createStatueGeometry();
const stoneMaterial = createToonMaterial({ color: STONE_COLOR, lightUniforms, rampTexture });
// The tier is read once: its cascades are built with the sun, and the scene is remounted to change it
const { cascadeCount, shadowMapSize } = QualityTierSettingsMap[qualityTier];
const { cascadedShadowNode, light: sun } = createSunLight({
  cascadeCount,
  color: 0xfff4e0,
  intensity: SUN_INTENSITY,
  maxFar: SHADOW_MAX_FAR,
  shadowMapSize,
});
sun.position.copy(sunDirection).multiplyScalar(SUN_DISTANCE);
// The god rays' sun stands where the scene's does, looking at the oak, and its map is drawn once: the sun is fixed
const godraysLight = createGodraysLight(GODRAYS_SHADOW_MAP_SIZE, GODRAYS_HALF_EXTENT);
godraysLight.position
  .copy(sunDirection)
  .multiplyScalar(SUN_DISTANCE)
  .setY(godraysLight.position.y + knollHeight);
godraysLight.target.position.set(0, knollHeight, 0);
// Shade is lit only by this, so the sky's blue above and the grass's green below are the shade's colours
const hemisphere = new HemisphereLight(SKY_COLOR, GROUND_BOUNCE_COLOR, HEMISPHERE_INTENSITY);
scene.value.background = new Color(SKY_COLOR);
const fogUniforms = createFogUniforms();
fogUniforms.color.value.set(HORIZON_COLOR);
fogUniforms.density.value = FOG_DENSITY;
fogUniforms.heightFalloff.value = FOG_HEIGHT_FALLOFF;
fogUniforms.startDistance.value = FOG_START_DISTANCE;
const postUniforms = createPostUniforms();
const gradeLutTexture = createGradeLutTexture(WINDRISE_GRADE_OPTIONS);
const postPipeline = usePostPipeline(() => qualityTier, { fogUniforms, godraysLight, gradeLutTexture, postUniforms });
if (IS_DEVELOPMENT)
  useGenshinTuning({
    fogUniforms,
    gradeLutTexture,
    gradeOptions: WINDRISE_GRADE_OPTIONS,
    lightUniforms,
    postPipeline,
    postUniforms,
    rampOptions: WINDRISE_RAMP_OPTIONS,
    rampTexture,
  });

onUnmounted(() => {
  scene.value.background = null;
  for (const geometry of [groundGeometry, branchGeometry, leafGeometry, statueGeometry]) geometry.dispose();
  for (const material of [groundMaterial, barkMaterial, leafMaterial, stoneMaterial]) material.dispose();
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
  <primitive :object="godraysLight" />
  <primitive :object="godraysLight.target" />
  <primitive :object="hemisphere" />
  <TresMesh :geometry="groundGeometry" :material="groundMaterial" cast-shadow receive-shadow />
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
</template>
