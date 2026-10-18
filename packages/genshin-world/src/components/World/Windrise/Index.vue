<script setup lang="ts">
import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitTaunt } from "#src/models/kit/KitTaunt";
import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";
import type { Seelie } from "#src/models/puzzle/Seelie";
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { Wildlife } from "#src/models/wildlife/Wildlife";
import type { WindriseData } from "#src/models/windrise/WindriseData";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { TerrainWorkerGround } from "#src/models/world/TerrainWorkerGround";
import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { GrassTrail, LandmarkCollider, Locomotion, QualityTier } from "genshin-engine";
import type { Object3D, Vector3 } from "three";

import CharacterModel from "#src/components/Character/Model/Index.vue";
import QuestBeam from "#src/components/Quest/Beam/Index.vue";
import WorldCharacterPlaceholder from "#src/components/World/CharacterPlaceholder/Index.vue";
import WorldEnemies from "#src/components/World/Enemies/Index.vue";
import WorldFrostbearingTree from "#src/components/World/FrostbearingTree/Index.vue";
import WorldGrass from "#src/components/World/Grass/Index.vue";
import WorldInteractables from "#src/components/World/Interactables/Index.vue";
import WorldLandmarks from "#src/components/World/Landmarks/Index.vue";
import WorldOculi from "#src/components/World/Oculi/Index.vue";
import WorldPlants from "#src/components/World/Plants/Index.vue";
import WorldSightTrails from "#src/components/World/SightTrails/Index.vue";
import WorldTerrain from "#src/components/World/Terrain/Index.vue";
import WorldWater from "#src/components/World/Water/Index.vue";
import WorldWaterfalls from "#src/components/World/Waterfalls/Index.vue";
import WorldWeather from "#src/components/World/Weather/Index.vue";
import WorldWildlife from "#src/components/World/Wildlife/Index.vue";
import { useAreaWeather } from "#src/composables/useAreaWeather";
import { useCharacterAvatar } from "#src/composables/useCharacterAvatar";
import { useFloatingOrigin } from "#src/composables/useFloatingOrigin";
import { useGenshinTuning } from "#src/composables/useGenshinTuning";
import { usePostPipeline } from "#src/composables/usePostPipeline";
import { useRegionData } from "#src/composables/useRegionData";
import { useResidentSpots } from "#src/composables/useResidentSpots";
import { useSceneExports } from "#src/composables/useSceneExports";
import { useSky } from "#src/composables/useSky";
import { useSunShadow } from "#src/composables/useSunShadow";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { WindrisePartFamily } from "#src/models/windrise/WindrisePartFamily";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { updateAvatarFaces } from "#src/services/character/avatar/updateAvatarFaces";
import { GRASS_CAPTURE_RESOLUTION, GRASS_CAPTURE_SIZE, TILE_SELECTION_CAPACITY } from "#src/services/constants";
import { getSightRadius } from "#src/services/elementalSight/getSightRadius";
import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { findQuestTargetPosition } from "#src/services/quest/findQuestTargetPosition";
import { LEAF_SHADER, SCENE_FAMILY_KEY } from "#src/services/scene/constants";
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
  WINDRISE_SCENE_EXPORT_COMPONENT,
  WINDRISE_SKY_KEYFRAMES,
  WINDRISE_START_MINUTES,
} from "#src/services/windrise/constants";
import { createWindrisePavingGeometry } from "#src/services/windrise/createWindrisePavingGeometry";
import { createWindriseTerrainOptions } from "#src/services/windrise/createWindriseTerrainOptions";
import { LandmarkKindWindrisePartFamilyMap } from "#src/services/windrise/LandmarkKindWindrisePartFamilyMap";
import { createTreeSpeciesOptionsMap } from "#src/services/world/createTreeSpeciesOptionsMap";
import { WorldSceneExportFamilyMeshRegexMap } from "#src/services/world/WorldSceneExportFamilyMeshRegexMap";
import { getResultAsync, noop } from "@esposter/shared";
import { useLoop, useTres } from "@tresjs/core";
import { whenever } from "@vueuse/core";
import {
  createFogUniforms,
  createGradeLutTexture,
  createGroundCapture,
  createLeafMaterial,
  createLightUniforms,
  createPostUniforms,
  createRampTexture,
  createSightUniforms,
  createSkyUniforms,
  createSunLight,
  createTerrainSelection,
  createToonMaterial,
  createWaterUniforms,
  createWindUniforms,
  QualityTierSettingsMap,
} from "genshin-engine";
import { HemisphereLight, Scene } from "three";

