<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { WorldCameraPose } from "#src/models/world/WorldCameraPose";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { TresCanvasInstance, TresContextWithClock, TresRendererSetupContext } from "@tresjs/core";
import type { QualityTier } from "genshin-engine";
import type { GameText } from "genshin-text";

import CharacterScreen from "#src/components/Character/Screen/Index.vue";
import HandbookScreen from "#src/components/Handbook/Screen/Index.vue";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import MapOverlay from "#src/components/Map/Overlay/Index.vue";
import MenuScreen from "#src/components/Menu/Screen/Index.vue";
import QuestScreen from "#src/components/Quest/Screen/Index.vue";
import WorldCharacter from "#src/components/World/Character/Index.vue";
import WorldFreeCamera from "#src/components/World/FreeCamera/Index.vue";
import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { useJumpLandmarks } from "#src/composables/useJumpLandmarks";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { TELEPORT_FADE_IN_MS, TELEPORT_FADE_OUT_MS } from "#src/services/map/constants";
import { PARTY_MEMBER_INPUT_ACTIONS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { getNextScreenKind } from "#src/services/screen/getNextScreenKind";
import { ScreenBehaviourMap } from "#src/services/screen/ScreenBehaviourMap";
import { TresCanvas } from "@tresjs/core";
import { useEventListener, useRafFn } from "@vueuse/core";
import {
  createGenshinRenderer,
  createInput,
  createLandmarkCollider,
  GENSHIN_TONE_MAPPING,
  InputAction,
  QualityTierSettingsMap,
  STAMINA_MAX,
} from "genshin-engine";
import { Euler, Group, MathUtils, PCFShadowMap, Vector3 } from "three";
import { unref } from "vue";

interface Props {
  // A camera held still, as a reference of the game's sees the world, in place of the one circling the oak
  cameraPose?: WorldCameraPose;
  // Where the host serves the characters' model packs, without which no character is drawn
  characterPackBaseUrl?: string;
  createTerrainWorker: () => Worker;
  // The game's words in the reader's language
  gameText: GameText;
  // The game's minute of the day the clock is held at, as a reference of the game's shows it
  heldMinutes?: number;
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused?: true;
  // Whether the development tuning panel is shown, which the host decides
  isTuning?: true;
  qualityTier: QualityTier;
  // Where the host serves each region's data, fetched by id as the camera comes within reach
  regionDataBaseUrl: string;
}

const {
  cameraPose,
  characterPackBaseUrl,
  createTerrainWorker,
  gameText,
  heldMinutes,
  isPaused,
  isTuning,
  qualityTier,
  regionDataBaseUrl,
} = defineProps<Props>();
// Quitting the game leaves the world, which its host does
const emit = defineEmits<{ quit: []; ready: [] }>();
const { maxPixelRatio } = QualityTierSettingsMap[qualityTier];
const canvas = useTemplateRef<TresCanvasInstance>("canvas");
// A witness render's tools set the camera themselves, which the controls would move off the pose they set
// oxlint-disable-next-line no-restricted-globals -- the parity page reaches a published scene's own parts with no prop for a host to see
const witness = inject(SceneWitnessKey, null);
// The keys, pointer and gamepad, read once a frame ahead of everything the frame moves, which reads the same state
const controller = new AbortController();
const input = createInput(window, controller.signal);
const inputState = input.readInput(0);
// What is open over the world, one screen at a time, and what it does to the world under it
const screenKind = ref(ScreenKind.World);
// The player's characters and their party: the Traveler alone, as a new player's, on the field
const characters: Character[] = [createCharacter(TRAVELER_CHARACTER_ID)];
const party = reactive(createParty([TRAVELER_CHARACTER_ID]));
// The quests in progress, how far each has come, their words and the one navigated to. Nothing starts a quest yet, so
// The quest screen opens empty
const quests: Quest[] = [];
const questProgressMap = new Map<string, QuestProgress>();
const questTextMap: Record<string, string> = {};
const trackedQuestId = ref("");
const screenBehaviour = computed(() => ScreenBehaviourMap[screenKind.value]);
// A screen with a cursor of its own lets the pointer go, which a click on the world takes again once it closes
watch(
  () => screenBehaviour.value.isPointerReleased,
  (isPointerReleased) => {
    if (isPointerReleased) window.document.exitPointerLock();
  },
);
// Left Alt shows the cursor, as the game's Show Cursor does, letting the lock go without opening the Paimon menu
let isCursorShown = false;
const showCursor = () => {
  isCursorShown = true;
  window.document.exitPointerLock();
};
// The browser keeps Escape for itself while the pointer is locked, letting the lock go in place of passing the key on,
// So a lock lost with the world in play opens the Paimon menu as Escape does, unless it was let go to show the cursor
useEventListener(
  () => window.document,
  "pointerlockchange",
  () => {
    if (window.document.pointerLockElement !== null) isCursorShown = false;
    else if (screenKind.value === ScreenKind.World && !isCursorShown) screenKind.value = ScreenKind.PaimonMenu;
  },
);
onUnmounted(() => {
  controller.abort();
});
// The world's origin, owned here so the cameras read the ground through it before the floating origin shifts it
const origin = new Vector3();
// What the character's body and the camera collide with, given the landmarks as they arrive
const landmarkCollider = createLandmarkCollider();
// What the character on the field is drawn on, which the controller moves and the scene places among everything in the
// World
const characterBody = new Group();
// Every landmark a jump lands at, which the map and the minimap draw
const jumpLandmarks = useJumpLandmarks(regionDataBaseUrl);
const character = useTemplateRef("character");
// Whether the backslash has hidden the HUD, as the game's Hide UI does, apart from the screens that hide it
const isHudHidden = ref(false);
// The camera's ground point and yaw in world metres for the map and the minimap, read each frame and handed on only
// When it moved, so a still camera re-renders nothing
const mapCamera = shallowRef<MapCamera>({ x: 0, yaw: 0, z: 0 });
const cameraEuler = new Euler();
useRafFn(() => {
  const activeCamera = canvas.value?.context?.camera.activeCamera.value;
  if (!activeCamera) return;
  const x = activeCamera.position.x + origin.x;
  const z = activeCamera.position.z + origin.z;
  const { y: yaw } = cameraEuler.setFromQuaternion(activeCamera.quaternion, "YXZ");
  if (x !== mapCamera.value.x || yaw !== mapCamera.value.yaw || z !== mapCamera.value.z)
    mapCamera.value = { x, yaw, z };
});
// A jump's pose while the screen is faded for it: set, the screen fades to black, and once that fade ends the character
// Is placed and the pose let go, so the screen fades back in
const jumpPose = shallowRef<WorldJumpPose>();
const jumpTo = (pose: WorldJumpPose) => {
  jumpPose.value = pose;
};
// Where the camera stands in world metres, which its host reads to know where a player is
const readCameraPosition = (): Vector3 => {
  const activeCamera = canvas.value?.context?.camera.activeCamera.value;
  return activeCamera ? activeCamera.position.clone().add(origin) : origin.clone();
};
const cameraRotation = computed(() =>
  cameraPose
    ? new Euler(MathUtils.degToRad(cameraPose.pitch), MathUtils.degToRad(cameraPose.heading), 0, "YXZ")
    : undefined,
);
// The world on its own canvas: the camera circling Windrise's oak, and the scene it looks at. It is ready once the
// Scene has the ground and the landmarks of its first view, which keep loading while the world is paused. A world that
// Cannot start, where neither WebGPU nor WebGL 2 is available, is ready all the same, so a host waiting on it moves on
// @TODO: no upstream issue — TresJS draws only while it owes a frame, and always mode owes one only once it has drawn,
// So a canvas switched from manual, having drawn the frame it was owed, never draws again. The uncovered world is owed
// One while the canvas is still manual, before its props change
watch(
  () => isPaused,
  (newIsPaused) => {
    if (!newIsPaused) canvas.value?.context?.renderer.advance();
  },
  { flush: "sync" },
);
defineExpose({ jumpTo, readCameraPosition });
</script>

<template>
  <div class="world-screen">
    <TresCanvas
      ref="canvas"
      :dpr="[1, maxPixelRatio]"
      :renderer="({ canvas }: TresRendererSetupContext) => createGenshinRenderer(unref(canvas))"
      :render-mode="isPaused ? 'manual' : 'always'"
      :tone-mapping="GENSHIN_TONE_MAPPING"
      shadows
      :shadow-map-type="PCFShadowMap"
      @before-loop="
        (context: TresContextWithClock) => {
          input.readInput(context.delta);
          if (!isPaused) screenKind = getNextScreenKind(screenKind, inputState.pressedActions);
          if (!isPaused && screenKind === ScreenKind.World && inputState.pressedActions.has(InputAction.HideInterface))
            isHudHidden = !isHudHidden;
          if (inputState.pressedActions.has(InputAction.ShowCursor)) showCursor();
          const partyMemberIndex = PARTY_MEMBER_INPUT_ACTIONS.findIndex((action) =>
            inputState.pressedActions.has(action),
          );
          if (!isPaused && screenKind === ScreenKind.World && partyMemberIndex !== -1)
            switchPartyMember(party, partyMemberIndex, context.elapsed);
        }
      "
      @error="emit('ready')"
    >
      <TresPerspectiveCamera
        v-if="cameraPose"
        :far="2000"
        :fov="cameraPose.fov"
        :position="cameraPose.position"
        :rotation="cameraRotation"
      />
      <template v-else>
        <TresPerspectiveCamera :far="2000" :fov="45" :look-at="[0, 14, 0]" :position="[62, 26, 58]" />
        <!-- The character walks the world with the camera behind it, held where it stands under a menu and in photo
        mode, whose camera flies free from where the follow camera left it -->
        <WorldCharacter
          v-if="!witness"
          ref="character"
          :body="characterBody"
          :character-id="getActiveCharacterId(party)"
          :input-state
          :is-held="screenBehaviour.isHeld || screenKind === ScreenKind.PhotoMode || undefined"
          :landmark-collider
          :origin
        />
        <WorldFreeCamera
          v-if="!witness && screenKind === ScreenKind.PhotoMode"
          :input-state
          :is-held="screenBehaviour.isHeld || undefined"
          :origin
        />
      </template>
      <WorldWindrise
        :character-body="cameraPose || witness ? undefined : characterBody"
        :character-id="getActiveCharacterId(party)"
        :character-pack-base-url
        :create-terrain-worker
        :held-minutes
        :is-held="screenBehaviour.isHeld || undefined"
        :is-tuning="Boolean(isTuning)"
        :landmark-collider
        :origin
        :quality-tier
        :region-data-base-url
        @ready="emit('ready')"
      />
    </TresCanvas>
    <!-- No HUD over a reference's held camera or a witness render, which the game's recordings show bare -->
    <HudScreen
      v-if="!cameraPose && !witness && !isPaused && !isHudHidden && !screenBehaviour.isHudHidden"
      :camera="mapCamera"
      :game-text
      :input
      :landmarks="jumpLandmarks"
      @map="screenKind = ScreenKind.Map"
      @menu="screenKind = ScreenKind.PaimonMenu"
    />
    <MenuScreen v-model:screen-kind="screenKind" :game-text @quit="emit('quit')">
      <template #[ScreenKind.Map]>
        <MapOverlay
          :camera="mapCamera"
          :game-text
          :landmarks="jumpLandmarks"
          @close="screenKind = ScreenKind.World"
          @jump="
            (pose) => {
              screenKind = ScreenKind.World;
              jumpTo(pose);
            }
          "
        />
      </template>
      <template #[ScreenKind.Quests]>
        <QuestScreen
          :game-text
          :quest-progress-map
          :quests
          :text-map="questTextMap"
          :tracked-quest-id
          @close="screenKind = ScreenKind.World"
          @navigate="(questId) => (trackedQuestId = questId)"
        />
      </template>
      <template #[ScreenKind.AdventurerHandbook]>
        <HandbookScreen :game-text @close="screenKind = ScreenKind.World" />
      </template>
      <template #[ScreenKind.Character]>
        <CharacterScreen
          :active-character-id="getActiveCharacterId(party)"
          :characters
          :game-text
          :max-stamina="STAMINA_MAX"
          @close="screenKind = ScreenKind.World"
        />
      </template>
    </MenuScreen>
    <div
      class="teleport-fade"
      :class="{ faded: jumpPose }"
      @transitionend="
        () => {
          if (!jumpPose) return;
          character?.place(jumpPose);
          jumpPose = undefined;
        }
      "
    />
  </div>
</template>

<style scoped>
/* The package carries no utility classes, so the screen fills its host with a style of its own */
.world-screen {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Provisional: the teleport's fade to black and back, measured off a recording of a teleport */
.teleport-fade {
  position: absolute;
  background: #000;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity calc(v-bind(TELEPORT_FADE_IN_MS) * 1ms) linear;
}

.teleport-fade.faded {
  opacity: 1;
  transition-duration: calc(v-bind(TELEPORT_FADE_OUT_MS) * 1ms);
}

.world-screen :deep(canvas) {
  /* A drag on the world turns the camera, so a touch is never taken for scrolling or zooming the page */
  touch-action: none;
}
</style>
