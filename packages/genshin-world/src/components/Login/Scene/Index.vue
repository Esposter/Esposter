<script setup lang="ts">
import type { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

import { usePostPipeline } from "#src/composables/usePostPipeline";
import palette from "#src/data/login/palette.json";
import sky from "#src/data/login/sky.json";
import { createLoginClouds } from "#src/services/login/cloud/createLoginClouds";
import { LOGIN_DOOR_LIGHT_MS } from "#src/services/login/constants";
import { LOGIN_DOOR_GLOW_COLOR, LOGIN_DOOR_POSITION } from "#src/services/login/door/constants";
import { createLoginDoorGeometry } from "#src/services/login/door/createLoginDoorGeometry";
import {
  LOGIN_CAMERA_FAR,
  LOGIN_CAMERA_FOV,
  LOGIN_CAMERA_HEIGHT,
  LOGIN_CAMERA_PITCH,
  LOGIN_CAMERA_START_Z,
  LOGIN_CLOUD_COVERAGE,
  LOGIN_CLOUD_SEA_HEIGHT,
  LOGIN_CLOUD_SEA_SIZE,
  LOGIN_FLIGHT_DISTANCE,
  LOGIN_FOG_DENSITY,
  LOGIN_FOG_HEIGHT_FALLOFF,
  LOGIN_FOG_SCATTER_POWER,
  LOGIN_FOG_SCATTER_STRENGTH,
  LOGIN_FOG_START_DISTANCE,
  LOGIN_GRADE_OPTIONS,
  LOGIN_LIGHT_DISTANCE,
  LOGIN_RAMP_OPTIONS,
  LOGIN_RIM_STRENGTH,
  LOGIN_SHADOW_BIAS,
  LOGIN_SHADOW_EXTENT,
  LOGIN_SHADOW_MAP_SIZE,
  LOGIN_SHADOW_NORMAL_BIAS,
} from "#src/services/login/scene/constants";
import { LoginSkyStateMap } from "#src/services/login/scene/LoginSkyStateMap";
import { createLoginSilhouettesGeometry } from "#src/services/login/silhouette/createLoginSilhouettesGeometry";
import { createLoginTowersGeometry } from "#src/services/login/tower/createLoginTowersGeometry";
import { createLoginWalkwayGeometry } from "#src/services/login/walkway/createLoginWalkwayGeometry";
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
  createRimNode,
  createSkyNode,
  createSkyUniforms,
  createToonMaterial,
  QualityTier,
} from "genshin-engine";
import { DirectionalLight, HemisphereLight } from "three";
import {
  abs,
  color,
  exp,
  mix,
  mx_fractal_noise_float,
  positionLocal,
  positionWorld,
  smoothstep,
  uniform,
} from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

interface Props {
  // The share of the camera's flight flown, from the title's pose at 0 to the door's at 1
  flight: number;
  isDoorLit: boolean;
  timeOfDay: LoginTimeOfDay;
}