interface Props {
  // The character on the field, whose game model the host's exports draw in place of the pack's when it is the Traveler
  activeCharacterId: number;
  // The regions and their areas, whose outlines bring a region's data within reach and set the weather the camera
  // Stands in
  catalogue: Catalogue;
  // What the character is drawn on, which the screen's controller moves in the world's own coordinates, so it is placed
  // Among everything in the world
  characterBody?: Object3D;
  // How the character on the field moves, whose body's capsule is drawn where it has no pack
  characterLocomotion?: Locomotion;
  // Where the pack of the character on the field is read from, which it is drawn on the body from, or as its body's
  // Capsule where it has none or its model fails to load
  characterPackReader?: CharacterPackReader;
  createTerrainWorker: () => Worker;
  // The sight the screen turns on and off, which the world spreads its range by and lights its things under, none where
  // No screen holds one
  elementalSight?: ElementalSight;
  // The enemies in the world by their spawn key, which the enemies write as camps load and enemies die
  enemyMap: Map<string, Enemy>;
  // The game's enemy tables, which the camps spawn their enemies from
  enemyTables: EnemyTables;
  // The Frostbearing Trees the official map marks, each stood in at its place
  frostbearingTreePlaces: FrostbearingTreePlace[];
  // Where the hosted game data is read from, which each region's palettes are read from as it comes within reach
  gameDataBaseUrl: string;
  // The world's ground at a point in its own coordinates, which everything placed in the world stands on
  getGroundHeight: (x: number, z: number) => number;
  // The bends the character leaves as it walks through the grass, which the grass parts round
  grassTrail: GrassTrail;
  // The game's minute of the day the clock is held at, in place of its running from the region's start
  heldMinutes?: number;
  // The drops and the residents in the world, each a row of the prompts and drawn as a stand-in
  interactables: Interactable[];
  // Whether a screen over the world holds its clock, as the game's menus pause its time
  isHeld?: true;
  // Whether the world is paused under a cover, its canvas drawing only the frames it is asked for
  isPaused?: true;
  // Whether the development tuning panel is shown, which the app decides
  isTuning: boolean;
  // The last teleport, which brings back a boss whose blossom is unclaimed, none until the player has teleported
  lastTeleportAt?: Temporal.ZonedDateTime;
  // The effects on the team, whose live taunts the enemies strike instead of the character within their aggro range
  kitEffectState: KitEffectState;
  // What the character's body and the camera collide with, which the landmarks are given to as they arrive
  landmarkCollider: LandmarkCollider;
  // The Oculi not yet found, each stood in at its place
  oculusPlaces: OculusPlace[];
  // The world coordinate the scene's origin stands on, which the screen's free camera reads the ground through
  origin: Vector3;
  // The camps of the ley line outcrops whose fights run, which the world's enemies spawn whole as each fight starts
  outcropCamps?: EnemyCamp[];
  qualityTier: QualityTier;
  // The navigated quest's objective, by the target its condition names, which a beam rises over, "" with none
  questTargetId: string;
  // Where the app serves each region's data, fetched by id as the camera comes within reach
  regionDataBaseUrl: string;
  // Where the host serves the developer's own exports of the game's scenes, drawn in place of our stand-ins of each
  // Family they hold, as only the development server does
  sceneExportBaseUrl?: string;
  // The Seelies of Mondstadt, whose courts the sight leads a trail to while each rests
  seelies: Seelie[];
  // The animals in the world, each stood at its place or fallen, which the session holds
  wildlifeList: Wildlife[];
  // Windrise's records: its ground, its surfaces, its oak, plants, paving and statue, and its water
  windriseData: WindriseData;
  // Each defeated boss's Trounce Blossom where it fell, which holds the boss until it is claimed or a teleport comes
  trounceBlossoms: ReadonlyMap<string, TrounceBlossom>;
  // The World Level the camps spawn at, from the player's Adventure EXP and quests
  worldLevel: number;
  // The game's world level table, which raises the camps' levels under a World Level
  worldLevelRows: readonly WorldLevelRow[];
}

