<script setup lang="ts">
import type { LoginGlide } from "#src/models/login/LoginGlide";
import type { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

import { usePostPipeline } from "#src/composables/usePostPipeline";
import sky from "#src/data/login/sky.json";
import stone from "#src/data/login/stone.json";
import stoneLight from "#src/data/login/stoneLight.json";
import { LoginPartFamily } from "#src/models/login/LoginPartFamily";
import { LoginStage } from "#src/models/login/LoginStage";
import { createLoginClouds } from "#src/services/login/cloud/createLoginClouds";
import { LoginCloudCoverMap } from "#src/services/login/cloud/LoginCloudCoverMap";
import { LOGIN_DOOR_LIGHT_MS } from "#src/services/login/constants";
import {
  LOGIN_DOOR_GLOW_COLOR,
  LOGIN_DOOR_POSITION,
  LOGIN_DOOR_RISE_DEPTH,
  LOGIN_DOOR_RISE_KEYFRAMES,
} from "#src/services/login/door/constants";
import { createLoginDoorGeometry } from "#src/services/login/door/createLoginDoorGeometry";
import { createLoginDoorRelief } from "#src/services/login/door/createLoginDoorRelief";
import { createLoginHullsGeometry } from "#src/services/login/hull/createLoginHullsGeometry";
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
  LOGIN_GLIDE_DOOR_SCROLLED,
  LOGIN_GLIDE_TITLE_SCROLLED,
  LOGIN_GLIDE_TITLE_SPEED,
  LOGIN_LIGHT_DISTANCE,
  LOGIN_RIM_STRENGTH,
  LOGIN_SHADOW_BIAS,
  LOGIN_SHADOW_EXTENT,
  LOGIN_SHADOW_MAP_SIZE,
  LOGIN_SHADOW_NORMAL_BIAS,
  LOGIN_TOWERS_ROW,
  LOGIN_TOWERS_ROW_OFFSET,
  LOGIN_WALKWAY_ROW,
} from "#src/services/login/scene/constants";
import { LoginSkyStateMap } from "#src/services/login/scene/LoginSkyStateMap";
import { loginStoneLight } from "#src/services/login/scene/loginStoneLight";
import { computeLoginTowerAtlas } from "#src/services/login/tower/computeLoginTowerAtlas";
import { createLoginTowerFacade } from "#src/services/login/tower/createLoginTowerFacade";
import { createLoginTowersGeometry } from "#src/services/login/tower/createLoginTowersGeometry";
import { LOGIN_WALKWAY_RISE_DEPTH, LOGIN_WALKWAY_SUNK_DISTANCE } from "#src/services/login/walkway/constants";
import { createLoginPaving } from "#src/services/login/walkway/createLoginPaving";
import { createLoginWalkwayPieces } from "#src/services/login/walkway/createLoginWalkwayPieces";
import { getLoginWalkwaySink } from "#src/services/login/walkway/getLoginWalkwaySink";
import { sinkLoginWitnessWalkway } from "#src/services/login/walkway/sinkLoginWitnessWalkway";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { useLoop, useTres } from "@tresjs/core";
import { watchImmediate } from "@vueuse/core";
import {
  applySkyState,
  applyStoneLight,
  createFogUniforms,
  createLightUniforms,
  createPostUniforms,
  createSkyGradientTexture,
  createSkyNode,
  createSkyUniforms,
  createStoneMaterial,
  QualityTier,
} from "genshin-engine";
import { BatchedMesh, DirectionalLight, Group, HemisphereLight, Matrix4 } from "three";
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
  // The glide held still at this many metres scrolled, for a reference taken at one moment of the title's loop
  heldScrolled?: number;
  isDoorLit: boolean;
  // The login screen's stage, which sets the glide's pace and, from the door's, brings it to rest at the door
  stage: LoginStage;
  timeOfDay: LoginTimeOfDay;
}

