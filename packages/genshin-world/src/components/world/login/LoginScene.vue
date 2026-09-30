<script setup lang="ts">
import type { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

import { usePostPipeline } from "#src/composables/usePostPipeline";
import {
  LOGIN_CAMERA_FOV,
  LOGIN_CAMERA_POSITION,
  LOGIN_CAMERA_TARGET,
  LOGIN_CLOUD_COVERAGE,
  LOGIN_CLOUD_SEA_HEIGHT,
  LOGIN_CLOUD_SEA_SIZE,
  LOGIN_FOG_DENSITY,
  LOGIN_FOG_HEIGHT_FALLOFF,
  LOGIN_FOG_START_DISTANCE,
  LOGIN_GRADE_OPTIONS,
  LOGIN_LIGHT_DISTANCE,
  LOGIN_RAMP_OPTIONS,
  LOGIN_RIM_STRENGTH,
  LOGIN_STEP_HEIGHT,
  LOGIN_STEP_LENGTH,
  LOGIN_STEP_WIDTH,
  LOGIN_STONE_COLOR,
  LOGIN_TOWER_FLOOR,
  LOGIN_TOWERS,
  LOGIN_WALKWAY_DEPTH,
  LOGIN_WALKWAY_LENGTH,
  LOGIN_WALKWAY_START,
  LOGIN_WALKWAY_WIDTH,
  LOGIN_WING_CENTRE,
  LOGIN_WING_LENGTH,
  LOGIN_WING_WIDTH,
  LoginSkyStateMap,
} from "#src/services/login/constants";
import { createLoginTowerGeometry } from "#src/services/login/createLoginTowerGeometry";
import { useLoop, useTres } from "@tresjs/core";
import { watchImmediate } from "@vueuse/core";
import {
  applySkyState,
  createFogUniforms,
  createGodraysLight,
  createGradeLutTexture,
  createLightUniforms,
  createPostUniforms,
  createRampTexture,
  createSkyNode,
  createSkyUniforms,
  createToonMaterial,
  QualityTier,
} from "genshin-engine";
import { BoxGeometry, BufferGeometry, DirectionalLight, HemisphereLight } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mix, mx_fractal_noise_float, positionWorld, smoothstep } from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

interface Props {
  timeOfDay: LoginTimeOfDay;
}

