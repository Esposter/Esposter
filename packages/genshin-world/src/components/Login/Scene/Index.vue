<script setup lang="ts">
import type { LoginGlide } from "#src/models/login/LoginGlide";
import type { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

import { usePostPipeline } from "#src/composables/usePostPipeline";
import palette from "#src/data/login/palette.json";
import sky from "#src/data/login/sky.json";
import { LoginPartFamily } from "#src/models/login/LoginPartFamily";
import { LoginStage } from "#src/models/login/LoginStage";
import { createLoginClouds } from "#src/services/login/cloud/createLoginClouds";
import { LOGIN_DOOR_LIGHT_MS } from "#src/services/login/constants";
import {
  LOGIN_DOOR_GLOW_COLOR,
  LOGIN_DOOR_POSITION,
  LOGIN_DOOR_RISE_DEPTH,
  LOGIN_DOOR_RISE_KEYFRAMES,
} from "#src/services/login/door/constants";
import { createLoginDoorGeometry } from "#src/services/login/door/createLoginDoorGeometry";
import { advanceLoginGlide } from "#src/services/login/scene/advanceLoginGlide";
import {
  LOGIN_CAMERA_FAR,
  LOGIN_CAMERA_FOV,
  LOGIN_CAMERA_HEIGHT,
  LOGIN_CAMERA_PITCH,
  LOGIN_CAMERA_YAW,
  LOGIN_CAMERA_Z,
  LOGIN_CLOUD_COVERAGE,
  LOGIN_CLOUD_SEA_HEIGHT,
  LOGIN_CLOUD_SEA_SIZE,
  LOGIN_DOOR_RUSH_LIMIT,
  LOGIN_DOOR_RUSH_MS,
  LOGIN_DOOR_RUSH_SHARE,
  LOGIN_FOG_DENSITY,
  LOGIN_FOG_HEIGHT_FALLOFF,
  LOGIN_FOG_SCATTER_POWER,
  LOGIN_FOG_SCATTER_STRENGTH,
  LOGIN_FOG_START_DISTANCE,
  LOGIN_GLIDE_TITLE_SCROLLED,
  LOGIN_GLIDE_TITLE_SPEED,
  LOGIN_GRADE_OPTIONS,
  LOGIN_LIGHT_DISTANCE,
  LOGIN_RAMP_OPTIONS,
  LOGIN_RIM_STRENGTH,
  LOGIN_SHADOW_BIAS,
  LOGIN_SHADOW_EXTENT,
  LOGIN_SHADOW_MAP_SIZE,
  LOGIN_SHADOW_NORMAL_BIAS,
  LOGIN_TOWERS_ROW,
  LOGIN_WALKWAY_ROW,
} from "#src/services/login/scene/constants";
import { LoginSkyStateMap } from "#src/services/login/scene/LoginSkyStateMap";
import { createLoginSilhouettesGeometry } from "#src/services/login/silhouette/createLoginSilhouettesGeometry";
import { createLoginTowersGeometry } from "#src/services/login/tower/createLoginTowersGeometry";
import { createLoginWalkwayPieces } from "#src/services/login/walkway/createLoginWalkwayPieces";
import { readLoginWalkwaySink } from "#src/services/login/walkway/readLoginWalkwaySink";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
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
import { DirectionalLight, Group, HemisphereLight, Mesh } from "three";
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
  vec2,
} from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

interface Props {
  isDoorLit: boolean;
  // The login screen's stage, which sets the glide's pace and, from the door's, brings it to rest at the door
  stage: LoginStage;
  timeOfDay: LoginTimeOfDay;
}