const { heldScrolled, isDoorLit, stage, timeOfDay } = defineProps<Props>();
const emit = defineEmits<{ doorFormed: []; ready: [] }>();
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
// oxlint-disable-next-line no-restricted-globals -- the parity page reaches a published scene's own parts with no prop for a host to see
const witness = inject(SceneWitnessKey, null);
const checkIsOwnFamilyDrawn = (family: LoginPartFamily): boolean => !witness?.families.value.includes(family);
const { scene } = useTres();
const { onRender } = useLoop();
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
const skyTargets = {
  fogUniforms,
  hemisphere,
  light,
  lightDistance: LOGIN_LIGHT_DISTANCE,
  lightUniforms,
  postUniforms,
  skyUniforms,
};
// The sky's gradient, the game's own fitted, which its bottom colour and horizon halo ride up the sky
const skyGradient = createSkyGradientTexture(sky.gradient);
scene.value.backgroundNode = createSkyNode(skyUniforms, skyGradient);
const loginClouds = createLoginClouds(skyUniforms);
watchImmediate(
  () => timeOfDay,
  (newTimeOfDay) => {
    applySkyState(LoginSkyStateMap[newTimeOfDay], skyTargets);
    applyStoneLight(stoneLight[newTimeOfDay], loginStoneLight, light);
    // Each hour's sky draws its own share of each band's clouds
    for (const [band, cover] of Object.entries(LoginCloudCoverMap[newTimeOfDay])) {
      const coverUniform = loginClouds.covers[band];
      if (coverUniform) coverUniform.value = cover;
    }
  },
);
// The stone each family of parts is carved from, as its game materials hold it, lit as the game's deferred pass lights
// It and drawn with no outline: the towers', the bridges', the walkway's, and the door's frame and its panel
const towersMaterial = createStoneMaterial(stone.towers, loginStoneLight);
// The towers' surfaces drawn over their lathes: each band's tone, its paint, its recesses and its gilding, and where a
// Tower stands open its colonnade lets the sky through
const towerAtlas = computeLoginTowerAtlas();
const towerFacade = createLoginTowerFacade(towerAtlas);
towersMaterial.colorNode = towerFacade.shade.mul(color(stone.towers.albedo));
towersMaterial.opacityNode = towerFacade.solid;
towersMaterial.alphaTest = 0.5;
const bridgesMaterial = createStoneMaterial(stone.bridges, loginStoneLight);
const walkwayMaterial = createStoneMaterial(stone.walkway, loginStoneLight);
// The walkway's tops carved with its paving: its pockets' stone a step darker and their rims tilted to the light
const paving = createLoginPaving();
walkwayMaterial.colorNode = color(stone.walkway.albedo).mul(paving.shade);
walkwayMaterial.normalNode = paving.normalNode;
const doorFrameMaterial = createStoneMaterial(stone.door, loginStoneLight);
// The door lights from a line down its middle outward, over the panel's own glow, as the game opens it
const doorGlow = uniform(0);
const doorMaterial = createStoneMaterial(
  stone.door,
  loginStoneLight,
  color(LOGIN_DOOR_GLOW_COLOR).mul(
    doorGlow.mul(
      exp(abs(positionLocal.x).div(DOOR_SLIT_WIDTH).negate()).mul(DOOR_SLIT_STRENGTH).add(DOOR_PANEL_STRENGTH),
    ),
  ),
);
// The door's front painted with its panel's raised bands and its feet's gilding over its stone
const doorAlbedo = createLoginDoorRelief().mul(color(stone.door.albedo));
doorFrameMaterial.colorNode = doorAlbedo;
doorMaterial.colorNode = doorAlbedo;
const towersGeometry = createLoginTowersGeometry(towerAtlas);
const hullsGeometry = createLoginHullsGeometry();
const walkwayPieces = createLoginWalkwayPieces();
// The walkway's row drawn as one batch, every piece of every copy an instance of its own, so each rises into place on
// Its own in one draw, and the toon outline, which places a batch's instances before it extrudes them, follows it. The
// Batch itself scrolls with the row, so only a rising piece's own place changes
const walkway = new BatchedMesh(
  LOGIN_WALKWAY_ROW.count * walkwayPieces.length,
  walkwayPieces.reduce((total, { geometry }) => total + geometry.getAttribute("position").count, 0),
  0,
  walkwayMaterial,
);
walkway.castShadow = true;
walkway.receiveShadow = true;
// The batch's own bounding sphere is read once and never follows its instances as they move, so the batch is never
// Culled as one; each piece is still culled on its own
walkway.frustumCulled = false;
const walkwayInstances = walkwayPieces.flatMap(({ depth, geometry, seed }) => {
  const geometryId = walkway.addGeometry(geometry);
  return Array.from({ length: LOGIN_WALKWAY_ROW.count }, (_, copy) => ({
    copy,
    depth,
    instanceId: walkway.addInstance(geometryId),
    seed,
  }));
});
const walkwayMatrix = new Matrix4();
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
// No grade and no bloom: every colour of the login is measured off its references through the tone mapping alone, the
// Sky's, the haze's and the stone's light, so the frame is drawn through that alone and each inverts exactly
usePostPipeline(QualityTier.High, { fogUniforms, isBloomed: false, postUniforms }, skyUniforms);
let renderedFrameCount = 0;
let isReadyEmitted = false;
let isDoorFormed = false;
// How long the door has been lit, which the rush toward it follows, and how long it has been rising into place
const rushMs = shallowRef(0);
const riseMs = shallowRef(0);
const checkIsDoorDue = (): boolean => stage === LoginStage.Door || stage === LoginStage.Entering;
// The door rises once it is due and has come within the walkway's far end, as its last blocks settle
const isDoorRising = shallowRef(false);
// The world glides toward the camera at the stage's pace and wraps each row by its length, the camera holding its one
// Pose, from the moment of the loop the title opens at; a scene mounted at the door starts at rest there. The glide is
// Kept off Vue's reactivity, and only the numbers the template places by, which stand still when it does, are refs. A
// Held glide stands where it is held and never moves
const getStartGlide = (): LoginGlide => {
  if (heldScrolled !== undefined) return { scrolled: heldScrolled, speed: 0 };
  else if (checkIsDoorDue())
    return { scrolled: LOGIN_GLIDE_DOOR_SCROLLED, speed: 0, stopAt: LOGIN_GLIDE_DOOR_SCROLLED };
  else return { scrolled: LOGIN_GLIDE_TITLE_SCROLLED, speed: LOGIN_GLIDE_TITLE_SPEED };
};
let glide = getStartGlide();
// The towers' row, scrolled with the glide each frame off Vue's reactivity, which would otherwise draw the template anew
const towers = new Group();
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
  if (heldScrolled === undefined) glide = advanceLoginGlide(glide, stage, delta);
  const { scrolled, stopAt = scrolled } = glide;
  // Read once a frame, where every walkway piece would otherwise ask again
  const isDoorDue = checkIsDoorDue();
  const walkwayScrolled = scrolled % LOGIN_WALKWAY_ROW.length;
  const [rowX, rowY, rowZ] = LOGIN_TOWERS_ROW_OFFSET;
  towers.position.set(rowX, rowY, rowZ - (scrolled % LOGIN_TOWERS_ROW.length));
  doorAhead.value = stopAt - scrolled;
  // Once the door is due the walkway ends at it, and nothing past it is built
  const doorAheadOfCamera = LOGIN_DOOR_POSITION[2] + doorAhead.value - cameraZ.value;
  // The witness's parts ride the glide with ours, off by whatever offset a tool sets them: its towers and bridges the
  // Row, its walkway the walkway's copies, assembling as ours does, and its door ours as it rises, standing only where
  // Ours does, so a frame of the title compares no door against none
  for (const group of witness?.parts.children ?? []) {
    const [x = 0, y = 0, z = 0] = (group.userData.offset as [number, number, number] | undefined) ?? [];
    group.position.set(x, y, z);
    if (group.name === LoginPartFamily.Towers || group.name === LoginPartFamily.Bridges)
      group.position.add(towers.position);
    else if (group.name === LoginPartFamily.Walkway) {
      group.position.z -= walkwayScrolled;
      sinkLoginWitnessWalkway(group, walkwayPieces, {
        cameraZ: cameraZ.value,
        doorAheadOfCamera: isDoorDue ? doorAheadOfCamera : undefined,
      });
    } else if (group.name === LoginPartFamily.Door) {
      group.position.y += doorPosition.value[1] - LOGIN_DOOR_POSITION[1];
      group.position.z += doorAhead.value;
      group.visible = isDoorRising.value && (witness?.families.value.includes(group.name) ?? false);
    }
  }
  walkway.position.z = -walkwayScrolled;
  for (const { copy, depth, instanceId, seed } of walkwayInstances) {
    const z = copy * LOGIN_WALKWAY_ROW.length;
    const ahead = walkway.position.z + z + depth - cameraZ.value;
    const sink = getLoginWalkwaySink(ahead, seed);
    // A piece stands only once it has begun to rise, so neither it nor its shadow shows before its turn
    walkway.setVisibleAt(instanceId, sink < LOGIN_WALKWAY_RISE_DEPTH && (!isDoorDue || ahead < doorAheadOfCamera));
    walkway.setMatrixAt(instanceId, walkwayMatrix.makeTranslation(0, -sink, z));
  }
  cloudSeaScrolled.value = scrolled;
  loginClouds.scroll(scrolled);
  light.target.position.set(0, 0, cameraZ.value + LOGIN_SHADOW_EXTENT / 2);
  light.position
    .copy(light.target.position)
    .addScaledVector(LoginSkyStateMap[timeOfDay].lightDirection, LOGIN_LIGHT_DISTANCE);
  fogUniforms.density.value = witness?.isAlone.value
    ? 0
    : (LoginSkyStateMap[timeOfDay].fogDensity ?? LOGIN_FOG_DENSITY);
  doorGlow.value = isDoorLit ? Math.min(doorGlow.value + (delta * 1000) / LOGIN_DOOR_LIGHT_MS, 1) : 0;
  rushMs.value = isDoorLit ? rushMs.value + delta * 1000 : 0;
  isDoorRising.value = isDoorDue && (isDoorRising.value || doorAheadOfCamera <= LOGIN_WALKWAY_SUNK_DISTANCE);
  riseMs.value = isDoorRising.value ? riseMs.value + delta * 1000 : 0;
  // The door's own interface waits on the door, once it has risen into place
  if (!isDoorFormed && isDoorRising.value && riseMs.value >= doorRiseMs) {
    isDoorFormed = true;
    emit("doorFormed");
  }
  renderedFrameCount++;
  if (isReadyEmitted || renderedFrameCount < READY_FRAME_COUNT || (isDoorDue && riseMs.value < doorRiseMs)) return;
  isReadyEmitted = true;
  emit("ready");
});

