<script setup lang="ts">
import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { MapSubareaLabel } from "#src/models/map/MapSubareaLabel";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { GameText } from "genshin-text";

import { useMapPan } from "#src/composables/useMapPan";
import MapDrawing from "#src/components/Map/Drawing/Index.vue";
import MapJumpList from "#src/components/Map/JumpList/Index.vue";
import MapOverlayClose from "#src/components/Map/Overlay/Close/Index.vue";
import MapOverlayDomainsOnly from "#src/components/Map/Overlay/DomainsOnly/Index.vue";
import MapOverlayLabels from "#src/components/Map/Overlay/Labels/Index.vue";
import MapOverlayRegionTag from "#src/components/Map/Overlay/RegionTag/Index.vue";
import MapOverlayResin from "#src/components/Map/Overlay/Resin/Index.vue";
import MapOverlayTeleport from "#src/components/Map/Overlay/Teleport/Index.vue";
import MapOverlayZoom from "#src/components/Map/Overlay/Zoom/Index.vue";
import MapPointer from "#src/components/Map/Pointer/Index.vue";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
import { computeExploredDoingIds } from "#src/services/exploration/computeExploredDoingIds";
import { computeAreaLabels } from "#src/services/map/computeAreaLabels";
import { computeMapFrameTransform } from "#src/services/map/computeMapFrameTransform";
import { MAP_GROUND, MAP_OVERLAY_MARK_SHARE, MAP_SUBAREA_LABEL_OFFSETS } from "#src/services/map/constants";
import { findAreaAt } from "#src/services/map/findAreaAt";
import { findAreaNameAt } from "#src/services/map/findAreaNameAt";
import { projectMapPoint } from "#src/services/map/projectMapPoint";
import { GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  camera: MapCamera;
  // The regions and their areas, which the map draws and names
  catalogue: Catalogue;
  // The areas whose exploration the map counts, each area's progress shown on its name once the area is filled in
  explorationAreas: ExplorationArea[];
  // The game's words in the reader's language
  gameText: GameText;
  landmarks: Landmark[];
  // The game's names by text id in the reader's language, which the subarea labels are named from
  nameText: Readonly<Record<string, string>>;
  // The world's clock as the map shows it, which the Original Resin the top bar counts is read at
  now: Temporal.Instant;
  // The doings the save records as done, which an area counts alongside the statues its unlocked landmarks light
  recordedDoingIds: ReadonlySet<string>;
  // Each subarea's label as the open world publishes it, named by its text id.
  // It is drawn while the view is no further out than MAP_REFERENCE_ZOOM_METRES
  subareaLabels: MapSubareaLabel[];
  // The wallet, whose Original Resin the top bar counts as it regenerates to the moment the map opens
  wallet: Wallet;
}

const {
  camera,
  catalogue,
  explorationAreas,
  gameText,
  landmarks,
  nameText,
  now,
  recordedDoingIds,
  subareaLabels,
  wallet,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; jump: [pose: WorldJumpPose] }>();