const {
  activeCharacterId,
  catalogue,
  characterBody,
  characterLocomotion,
  characterPackReader,
  createTerrainWorker,
  elementalSight,
  enemyMap,
  enemyTables,
  frostbearingTreePlaces,
  gameDataBaseUrl,
  getGroundHeight,
  grassTrail,
  heldMinutes,
  interactables,
  isHeld,
  isPaused,
  isTuning,
  lastTeleportAt,
  kitEffectState,
  landmarkCollider,
  oculusPlaces,
  origin,
  outcropCamps,
  qualityTier,
  questTargetId,
  regionDataBaseUrl,
  sceneExportBaseUrl,
  seelies,
  wildlifeList,
  trounceBlossoms,
  windriseData,
  worldLevel,
  worldLevelRows,
} = defineProps<Props>();
const emit = defineEmits<{
  charge: [];
  defeat: [enemy: Enemy, enemyDrops: EnemyDrops];
  ready: [];
  respawn: [spawnKey: string];
  strike: [enemy: Enemy, taunt: KitTaunt | undefined];
}>();
// The witness render's parts, drawn in place of ours of each family it names when the parity page provides them, beside
// Ours rather than in the floating origin's group, since the page's tools find the camera among their siblings and stay
// Within reach of the origin
// oxlint-disable-next-line no-restricted-globals -- the parity page reaches a published scene's own parts with no prop for a host to see
const witness = inject(SceneWitnessKey, null);
const checkIsWitnessed = (family: WindrisePartFamily): boolean => witness?.families.value.includes(family) ?? false;
const hiddenLandmarkKinds = computed(() => [
  ...(checkIsWitnessed(WindrisePartFamily.Oak) ? [LandmarkKind.Tree] : []),
  ...(checkIsWitnessed(WindrisePartFamily.Statue) ? [LandmarkKind.StatueOfTheSeven] : []),
]);
const rampTexture = createRampTexture(WINDRISE_RAMP_OPTIONS);
const lightUniforms = createLightUniforms();
lightUniforms.rimStrength.value = RIM_STRENGTH;
const drawnCharacterAvatar = useCharacterAvatar(sceneExportBaseUrl, () => activeCharacterId, {
  lightUniforms,
  rampTexture,
});
const { baseGround, groundLayers, oak, paving, plants, statue, surfaces, water } = windriseData;
// The ground's quadtree, which the terrain streams and the grass reads, bounded by Windrise's ground, which every
// Region's ground laid over it stands within, and the records each terrain worker computes its tiles over
const terrainOptions = createWindriseTerrainOptions([baseGround]);
const terrainWorkerGround: TerrainWorkerGround = { baseGround, groundLayers, surfaces, waterLevel: water.level };
// The trees the landmarks grow and the plants' impostor is baked from
const treeSpeciesOptionsMap = createTreeSpeciesOptionsMap(oak);
// The paving stones round the statue, cut from the stone the statue is made of
const pavingGeometry = createWindrisePavingGeometry(paving);
const pavingMaterial = createToonMaterial({
  color: surfaces.Paving.color,
  detail: surfaces.Paving.detail,
  lightUniforms,
  rampTexture,
});

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
const worldOffset = useFloatingOrigin(origin);
const { isRegionDataSettled, regionDataMap, regionGroundMap } = useRegionData(
  origin,
  regionDataBaseUrl,
  gameDataBaseUrl,
  catalogue,
);
// The game's own exports of Windrise and of each region in reach, where the host serves them, lit as our stand-ins are and
// Drawn in their place: the leaf cards in the wind as our crowns are, and every other part in the toon material
const sceneExportMap = useSceneExports(
  sceneExportBaseUrl,
  () => [WINDRISE_SCENE_EXPORT_COMPONENT, ...regionDataMap.keys()],
  WorldSceneExportFamilyMeshRegexMap,
  ({ shader }) =>
    shader === LEAF_SHADER
      ? createLeafMaterial({ lightUniforms, rampTexture }, windUniforms)
      : createToonMaterial({ lightUniforms, rampTexture }),
);
// Whether ours of a family is drawn: not where a witness render draws the exports' in its place, nor where Windrise's
// Exports hold the family
const checkIsOwnFamilyDrawn = (family: WindrisePartFamily): boolean =>
  !checkIsWitnessed(family) && !sceneExportMap.get(WINDRISE_SCENE_EXPORT_COMPONENT)?.familyBoundsMap.has(family);