onUnmounted(() => {
  scene.value.backgroundNode = null;
  skyGradient.dispose();
  towerFacade.dispose();
  for (const material of [towersMaterial, bridgesMaterial, walkwayMaterial, doorFrameMaterial, doorMaterial])
    material.dispose();
  cloudSeaMaterial.dispose();
  loginClouds.dispose();
  for (const { geometry } of walkwayPieces) geometry.dispose();
  walkway.dispose();
  towersGeometry.dispose();
  hullsGeometry.dispose();
  doorFrameGeometry.dispose();
  doorPanelGeometry.dispose();
  light.dispose();
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
  <primitive v-if="witness" :object="witness.parts" />
  <primitive v-if="checkIsOwnFamilyDrawn(LoginPartFamily.Walkway)" :object="walkway" />
  <!-- The towers' row, with their bridges and pillars, each copy its length ahead of the last -->
  <primitive :object="towers">
    <template v-for="copy in LOGIN_TOWERS_ROW.count" :key="copy">
      <TresMesh
        v-if="checkIsOwnFamilyDrawn(LoginPartFamily.Towers)"
        :geometry="towersGeometry"
        cast-shadow
        receive-shadow
        :material="towersMaterial"
        :position="[0, 0, (copy - 1) * LOGIN_TOWERS_ROW.length]"
      />
      <TresMesh
        v-if="checkIsOwnFamilyDrawn(LoginPartFamily.Bridges)"
        :geometry="hullsGeometry"
        cast-shadow
        receive-shadow
        :material="bridgesMaterial"
        :position="[0, 0, (copy - 1) * LOGIN_TOWERS_ROW.length]"
      />
    </template>
  </primitive>
  <!-- The door turns to face the camera coming up the walkway from -z, and stands only once it is due and has come -->
  <!-- Within the walkway's far end, on the copy the glide comes to rest on: the title's frames show no door at all -->
  <TresGroup
    v-if="isDoorRising && checkIsOwnFamilyDrawn(LoginPartFamily.Door)"
    :position="doorPosition"
    :rotation="[0, Math.PI, 0]"
  >
    <TresMesh :geometry="doorFrameGeometry" receive-shadow :material="doorFrameMaterial" />
    <TresMesh :geometry="doorPanelGeometry" receive-shadow :material="doorMaterial" />
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
