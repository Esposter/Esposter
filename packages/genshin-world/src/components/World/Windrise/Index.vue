<script setup lang="ts">
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { LandmarkCollider, Locomotion, QualityTier } from "genshin-engine";
import type { Object3D, Vector3 } from "three";

import CharacterModel from "#src/components/Character/Model/Index.vue";
import QuestBeam from "#src/components/Quest/Beam/Index.vue";
import WorldCharacterPlaceholder from "#src/components/World/CharacterPlaceholder/Index.vue";
import WorldEnemies from "#src/components/World/Enemies/Index.vue";
import WorldGrass from "#src/components/World/Grass/Index.vue";
import WorldInteractables from "#src/components/World/Interactables/Index.vue";
import WorldLandmarks from "#src/components/World/Landmarks/Index.vue";
import WorldTerrain from "#src/components/World/Terrain/Index.vue";
import WorldWater from "#src/components/World/Water/Index.vue";
import WorldWeather from "#src/components/World/Weather/Index.vue";
import { useAreaWeather } from "#src/composables/useAreaWeather";
import { useFloatingOrigin } from "#src/composables/useFloatingOrigin";
import { useGenshinTuning } from "#src/composables/useGenshinTuning";
import { usePostPipeline } from "#src/composables/usePostPipeline";
import { useRegionData } from "#src/composables/useRegionData";
import { useSky } from "#src/composables/useSky";
import water from "#src/data/windrise/water.json";
import { WindrisePartFamily } from "#src/models/windrise/WindrisePartFamily";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { GRASS_CAPTURE_RESOLUTION, GRASS_CAPTURE_SIZE, TILE_SELECTION_CAPACITY } from "#src/services/constants";
import { findQuestTargetPosition } from "#src/services/quest/findQuestTargetPosition";
import { SCENE_FAMILY_KEY } from "#src/services/scene/constants";
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
import { LandmarkKindWindrisePartFamilyMap } from "#src/services/windrise/LandmarkKindWindrisePartFamilyMap";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { whenever } from "@vueuse/core";
import {
  createFogUniforms,
  createGradeLutTexture,
  createGroundCapture,
  createLightUniforms,
  createPostUniforms,
  createRampTexture,
  createSkyUniforms,
  createSunLight,
  createTerrainSelection,
  createWaterUniforms,
  createWindUniforms,
  QualityTierSettingsMap,
} from "genshin-engine";
import { HemisphereLight } from "three";

interface Props {
  // What the character is drawn on, which the screen's controller moves in the world's own coordinates, so it is placed
  // Among everything in the world
  characterBody?: Object3D;
  // The character on the field, drawn on the body from its pack, or as its body's capsule where no pack is served or its
  // Model fails to load
  characterId: number;
  // How the character on the field moves, whose body's capsule is drawn where no pack is served
  characterLocomotion?: Locomotion;
  // Where the host serves the characters' model packs, without which the character is drawn as its body's capsule
  characterPackBaseUrl?: string;
  createTerrainWorker: () => Worker;
  // The enemies in the world by their spawn key, which the enemies write as camps load and enemies die
  enemyMap: Map<string, Enemy>;
  // The game's minute of the day the clock is held at, in place of its running from the region's start
  heldMinutes?: number;
  // The drops and the residents in the world, each a row of the prompts and drawn as a stand-in
  interactables: Interactable[];
  // Whether a screen over the world holds its clock, as the game's menus pause its time
  isHeld?: true;
  // Whether the development tuning panel is shown, which the app decides
  isTuning: boolean;
  // What the character's body and the camera collide with, which the landmarks are given to as they arrive
  landmarkCollider: LandmarkCollider;
  // The world coordinate the scene's origin stands on, which the screen's free camera reads the ground through
  origin: Vector3;
  qualityTier: QualityTier;
  // The navigated quest's objective, by the target its condition names, which a beam rises over, "" with none
  questTargetId: string;
  // Where the app serves each region's data, fetched by id as the camera comes within reach
  regionDataBaseUrl: string;
}