const { flight, isDoorLit, timeOfDay } = defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
// The frames drawn before the scene is said to be ready: WebGPU compiles each pipeline on first use, so the first few
// Frames can come out before every material has
const READY_FRAME_COUNT = 10;
// The cloud sea's billows, as the noise's scale on the ground plane and where its lit tops start
const CLOUD_SEA_SCALE = 0.012;
const CLOUD_SEA_EDGE_START = 0.05;
const CLOUD_SEA_EDGE_END = 0.35;
// The door's light: a line down its middle this many metres to its half width, over a glow across the whole panel
const DOOR_SLIT_WIDTH = 0.16;
const DOOR_SLIT_STRENGTH = 4;
const DOOR_PANEL_STRENGTH = 0.6;
const { scene } = useTres();
const { onRender } = useLoop();
const rampTexture = createRampTexture(LOGIN_RAMP_OPTIONS);
const lightUniforms = createLightUniforms();
lightUniforms.rimStrength.value = LOGIN_RIM_STRENGTH;
const light = new DirectionalLight();
// The light's shadow covers the walkway around the camera and follows it down the flight, as the moon's and the sun's
// Shadows of the towers fall across the walkway in the references
light.castShadow = true;
light.shadow.mapSize.setScalar(LOGIN_SHADOW_MAP_SIZE);
Object.assign(light.shadow.camera, {
  bottom: -LOGIN_SHADOW_EXTENT,
  far: LOGIN_LIGHT_DISTANCE * 2,
  left: -LOGIN_SHADOW_EXTENT,
  right: LOGIN_SHADOW_EXTENT,
  top: LOGIN_SHADOW_EXTENT,
});
light.shadow.bias = LOGIN_SHADOW_BIAS;
light.shadow.normalBias = LOGIN_SHADOW_NORMAL_BIAS;
const godraysLight = createGodraysLight(1024, 160);
const hemisphere = new HemisphereLight();
const fogUniforms = createFogUniforms();
fogUniforms.baseHeight.value = LOGIN_CLOUD_SEA_HEIGHT;
fogUniforms.density.value = LOGIN_FOG_DENSITY;
fogUniforms.heightFalloff.value = LOGIN_FOG_HEIGHT_FALLOFF;
fogUniforms.startDistance.value = LOGIN_FOG_START_DISTANCE;
fogUniforms.scatterPower.value = LOGIN_FOG_SCATTER_POWER;
fogUniforms.scatterStrength.value = LOGIN_FOG_SCATTER_STRENGTH;
const postUniforms = createPostUniforms();
const skyUniforms = createSkyUniforms();
skyUniforms.cloudCoverage.value = LOGIN_CLOUD_COVERAGE;
skyUniforms.horizonBand.value = sky.horizonBand;
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
    postUniforms.godraysColor.value.setScalar(0);
  },
);
// The stone every part is carved from, the door's panel with its frame, fitted from their diffuse textures
const stoneMaterial = createToonMaterial({ color: palette.stone, lightUniforms, rampTexture });
const doorMaterial = createToonMaterial({ color: palette.stone, lightUniforms, rampTexture });
// The door lights from a line down its middle outward, over the panel's own glow, as the game opens it
const doorGlow = uniform(0);
doorMaterial.emissiveNode = createRimNode(lightUniforms).add(
  color(LOGIN_DOOR_GLOW_COLOR).mul(
    doorGlow.mul(
      exp(abs(positionLocal.x).div(DOOR_SLIT_WIDTH).negate()).mul(DOOR_SLIT_STRENGTH).add(DOOR_PANEL_STRENGTH),
    ),
  ),
);
const towersGeometry = createLoginTowersGeometry();
const silhouettesGeometry = createLoginSilhouettesGeometry();
const walkwayGeometry = createLoginWalkwayGeometry();
const { frame: doorFrameGeometry, panel: doorPanelGeometry } = createLoginDoorGeometry();
// The cloud sea as billows of the clouds' own two colours, lit tops over shaded hollows, which the fog then pales
// Into the horizon as they recede
const cloudSeaMaterial = new MeshBasicNodeMaterial();
cloudSeaMaterial.colorNode = mix(
  skyUniforms.cloudShadeColor,
  skyUniforms.cloudLitColor,
  smoothstep(CLOUD_SEA_EDGE_START, CLOUD_SEA_EDGE_END, mx_fractal_noise_float(positionWorld.xz.mul(CLOUD_SEA_SCALE))),
);
const loginClouds = createLoginClouds(skyUniforms);
const gradeLutTexture = createGradeLutTexture(LOGIN_GRADE_OPTIONS);
usePostPipeline(QualityTier.High, { fogUniforms, godraysLight, gradeLutTexture, postUniforms });
let renderedFrameCount = 0;
// The camera flies along -z, three's own forward, from beyond the walkway's far end toward the door, pitched down
const cameraZ = computed(() => LOGIN_CAMERA_START_Z - flight * LOGIN_FLIGHT_DISTANCE);
onRender(({ delta }) => {
  light.target.position.set(0, 0, cameraZ.value - LOGIN_SHADOW_EXTENT / 2);
  light.position
    .copy(light.target.position)
    .addScaledVector(LoginSkyStateMap[timeOfDay].lightDirection, LOGIN_LIGHT_DISTANCE);
  doorGlow.value = isDoorLit ? Math.min(doorGlow.value + (delta * 1000) / LOGIN_DOOR_LIGHT_MS, 1) : 0;
  renderedFrameCount++;
  if (renderedFrameCount === READY_FRAME_COUNT) emit("ready");
});

onUnmounted(() => {
  scene.value.backgroundNode = null;
  rampTexture.dispose();
  gradeLutTexture.dispose();
  stoneMaterial.dispose();
  doorMaterial.dispose();
  cloudSeaMaterial.dispose();
  loginClouds.dispose();
  walkwayGeometry.dispose();
  towersGeometry.dispose();
  silhouettesGeometry.dispose();
  doorFrameGeometry.dispose();
  doorPanelGeometry.dispose();
  light.dispose();
  godraysLight.dispose();
  hemisphere.dispose();
});
</script>

<template>
  <TresPerspectiveCamera
    :far="LOGIN_CAMERA_FAR"
    :fov="LOGIN_CAMERA_FOV"
    :position="[0, LOGIN_CAMERA_HEIGHT, cameraZ]"
    :rotation="[LOGIN_CAMERA_PITCH, 0, 0]"
  />
  <primitive :object="light" />
  <primitive :object="light.target" />
  <primitive :object="hemisphere" />
  <primitive :object="loginClouds.group" />
  <primitive :object="godraysLight" />
  <primitive :object="godraysLight.target" />
  <TresMesh :geometry="walkwayGeometry" cast-shadow receive-shadow :material="stoneMaterial" />
  <TresMesh :geometry="towersGeometry" cast-shadow receive-shadow :material="stoneMaterial" />
  <TresMesh :geometry="silhouettesGeometry" cast-shadow receive-shadow :material="stoneMaterial" />
  <!-- The door faces the camera coming down the walkway from +z, and stands only once the flight has brought the -->
  <!-- Camera to it: the title's frames show the walkway running on with no door on it -->
  <TresGroup v-if="flight >= 1" :position="LOGIN_DOOR_POSITION">
    <TresMesh :geometry="doorFrameGeometry" cast-shadow receive-shadow :material="stoneMaterial" />
    <TresMesh :geometry="doorPanelGeometry" cast-shadow receive-shadow :material="doorMaterial" />
  </TresGroup>
  <TresMesh :material="cloudSeaMaterial" :position="[0, LOGIN_CLOUD_SEA_HEIGHT, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[LOGIN_CLOUD_SEA_SIZE, LOGIN_CLOUD_SEA_SIZE]" />
  </TresMesh>
</template>