const { timeOfDay } = defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
// The frames drawn before the scene is said to be ready: WebGPU compiles each pipeline on first use, so the first few
// Frames can come out before every material has
const READY_FRAME_COUNT = 10;
// The cloud sea's billows, as the noise's scale on the ground plane and where its lit tops start
const CLOUD_SEA_SCALE = 0.012;
const CLOUD_SEA_EDGE_START = 0.05;
const CLOUD_SEA_EDGE_END = 0.35;
const { scene } = useTres();
const { onRender } = useLoop();
const rampTexture = createRampTexture(LOGIN_RAMP_OPTIONS);
const lightUniforms = createLightUniforms();
lightUniforms.rimStrength.value = LOGIN_RIM_STRENGTH;
const light = new DirectionalLight();
const godraysLight = createGodraysLight(1024, 160);
const hemisphere = new HemisphereLight();
const fogUniforms = createFogUniforms();
fogUniforms.density.value = LOGIN_FOG_DENSITY;
fogUniforms.heightFalloff.value = LOGIN_FOG_HEIGHT_FALLOFF;
fogUniforms.startDistance.value = LOGIN_FOG_START_DISTANCE;
const postUniforms = createPostUniforms();
const skyUniforms = createSkyUniforms();
skyUniforms.cloudCoverage.value = LOGIN_CLOUD_COVERAGE;
const skyTargets = {
  fogUniforms,
  godraysLight,
  hemisphere,
  light,
  lightDistance: LOGIN_LIGHT_DISTANCE,
  lightUniforms,
  postUniforms,
  skyUniforms,
};
scene.value.backgroundNode = createSkyNode(skyUniforms);
watchImmediate(
  () => timeOfDay,
  (newTimeOfDay) => {
    applySkyState(LoginSkyStateMap[newTimeOfDay], skyTargets);
  },
);
const stoneMaterial = createToonMaterial({ color: LOGIN_STONE_COLOR, lightUniforms, rampTexture });
const towerGeometries = LOGIN_TOWERS.map((tower) => ({
  geometry: createLoginTowerGeometry(tower, LOGIN_TOWER_FLOOR),
  position: [tower.position[0], 0, tower.position[1]] as const,
}));
// The walkway from under the camera to the step it ends at, its wings either side and the step, one geometry
const walkwayParts = [
  new BoxGeometry(LOGIN_WALKWAY_WIDTH, LOGIN_WALKWAY_DEPTH, LOGIN_WALKWAY_LENGTH).translate(
    0,
    -LOGIN_WALKWAY_DEPTH / 2,
    LOGIN_WALKWAY_START - LOGIN_WALKWAY_LENGTH / 2,
  ),
  new BoxGeometry(LOGIN_WING_WIDTH, LOGIN_WALKWAY_DEPTH, LOGIN_WING_LENGTH).translate(
    0,
    -LOGIN_WALKWAY_DEPTH / 2,
    LOGIN_WING_CENTRE,
  ),
  new BoxGeometry(LOGIN_STEP_WIDTH, LOGIN_STEP_HEIGHT + LOGIN_WALKWAY_DEPTH, LOGIN_STEP_LENGTH).translate(
    0,
    (LOGIN_STEP_HEIGHT - LOGIN_WALKWAY_DEPTH) / 2,
    LOGIN_WALKWAY_START - LOGIN_WALKWAY_LENGTH - LOGIN_STEP_LENGTH / 2,
  ),
];
const walkwayGeometry = mergeGeometries(walkwayParts) ?? new BufferGeometry();
for (const part of walkwayParts) part.dispose();
// The cloud sea as billows of the clouds' own two colours, lit tops over shaded hollows, which the fog then pales
// Into the horizon as they recede
const cloudSeaMaterial = new MeshBasicNodeMaterial();
cloudSeaMaterial.colorNode = mix(
  skyUniforms.cloudShadeColor,
  skyUniforms.cloudLitColor,
  smoothstep(CLOUD_SEA_EDGE_START, CLOUD_SEA_EDGE_END, mx_fractal_noise_float(positionWorld.xz.mul(CLOUD_SEA_SCALE))),
);
const gradeLutTexture = createGradeLutTexture(LOGIN_GRADE_OPTIONS);
usePostPipeline(QualityTier.High, { fogUniforms, godraysLight, gradeLutTexture, postUniforms });
let renderedFrameCount = 0;
onRender(() => {
  renderedFrameCount++;
  if (renderedFrameCount === READY_FRAME_COUNT) emit("ready");
});

onUnmounted(() => {
  scene.value.backgroundNode = null;
  rampTexture.dispose();
  gradeLutTexture.dispose();
  stoneMaterial.dispose();
  cloudSeaMaterial.dispose();
  walkwayGeometry.dispose();
  for (const { geometry } of towerGeometries) geometry.dispose();
  light.dispose();
  godraysLight.dispose();
  hemisphere.dispose();
});
</script>

<template>
  <TresPerspectiveCamera
    :fov="LOGIN_CAMERA_FOV"
    :far="3000"
    :look-at="LOGIN_CAMERA_TARGET"
    :position="LOGIN_CAMERA_POSITION"
  />
  <primitive :object="light" />
  <primitive :object="light.target" />
  <primitive :object="hemisphere" />
  <primitive :object="godraysLight" />
  <primitive :object="godraysLight.target" />
  <TresMesh :geometry="walkwayGeometry" :material="stoneMaterial" />
  <TresMesh
    v-for="({ geometry, position }, index) of towerGeometries"
    :key="index"
    :geometry
    :material="stoneMaterial"
    :position
  />
  <TresMesh :material="cloudSeaMaterial" :position="[0, LOGIN_CLOUD_SEA_HEIGHT, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[LOGIN_CLOUD_SEA_SIZE, LOGIN_CLOUD_SEA_SIZE]" />
  </TresMesh>
</template>
