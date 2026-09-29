<script setup lang="ts">
import type { QualityTier } from "genshin-engine";

import {
  BARK_COLOR,
  FOG_FAR,
  FOG_NEAR,
  GROUND_BOUNCE_COLOR,
  HEMISPHERE_INTENSITY,
  HORIZON_COLOR,
  LEAF_COLOR,
  RIM_STRENGTH,
  SKY_COLOR,
  STATUE_OFFSET_X,
  STATUE_OFFSET_Z,
  STONE_COLOR,
  SUN_DIRECTION,
  SUN_DISTANCE,
  SUN_INTENSITY,
  WINDRISE_OAK_OPTIONS,
  WINDRISE_RESOLUTION,
  WINDRISE_SIZE,
} from "@/services/genshin/windrise/constants";
import { getWindriseHeight } from "@/services/genshin/windrise/getWindriseHeight";
import { writeWindriseColor } from "@/services/genshin/windrise/writeWindriseColor";
import {
  createHeightfieldGeometry,
  createLeafMaterial,
  createLightUniforms,
  createRampTexture,
  createStatueGeometry,
  createToonMaterial,
  createTreeGeometry,
  QualityTierSettingsMap,
} from "genshin-engine";
import { Color, DirectionalLight, Fog, HemisphereLight, Vector3 } from "three";

interface Props {
  qualityTier: QualityTier;
}

const { qualityTier } = defineProps<Props>();
const { scene } = useTres();
const knollHeight = getWindriseHeight(0, 0);
const statueHeight = getWindriseHeight(STATUE_OFFSET_X, STATUE_OFFSET_Z);
// The ramp every material in the scene shades through: a narrow step, a little past the grazing angle
const rampTexture = createRampTexture({ resolution: 64, softness: 0.08, terminator: 0.52 });
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
const groundMaterial = createToonMaterial({ isVertexColors: true, lightUniforms, rampTexture });
const { branchGeometry, leafGeometry } = createTreeGeometry(WINDRISE_OAK_OPTIONS);
const barkMaterial = createToonMaterial({ color: BARK_COLOR, lightUniforms, rampTexture });
const leafMaterial = createLeafMaterial({ color: LEAF_COLOR, lightUniforms, rampTexture });
const statueGeometry = createStatueGeometry();
const stoneMaterial = createToonMaterial({ color: STONE_COLOR, lightUniforms, rampTexture });
// The sun follows the oak rather than the camera: the scene is small enough for one shadow map to cover it
const sun = new DirectionalLight(0xfff4e0, SUN_INTENSITY);
sun.position
  .copy(sunDirection)
  .multiplyScalar(SUN_DISTANCE)
  .setY(sun.position.y + knollHeight);
sun.target.position.set(0, knollHeight, 0);
sun.castShadow = true;
const { shadowMapSize } = QualityTierSettingsMap[qualityTier];
sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
sun.shadow.camera.left = -60;
sun.shadow.camera.right = 60;
sun.shadow.camera.top = 60;
sun.shadow.camera.bottom = -60;
sun.shadow.camera.far = SUN_DISTANCE * 2;
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.05;
// Shade is lit only by this, so the sky's blue above and the grass's green below are the shade's colours
const hemisphere = new HemisphereLight(SKY_COLOR, GROUND_BOUNCE_COLOR, HEMISPHERE_INTENSITY);
scene.value.background = new Color(SKY_COLOR);
scene.value.fog = new Fog(HORIZON_COLOR, FOG_NEAR, FOG_FAR);

onUnmounted(() => {
  scene.value.background = null;
  scene.value.fog = null;
  for (const geometry of [groundGeometry, branchGeometry, leafGeometry, statueGeometry]) geometry.dispose();
  for (const material of [groundMaterial, barkMaterial, leafMaterial, stoneMaterial]) material.dispose();
  rampTexture.dispose();
  sun.dispose();
  hemisphere.dispose();
});
</script>

<template>
  <primitive :object="sun" />
  <primitive :object="sun.target" />
  <primitive :object="hemisphere" />
  <TresMesh :geometry="groundGeometry" :material="groundMaterial" receive-shadow />
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