// The regions' grounds laid over Windrise's so far, which the terrain's workers raise every tile after by
const regionGrounds = computed<RegionGround[]>(() => [...regionGroundMap.values()]);
const fogUniforms = createFogUniforms();
fogUniforms.heightFalloff.value = FOG_HEIGHT_FALLOFF;
fogUniforms.startDistance.value = FOG_START_DISTANCE;
const postUniforms = createPostUniforms();
// The sight's mask: the drops, the residents and the enemies, drawn in the colours the sight lights them, which the post
// Chain reads where its reach is. Its spread and strength are read off the screen's sight each frame, and none is drawn
// While no screen gives one. Its stand-ins are placed in the world's own coordinates, so the scene is offset by the floating
// Origin as the world's group is, and the reach's origin is read against the camera the same way
const sightScene = new Scene();
const sightUniforms = createSightUniforms();
const { onBeforeRender } = useLoop();
const { advance } = useTres();
onBeforeRender(() => {
  if (drawnCharacterAvatar.value) updateAvatarFaces(drawnCharacterAvatar.value, lightUniforms.sunDirection.value);
  sightScene.position.set(-origin.x, 0, -origin.z);
  if (!elementalSight) return;
  sightUniforms.origin.value.set(elementalSight.origin.x - origin.x, elementalSight.origin.z - origin.z);
  sightUniforms.radius.value = getSightRadius(elementalSight);
  sightUniforms.strength.value = elementalSight.isOn ? 1 : 0;
});
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
// Alone, the witness's exports are drawn with no haze and no clouds, so a pose is matched on their edges alone
const baseCloudCoverage = computed(() => (witness?.isAlone.value ? 0 : CLOUD_COVERAGE));
const baseFogDensity = computed(() => (witness?.isAlone.value ? 0 : FOG_DENSITY));
const gameClock = useSky({
  checkIsHeld: () => Boolean(isHeld) || heldMinutes !== undefined || (witness?.isClockHeld.value ?? false),
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
// The sun's shadows are drawn again only when the sun, the view or a caster has moved, after the sky has turned the sun
useSunShadow({
  enemyMap,
  getCharacterBody: () => characterBody,
  getCharacterLocomotion: () => characterLocomotion,
  sunLight: { cascadedShadowNode, light: sun },
});
// The clock only starts at its held minute, so a minute held anew is set on it
watch(
  () => heldMinutes,
  (minutes) => {
    if (minutes !== undefined) gameClock.minutes = minutes;
  },
);
// Where the residents stand at the clock's minute, which the quest's target and the world's prompts read
const { residentSpots } = useResidentSpots(regionDataMap, gameClock, origin, getGroundHeight);
const questTargetPosition = computed(() =>
  questTargetId ? findQuestTargetPosition(regionDataMap, residentSpots.value, questTargetId) : undefined,
);
// The courts of the Seelies still resting, which the sight leads a trail to while it is on
const seelieCourts = computed(() =>
  seelies.filter(({ state }) => state === SeelieState.Resting).map(({ court }) => court),
);
// The pack whose model failed to load, by its reader's key, drawn as its body's capsule in its place
const failedCharacterPackKey = ref("");
// The tiles the terrain draws, which it writes each frame and what reads the ground compares against what it last read
const terrainDraws = createTerrainSelection(TILE_SELECTION_CAPACITY);
// The ground under the camera from above, which the grass redraws as the camera moves and grows on, and the rain's
// Splashes stand on
const groundCapture = createGroundCapture(GRASS_CAPTURE_SIZE, GRASS_CAPTURE_RESOLUTION);
// The weather of the area the camera stands in, which Windrise's is clear in, as its reference screenshots are
const areaWeather = useAreaWeather(origin, catalogue);
const gradeLutTexture = createGradeLutTexture(WINDRISE_GRADE_OPTIONS);
// No god rays and no bloom: neither is measured off a reference of Windrise, and drawn as they stand they veil the
// Whole frame, the god rays marching hundreds of metres of lit air to their most opacity and bloom lifting the whole
// Sky past its threshold, so the frame is drawn through the haze, the grade and the tone mapping alone. No occlusion
// Either, and the sky handed on with it as the login's is, which the parity page's tools read each pixel's ray under
const postPipeline = usePostPipeline(
  () => qualityTier,
  {
    fogUniforms,
    gradeLutTexture,
    isBloomed: false,
    postUniforms,
    sight: { litScene: sightScene, uniforms: sightUniforms },
  },
  0,
  skyUniforms,
);
// The world is ready once the ground of its first view and the regions in reach of it have arrived, so what shows it
// Never shows the bare water under a ground still streaming in
const isTerrainSettled = ref(false);
whenever(
  () => isTerrainSettled.value && isRegionDataSettled.value,
  async () => {
    // The view's pipelines, outlines included, compile before the world shows, so its first frame builds none. A compile
    // That fails is logged and the world shows anyway, drawn without the warm-up, rather than never being ready
    await getResultAsync(async () => {
      if (!postPipeline.value) return;
      const compiled = postPipeline.value.compileAsync();
      // The compile waits on the next frame, and a world paused under the opening draws only the frames it is asked for,
      // So a paused world asks for that frame; a running world draws it anyway, and its canvas refuses `advance`
      if (isPaused) advance();
      await measureLoadStep("compile", compiled);
    }).match(noop, (error) => {
      console.error("The Windrise post pipeline failed to compile", error);
    });
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

// The regions' data and grounds, and the spot each resident is shown at, which the world screen reads the residents
// And the world's ground from, and the clock the Time screen sets the hour of
defineExpose({ gameClock, regionDataMap, regionGroundMap, residentSpots });
onUnmounted(() => {
  rampTexture.dispose();
  pavingGeometry.dispose();
  pavingMaterial.dispose();
  gradeLutTexture.dispose();
  groundCapture.renderTarget.dispose();
  groundCapture.material.dispose();
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
    <primitive v-for="[component, { parts }] of sceneExportMap" :key="component" :object="parts" />
    <!-- Hidden rather than unmounted where the witness draws the ground, since the world is ready once its ground is -->
    <TresGroup :visible="checkIsOwnFamilyDrawn(WindrisePartFamily.Ground)">
      <!-- Marked as the ground's family alone, so the grass, which a witness render never draws, is left out of ours -->
      <TresGroup :user-data="{ [SCENE_FAMILY_KEY]: WindrisePartFamily.Ground }">
        <WorldTerrain
          :create-terrain-worker
          :draws="terrainDraws"
          :is-ground-settled="isRegionDataSettled"
          :light-uniforms
          :origin
          :ramp-texture
          :region-grounds
          :shadow-reach="SHADOW_MAX_FAR"
          :terrain-options
          :terrain-worker-ground
          :water-uniforms
          :wind-uniforms
          @ready="isTerrainSettled = true"
        />
      </TresGroup>
      <WorldGrass
        :blade-height="GRASS_BLADE_HEIGHT"
        :blade-width="GRASS_BLADE_WIDTH"
        :ground-capture
        :grass-trail
        :light-uniforms
        :origin
        :quality-tier
        :ramp-texture
        :rings="[NEAR_GRASS_RING, MIDDLE_GRASS_RING]"
        :terrain-draws
        :terrain-options
        :water-uniforms
        :wind-uniforms
      />
    </TresGroup>
    <!-- Marked as the paving family alone, so a witness render draws ours of the stones round the statue in place of the exports' -->
    <TresGroup
      :visible="checkIsOwnFamilyDrawn(WindrisePartFamily.Paving)"
      :user-data="{ [SCENE_FAMILY_KEY]: WindrisePartFamily.Paving }"
    >
      <TresMesh :geometry="pavingGeometry" :material="pavingMaterial" cast-shadow receive-shadow />
    </TresGroup>
    <!-- Ahead of the water, whose haze replaces the weather's under its surface -->
    <WorldWeather
      :base-cloud-coverage
      :base-fog-density
      :fog-uniforms
      :get-ground-height
      :ground-capture
      :hemisphere
      :light-uniforms
      :origin
      :sky-uniforms
      :water-uniforms
      :weather="areaWeather"
      :wind-uniforms
    />
    <WorldWater :fog-uniforms :light-uniforms :origin :sky-uniforms :water-uniforms />
    <WorldWaterfalls :region-data-map :scene-export-map :water-uniforms />
    <WorldLandmarks
      :get-ground-height
      :hidden-kinds="hiddenLandmarkKinds"
      :kind-family-map="LandmarkKindWindrisePartFamilyMap"
      :landmark-collider
      :light-uniforms
      :ramp-texture
      :region-data-map
      :scene-export-map
      :statue
      :surfaces
      :tree-species-options-map
      :wind-uniforms
    />
    <!-- The plants the game places round the oak, instanced once per prefab, drawn as the grass family alone where the witness does not -->
    <TresGroup
      :visible="checkIsOwnFamilyDrawn(WindrisePartFamily.Grass)"
      :user-data="{ [SCENE_FAMILY_KEY]: WindrisePartFamily.Grass }"
    >
      <WorldPlants :get-ground-height :light-uniforms :plants :ramp-texture :surfaces :tree-species-options-map />
    </TresGroup>
    <!-- Enemies wander where the references show none, so a witness render, judged against them, draws none -->
    <WorldEnemies
      v-if="!witness"
      :kit-effect-state
      :enemy-map
      :enemy-tables
      :get-ground-height
      :is-held
      :last-teleport-at="lastTeleportAt"
      :trounce-blossoms="trounceBlossoms"
      :light-uniforms
      :outcrop-camps="outcropCamps"
      :ramp-texture
      :region-data-map
      :sight-scene
      :target="characterBody?.position"
      :world-level
      :world-level-rows
      @defeat="(enemy, enemyDrops) => emit('defeat', enemy, enemyDrops)"
      @respawn="(spawnKey) => emit('respawn', spawnKey)"
      @strike="(enemy, taunt) => emit('strike', enemy, taunt)"
    />
    <!-- The animals run from the character where the references show none, so a witness render draws none of them -->
    <WorldWildlife
      v-if="!witness"
      :get-ground-height
      :is-held
      :light-uniforms
      :ramp-texture
      :target="characterBody?.position"
      :wildlife-list
      @charge="emit('charge')"
    />
    <!-- The Frostbearing Trees are stood in as well, which a witness render draws none of -->
    <WorldFrostbearingTree
      v-if="!witness"
      :get-ground-height
      :light-uniforms
      :places="frostbearingTreePlaces"
      :ramp-texture
    />
    <WorldOculi
      v-if="!witness && oculusPlaces.length > 0"
      :get-ground-height
      :light-uniforms
      :places="oculusPlaces"
      :ramp-texture
    />
    <!-- The drops and the residents in the world are stood in as well, which a witness render draws none of either -->
    <WorldInteractables v-if="!witness" :interactables :light-uniforms :ramp-texture :sight-scene />
    <QuestBeam v-if="questTargetPosition" :origin :position="questTargetPosition" />
    <!-- The sight's trails from the character to the courts of the Seelies still resting, in the sight's scene only -->
    <WorldSightTrails
      :elemental-sight
      :ends="seelieCourts"
      :get-ground-height
      :sight-scene
      :target="characterBody?.position"
    />
    <!-- The character on the field, on the controller's body -->
    <primitive v-if="characterBody" :object="characterBody">
      <primitive
        v-if="drawnCharacterAvatar"
        :object="drawnCharacterAvatar.model"
        :rotation-y="Math.PI"
        cast-shadow
        receive-shadow
      />
      <CharacterModel
        v-else-if="characterPackReader && failedCharacterPackKey !== characterPackReader.key"
        :key="characterPackReader.key"
        :character-pack-reader
        :light-uniforms
        :ramp-texture
        @error="failedCharacterPackKey = characterPackReader?.key ?? ''"
      />
      <WorldCharacterPlaceholder
        v-else-if="characterLocomotion"
        :light-uniforms
        :locomotion="characterLocomotion"
        :ramp-texture
      />
    </primitive>
  </TresGroup>
</template>