// The landmark chosen on the map or in the list, whose teleport panel names its area and jumps there on its Teleport
// Button alone, so a stray click on the map never teleports
const chosenLandmark = shallowRef<Landmark>();
const chooseLandmark = (landmark: Landmark) => {
  chosenLandmark.value = landmark;
};
const map = useTemplateRef("map");
// The drawn metres across the map's width, which the wheel and the slider change from the page's zoom, and the offset the
// Map is dragged to from the player
const metres = defineModel<number>("metres", { required: true });
const { pan, onMapClickCapture, onMapPointerDown, onMapPointerMove, onMapPointerUp, onMapWheel } = useMapPan(
  map,
  metres,
);
// The catalogue point the view is centred on, the player's own point until the map is dragged off it
const centre = computed(() => ({ x: camera.x + pan.value.x, z: camera.z + pan.value.z }));
const frameTransform = computed(() => computeMapFrameTransform(centre.value));
const playerPlace = computed(() => projectMapPoint(camera, centre.value));
const markRadius = computed(() => metres.value * MAP_OVERLAY_MARK_SHARE);
// Each counted area's progress line as the unlocked landmarks and the recorded doings leave it, in the game's words and
// Their colours, keyed by
// Its catalogue area: a fully explored area's percentage turns gold
const progressSegmentsMap = computed(
  () =>
    new Map(
      explorationAreas.map((area) => {
        const percentage = computeExplorationProgress(area, computeExploredDoingIds(area, landmarks, recordedDoingIds));
        const text =
          gameText[percentage === 100 ? GameTextKey.ExplorationProgressComplete : GameTextKey.ExplorationProgress];
        return [area.areaId, splitGameTextColors(fillGameTextValues(text, percentage))];
      }),
    ),
);
const areaLabels = computed(() =>
  computeAreaLabels(catalogue, landmarks).map(({ id, name, x, z }) => {
    const projectedPoint = projectMapPoint({ x, z }, centre.value);
    return {
      id,
      name,
      progressSegments: progressSegmentsMap.value.get(id) ?? [],
      x: projectedPoint.x,
      y: projectedPoint.y,
    };
  }),
);
// Each subarea's name at its place, named in the reader's language; a subarea whose text the language lacks is left out
const subareaNames = computed(() =>
  subareaLabels.flatMap(({ nameTextId, x, z }) => {
    const name = nameText[nameTextId];
    const offset = MAP_SUBAREA_LABEL_OFFSETS[nameTextId] ?? { x: 0, z: 0 };
    return name ? [{ name, ...projectMapPoint({ x: x + offset.x, z: z + offset.z }, centre.value) }] : [];
  }),
);
// The place the character stands in, named at the bottom right with its progress line as the map names it: its city
// Where it stands in one, else its area, whose progress line it carries
const regionTag = computed(() => {
  const area = findAreaAt(catalogue, camera.x, camera.z);
  return (
    area && {
      name: findAreaNameAt(area, camera.x, camera.z),
      progressSegments: progressSegmentsMap.value.get(area.id) ?? [],
    }
  );
});
// The filled areas' progress, read out of the hidden drawing by a screen reader as a list of its own
const areaProgresses = computed(() => areaLabels.value.filter(({ progressSegments }) => progressSegments.length > 0));
</script>

<template>
  <!-- The map on M, full screen as the game shows it: the one drawing of the catalogue placed on the player, north
       Up, each area's name and the player's pointer, the close button and the zoom slider. The jump list is kept for the
       Keyboard and a screen reader, since the game shows no list, and each filled area's progress is listed for a screen
       Reader beside the hidden drawing. A landmark chosen on the map or in the list jumps there -->
  <GameScreen class="map-overlay" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Map]">
    <svg
      ref="map"
      class="map"
      :viewBox="`${-metres / 2} ${-metres / 2} ${metres} ${metres}`"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      @click.capture="(event) => onMapClickCapture(event)"
      @pointercancel="onMapPointerUp()"
      @pointerdown="(event) => onMapPointerDown(event)"
      @pointermove="(event) => onMapPointerMove(event)"
      @pointerup="onMapPointerUp()"
      @wheel="(event) => onMapWheel(event)"
    >
      <MapDrawing
        :catalogue
        :landmarks
        :mark-radius
        :transform="frameTransform"
        @select="(landmark) => chooseLandmark(landmark)"
      />
      <MapOverlayLabels :area-labels="areaLabels" :metres :subarea-names="subareaNames" />
      <MapPointer :size="markRadius" :x="playerPlace.x" :y="playerPlace.y" :yaw="camera.yaw" />
    </svg>
    <MapOverlayZoom v-model:metres="metres" :game-text />
    <ul class="progress-list">
      <li v-for="{ id, name, progressSegments } of areaProgresses" :key="id">
        {{ name }} <span v-for="({ text }, index) of progressSegments" :key="index">{{ text }}</span>
      </li>
    </ul>
    <MapJumpList class="jumps" :catalogue :game-text :landmarks @jump="(landmark) => chooseLandmark(landmark)" />
    <MapOverlayRegionTag v-if="regionTag" :name="regionTag.name" :progress-segments="regionTag.progressSegments" />
    <MapOverlayResin :game-text :now :wallet />
    <MapOverlayDomainsOnly :game-text />
    <MapOverlayTeleport v-model:landmark="chosenLandmark" :catalogue :game-text @jump="(pose) => emit('jump', pose)" />
    <MapOverlayClose :game-text @close="emit('close')" />
  </GameScreen>
</template>

<style scoped>
/* Provisional: the colours and the zoom slider's place measured off the English PC client's map over Jueyun Karst at
   1080 high; the map's terrain is the game's painted art, which is not drawn here */
.map-overlay {
  background: v-bind(MAP_GROUND);
}

/* Provisional: the player's pointer sits 45 units right of and 50 units under the screen's centre in the reference, so
   the drawing is centred on that place, the screen's own centre offset to it */
.map {
  position: absolute;
  top: calc(var(--unit) * 50);
  left: calc(var(--unit) * 45);
  width: 100%;
  height: 100%;
  touch-action: none;
}

.jumps,
.progress-list {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