const { isDoorLit, stage, timeOfDay } = defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
// The frames drawn before the scene is said to be ready: WebGPU compiles each pipeline on first use, so the first few
// Frames can come out before every material has. A scene mounted at the door is ready only once the door has risen
const READY_FRAME_COUNT = 10;
const [doorRiseMs = 0] = LOGIN_DOOR_RISE_KEYFRAMES.at(-1) ?? [];
// The cloud sea's billows, as the noise's scale on the ground plane and where its lit tops start
const CLOUD_SEA_SCALE = 0.048;
const CLOUD_SEA_EDGE_START = 0.05;
const CLOUD_SEA_EDGE_END = 0.35;
// The door's light: a line down its middle this many metres to its half width, over a glow across the whole panel
const DOOR_SLIT_WIDTH = 0.04;
const DOOR_SLIT_STRENGTH = 4;
const DOOR_PANEL_STRENGTH = 0.6;
// The witness render's parts, drawn in place of the fitted ones of each family it names when the parity page provides
// Them, alone when it asks
const witness = inject(SceneWitnessKey, null);
const checkIsOwnFamilyDrawn = (family: LoginPartFamily): boolean => !witness?.families.value.includes(family);
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
const godraysLight = createGodraysLight(1024, 40);
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
const walkwayPieces = createLoginWalkwayPieces();
// The walkway's row, every piece of every copy a mesh of its own, so each rises into place on its own and the toon
// Outline, which reads a mesh's own vertices, follows it
const walkway = new Group();
const walkwayMeshes = Array.from({ length: LOGIN_WALKWAY_ROW.count }, (_, copy) =>
  walkwayPieces.map(({ depth, geometry, seed }) => {
    const mesh = new Mesh(geometry, stoneMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    walkway.add(mesh);
    return { copy, depth, mesh, seed };
  }),
).flat();
const { frame: doorFrameGeometry, panel: doorPanelGeometry } = createLoginDoorGeometry();
// The metres the cloud sea's billows have scrolled toward the camera
const cloudSeaScrolled = uniform(0);
// The cloud sea as billows of the clouds' own two colours, lit tops over shaded hollows, which the fog then pales
// Into the horizon as they recede
const cloudSeaMaterial = new MeshBasicNodeMaterial();
cloudSeaMaterial.colorNode = mix(
  skyUniforms.cloudShadeColor,
  skyUniforms.cloudLitColor,
  smoothstep(
    CLOUD_SEA_EDGE_START,
    CLOUD_SEA_EDGE_END,
    mx_fractal_noise_float(positionWorld.xz.add(vec2(0, cloudSeaScrolled)).mul(CLOUD_SEA_SCALE)),
  ),
);
const loginClouds = createLoginClouds(skyUniforms);
const gradeLutTexture = createGradeLutTexture(LOGIN_GRADE_OPTIONS);
usePostPipeline(QualityTier.High, { fogUniforms, godraysLight, gradeLutTexture, postUniforms });
let renderedFrameCount = 0;
let isReadyEmitted = false;
// How long the door has been lit, which the rush toward it follows, and how long it has been rising into place
const rushMs = shallowRef(0);
const riseMs = shallowRef(0);
const checkIsDoorDue = (): boolean => stage === LoginStage.Door || stage === LoginStage.Entering;
// The world glides toward the camera at the stage's pace and wraps each row by its length, the camera holding its one
// Pose, from the moment of the loop the title opens at; a scene mounted at the door starts at rest there. The glide is
// Kept off Vue's reactivity, and only the numbers the template places by, which stand still when it does, are refs
let glide: LoginGlide = checkIsDoorDue()
  ? { scrolled: 0, speed: 0, stopAt: 0 }
  : { scrolled: LOGIN_GLIDE_TITLE_SCROLLED, speed: LOGIN_GLIDE_TITLE_SPEED };
const towersOffset = shallowRef(-(glide.scrolled % LOGIN_TOWERS_ROW.length));
// How far past its place of rest the door is, riding on the walkway's copy it comes to rest on
const doorAhead = shallowRef(0);
const doorPosition = computed((): [number, number, number] => {
  const nextIndex = LOGIN_DOOR_RISE_KEYFRAMES.findIndex(([timeMs]) => timeMs > riseMs.value);
  const [endMs = 0, endShare = 1] = LOGIN_DOOR_RISE_KEYFRAMES[nextIndex] ?? [];
  const [startMs = 0, startShare = 1] = LOGIN_DOOR_RISE_KEYFRAMES[nextIndex - 1] ?? [];
  const share =
    nextIndex === -1 ? 1 : startShare + ((endShare - startShare) * (riseMs.value - startMs)) / (endMs - startMs);
  const [x, y, z] = LOGIN_DOOR_POSITION;
  return [x, y - LOGIN_DOOR_RISE_DEPTH * (1 - share), z + doorAhead.value];
});
// The camera holds its pose, and on the click rushes on toward the door
const cameraZ = computed(() => {
  const share = Math.min(LOGIN_DOOR_RUSH_SHARE * (rushMs.value / LOGIN_DOOR_RUSH_MS) ** 2, LOGIN_DOOR_RUSH_LIMIT);
  return LOGIN_CAMERA_Z - share * (LOGIN_CAMERA_Z - LOGIN_DOOR_POSITION[2]);
});
onRender(({ delta: frameDelta }) => {
  // A tool holding the witness's clock holds the scene's time too, so one view draws one frame
  const delta = witness?.isClockHeld.value ? 0 : frameDelta;
  glide = advanceLoginGlide(glide, stage, delta);
  const { scrolled, stopAt = scrolled } = glide;
  towersOffset.value = -(scrolled % LOGIN_TOWERS_ROW.length);
  doorAhead.value = stopAt - scrolled;
  const walkwayOffset = -(scrolled % LOGIN_WALKWAY_ROW.length);
  for (const { copy, depth, mesh, seed } of walkwayMeshes) {
    const z = walkwayOffset + copy * LOGIN_WALKWAY_ROW.length;
    mesh.position.set(0, -readLoginWalkwaySink(z + depth - cameraZ.value, seed), z);
  }
  cloudSeaScrolled.value = scrolled;
  loginClouds.scroll(scrolled);
  light.target.position.set(0, 0, cameraZ.value + LOGIN_SHADOW_EXTENT / 2);
  light.position
    .copy(light.target.position)
    .addScaledVector(LoginSkyStateMap[timeOfDay].lightDirection, LOGIN_LIGHT_DISTANCE);
  fogUniforms.density.value = witness?.isAlone.value ? 0 : LOGIN_FOG_DENSITY;
  doorGlow.value = isDoorLit ? Math.min(doorGlow.value + (delta * 1000) / LOGIN_DOOR_LIGHT_MS, 1) : 0;
  rushMs.value = isDoorLit ? rushMs.value + delta * 1000 : 0;
  riseMs.value = checkIsDoorDue() ? riseMs.value + delta * 1000 : 0;
  renderedFrameCount++;
  if (isReadyEmitted || renderedFrameCount < READY_FRAME_COUNT || (checkIsDoorDue() && riseMs.value < doorRiseMs))
    return;
  isReadyEmitted = true;
  emit("ready");
});

onUnmounted(() => {
  scene.value.backgroundNode = null;
  rampTexture.dispose();
  gradeLutTexture.dispose();
  stoneMaterial.dispose();
  doorMaterial.dispose();
  cloudSeaMaterial.dispose();
  loginClouds.dispose();
  for (const { geometry } of walkwayPieces) geometry.dispose();
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
    :rotation="[LOGIN_CAMERA_PITCH, LOGIN_CAMERA_YAW, 0]"
    rotation-order="YXZ"
  />
  <primitive :object="light" />
  <primitive :object="light.target" />
  <primitive :object="hemisphere" />
  <primitive v-if="!witness?.isAlone.value" :object="loginClouds.group" />
  <primitive :object="godraysLight" />
  <primitive :object="godraysLight.target" />
  <primitive v-if="witness" :object="witness.parts" />
  <primitive v-if="checkIsOwnFamilyDrawn(LoginPartFamily.Walkway)" :object="walkway" />
  <!-- The towers' row, with their bridges and pillars, each copy its length ahead of the last -->
  <TresGroup :position="[0, 0, towersOffset]">
    <template v-for="copy in LOGIN_TOWERS_ROW.count" :key="copy">
      <TresMesh
        v-if="checkIsOwnFamilyDrawn(LoginPartFamily.Towers)"
        :geometry="towersGeometry"
        cast-shadow
        receive-shadow
        :material="stoneMaterial"
        :position="[0, 0, (copy - 1) * LOGIN_TOWERS_ROW.length]"
      />
      <TresMesh
        v-if="checkIsOwnFamilyDrawn(LoginPartFamily.Bridges)"
        :geometry="silhouettesGeometry"
        cast-shadow
        receive-shadow
        :material="stoneMaterial"
        :position="[0, 0, (copy - 1) * LOGIN_TOWERS_ROW.length]"
      />
    </template>
  </TresGroup>
  <!-- The door turns to face the camera coming up the walkway from -z, and stands only once it is due, on the -->
  <!-- Walkway's copy the glide comes to rest on: the title's frames show the walkway running on with no door on it -->
  <TresGroup
    v-if="checkIsDoorDue() && checkIsOwnFamilyDrawn(LoginPartFamily.Door)"
    :position="doorPosition"
    :rotation="[0, Math.PI, 0]"
  >
    <TresMesh :geometry="doorFrameGeometry" cast-shadow receive-shadow :material="stoneMaterial" />
    <TresMesh :geometry="doorPanelGeometry" cast-shadow receive-shadow :material="doorMaterial" />
  </TresGroup>
  <TresMesh
    v-if="!witness?.isAlone.value"
    :material="cloudSeaMaterial"
    :position="[0, LOGIN_CLOUD_SEA_HEIGHT, 0]"
    :rotation="[-Math.PI / 2, 0, 0]"
  >
    <TresPlaneGeometry :args="[LOGIN_CLOUD_SEA_SIZE, LOGIN_CLOUD_SEA_SIZE]" />
  </TresMesh>
</template>