const {
  characterBody,
  characterId,
  characterLocomotion,
  characterPackBaseUrl,
  createTerrainWorker,
  enemyMap,
  heldMinutes,
  interactables,
  isHeld,
  isTuning,
  landmarkCollider,
  origin,
  qualityTier,
  questTargetId,
  regionDataBaseUrl,
} = defineProps<Props>();
const emit = defineEmits<{ defeat: [enemy: Enemy, enemyDrops: EnemyDrops]; ready: []; strike: [enemy: Enemy] }>();
// The witness render's parts, drawn in place of ours of each family it names when the parity page provides them, beside
// Ours rather than in the floating origin's group, since the page's tools find the camera among their siblings and stay
// Within reach of the origin
// oxlint-disable-next-line no-restricted-globals -- the parity page reaches a published scene's own parts with no prop for a host to see
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
const worldOffset = useFloatingOrigin(origin);
const { isRegionDataSettled, regionDataMap } = useRegionData(origin, regionDataBaseUrl);
const questTargetPosition = computed(() =>
  questTargetId ? findQuestTargetPosition(regionDataMap, questTargetId) : undefined,
);
const fogUniforms = createFogUniforms();
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
// The clock only starts at its held minute, so a minute held anew is set on it
watch(
  () => heldMinutes,
  (minutes) => {
    if (minutes !== undefined) gameClock.minutes = minutes;
  },
);
// The character whose model failed to load, drawn as its body's capsule in its place
const failedCharacterId = ref<number>();
// The tiles the terrain draws, which it writes each frame and what reads the ground compares against what it last read
const terrainDraws = createTerrainSelection(TILE_SELECTION_CAPACITY);
// The ground under the camera from above, which the grass redraws as the camera moves and grows on, and the rain's
// Splashes stand on
const groundCapture = createGroundCapture(GRASS_CAPTURE_SIZE, GRASS_CAPTURE_RESOLUTION);
// The weather of the area the camera stands in, which Windrise's is clear in, as its reference screenshots are
const areaWeather = useAreaWeather(origin);
const gradeLutTexture = createGradeLutTexture(WINDRISE_GRADE_OPTIONS);
// No god rays and no bloom: neither is measured off a reference of Windrise, and drawn as they stand they veil the
// Whole frame, the god rays marching hundreds of metres of lit air to their most opacity and bloom lifting the whole
// Sky past its threshold, so the frame is drawn through the haze, the grade and the tone mapping alone. No occlusion
// Either, and the sky handed on with it as the login's is, which the parity page's tools read each pixel's ray under
const postPipeline = usePostPipeline(
  () => qualityTier,
  { fogUniforms, gradeLutTexture, isBloomed: false, postUniforms },
  0,
  skyUniforms,
);
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

// The regions' data, which the world screen reads the residents of the regions in reach from
defineExpose({ regionDataMap });
onUnmounted(() => {
  rampTexture.dispose();
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
    <!-- Hidden rather than unmounted where the witness draws the ground, since the world is ready once its ground is -->
    <TresGroup :visible="checkIsOwnFamilyDrawn(WindrisePartFamily.Ground)">
      <!-- Marked as the ground's family alone, so the grass, which a witness render never draws, is left out of ours -->
      <TresGroup :user-data="{ [SCENE_FAMILY_KEY]: WindrisePartFamily.Ground }">
        <WorldTerrain
          :create-terrain-worker
          :draws="terrainDraws"
          :light-uniforms
          :origin
          :ramp-texture
          :terrain-options="WINDRISE_TERRAIN_OPTIONS"
          :water-uniforms
          :wind-uniforms
          @ready="isTerrainSettled = true"
        />
      </TresGroup>
      <WorldGrass
        :blade-height="GRASS_BLADE_HEIGHT"
        :blade-width="GRASS_BLADE_WIDTH"
        :ground-capture
        :light-uniforms
        :origin
        :quality-tier
        :ramp-texture
        :rings="[NEAR_GRASS_RING, MIDDLE_GRASS_RING]"
        :terrain-draws
        :terrain-options="WINDRISE_TERRAIN_OPTIONS"
        :water-uniforms
        :wind-uniforms
      />
    </TresGroup>
    <!-- Ahead of the water, whose haze replaces the weather's under its surface -->
    <WorldWeather
      :base-cloud-coverage
      :base-fog-density
      :fog-uniforms
      :get-ground-height="getWorldHeight"
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
    <WorldLandmarks
      :hidden-kinds="hiddenLandmarkKinds"
      :kind-family-map="LandmarkKindWindrisePartFamilyMap"
      :landmark-collider
      :light-uniforms
      :ramp-texture
      :region-data-map
      :wind-uniforms
    />
    <!-- Enemies wander where the references show none, so a witness render, judged against them, draws none -->
    <WorldEnemies
      v-if="!witness"
      :enemy-map
      :is-held
      :light-uniforms
      :ramp-texture
      :region-data-map
      :target="characterBody?.position"
      @defeat="(enemy, enemyDrops) => emit('defeat', enemy, enemyDrops)"
      @strike="(enemy) => emit('strike', enemy)"
    />
    <!-- The drops and the residents in the world are stood in as well, which a witness render draws none of either -->
    <WorldInteractables v-if="!witness" :interactables :light-uniforms :ramp-texture />
    <QuestBeam v-if="questTargetPosition" :origin :position="questTargetPosition" />
    <!-- The character on the field, on the controller's body -->
    <primitive v-if="characterBody" :object="characterBody">
      <CharacterModel
        v-if="characterPackBaseUrl && failedCharacterId !== characterId"
        :key="characterId"
        :character-id
        :character-pack-base-url
        :light-uniforms
        :ramp-texture
        @error="failedCharacterId = characterId"
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
