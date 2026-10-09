<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Talk } from "#src/models/dialogue/Talk";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { InventoryDestruction } from "#src/models/inventory/InventoryDestruction";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { WorldScreenProps } from "#src/models/world/WorldScreenProps";
import type { TresCanvasInstance, TresContextWithClock, TresRendererSetupContext } from "@tresjs/core";

import AchievementScreen from "#src/components/Achievement/Screen/Index.vue";
import BookReaderScreen from "#src/components/Archive/BookReader/Index.vue";
import ArchiveScreen from "#src/components/Archive/Screen/Index.vue";
import CharacterScreen from "#src/components/Character/Screen/Index.vue";
import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
import GcgSession from "#src/components/Gcg/Session/Index.vue";
import HandbookScreen from "#src/components/Handbook/Screen/Index.vue";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import InteractionPromptList from "#src/components/Interaction/PromptList/Index.vue";
import InventoryScreen from "#src/components/Inventory/Screen/Index.vue";
import MapOverlay from "#src/components/Map/Overlay/Index.vue";
import MenuScreen from "#src/components/Menu/Screen/Index.vue";
import QuestScreen from "#src/components/Quest/Screen/Index.vue";
import WishScreen from "#src/components/Wish/Screen/Index.vue";
import WorldCharacter from "#src/components/World/Character/Index.vue";
import WorldEnemyNameTags from "#src/components/World/EnemyNameTags/Index.vue";
import WorldFreeCamera from "#src/components/World/FreeCamera/Index.vue";
import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { useInteraction } from "#src/composables/useInteraction";
import { useWorldAchievements } from "#src/composables/useWorldAchievements";
import { useWorldAdventureRank } from "#src/composables/useWorldAdventureRank";
import { useWorldArchive } from "#src/composables/useWorldArchive";
import { useWorldCombat } from "#src/composables/useWorldCombat";
import { useWorldMap } from "#src/composables/useWorldMap";
import { useWorldPickups } from "#src/composables/useWorldPickups";
import { useWorldQuests } from "#src/composables/useWorldQuests";
import { useWorldSave } from "#src/composables/useWorldSave";
import { useWorldSaveSync } from "#src/composables/useWorldSaveSync";
import { useWorldTalks } from "#src/composables/useWorldTalks";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { stepElementalSight } from "#src/services/elementalSight/stepElementalSight";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { TELEPORT_FADE_IN_MS, TELEPORT_FADE_OUT_MS } from "#src/services/map/constants";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";
import { PARTY_MEMBER_BURST_INPUT_ACTIONS, PARTY_MEMBER_INPUT_ACTIONS } from "#src/services/party/constants";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { getNextScreenKind } from "#src/services/screen/getNextScreenKind";
import { ScreenBehaviourMap } from "#src/services/screen/ScreenBehaviourMap";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { TresCanvas } from "@tresjs/core";
import { useEventListener, useRafFn } from "@vueuse/core";
import {
  createGenshinRenderer,
  createInput,
  createLandmarkCollider,
  FOLLOW_CAMERA_PIVOT_SHARE,
  GENSHIN_TONE_MAPPING,
  InputAction,
  QualityTierSettingsMap,
  STAMINA_MAX,
} from "genshin-engine";
import { CharacterMenuTab, InteractionKind, ItemCategory } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { Euler, Group, MathUtils, PCFShadowMap, Vector3 } from "three";
import { unref } from "vue";

interface Props extends WorldScreenProps {
  // The game's names in the reader's language, by their text ids, which the bag and the pick ups read their names from
  nameText: Readonly<Record<string, string>>;
  // The game's stat tables, read before the world opens
  statTables: StatTables;
}

const {
  cameraPose,
  characterPackBaseUrl,
  createTerrainWorker,
  gameDataBaseUrl,
  gameText,
  heldMinutes,
  isPaused,
  isTuning,
  language,
  nameText,
  qualityTier,
  regionDataBaseUrl,
  save,
  serverClockOffsetMs = 0,
  statTables,
} = defineProps<Props>();
// Quitting the game leaves the world, which its host does. A grant is a change to the bag, the wallet, the wish counters or
// The achievements' progress, which the host saves once per tick, and a save is every change to what the world holds,
// Which the host saves on its own cadence
const emit = defineEmits<{ grant: []; quit: []; ready: []; save: [save: GenshinSave] }>();
const { maxPixelRatio } = QualityTierSettingsMap[qualityTier];
const canvas = useTemplateRef<TresCanvasInstance>("canvas");
// A witness render's tools set the camera themselves, which the controls would move off the pose they set
// oxlint-disable-next-line no-restricted-globals -- the parity page reaches a published scene's own parts with no prop for a host to see
const witness = inject(SceneWitnessKey, null);
// The keys, pointer and gamepad, read once a frame ahead of everything the frame moves, which reads the same state
const input = createInput(window);
const inputState = input.readInput(0);
// What is open over the world, one screen at a time, and what it does to the world under it
const screenKind = ref(ScreenKind.World);
// The systems the save holds, read once as the world is made, so the world starts where the player left it. A bag's
// Names are the game's own in the reader's language, and its weapons are read from the stat tables, so both arrive first
const savedState = readGenshinSave(save ?? EMPTY_GENSHIN_SAVE, nameText, statTables.weaponDataMap);
// The cross-system reactions of this screen, one emitter the systems share
const events = createWorldEvents();
const {
  achievementProgressMap,
  craftedCountMap,
  craftingProgress,
  inventory,
  setInventory,
  setWallet,
  wallet,
  wishPityMap,
} = useWorldSave({ emitGrant: () => emit("grant"), events, savedState });
// A destroy's bag and wallet are applied together, since what it returns may be currency
const applyDestruction = ({ inventory: nextInventory, wallet: nextWallet }: InventoryDestruction) => {
  setInventory(nextInventory);
  setWallet(nextWallet);
};
// The player's characters' copies, which no save holds yet
const characterCopyCountMap = shallowRef<ReadonlyMap<number, number>>(new Map());
// The carried quests, read as the world starts with their words in the reader's language, and how far each has come
const {
  finishedMainQuestIds,
  questProgressMap,
  questsInProgress,
  questTargetId,
  questTextMap,
  trackedQuestId,
  trackerQuest,
} = useWorldQuests({ events, language, savedQuestProgressMap: savedState.quests });
// The Adventure EXP the session holds live, and the rank and the World Level the camps spawn at from it and the main quests
const {
  adventureExp,
  adventureExpProgress,
  gainWorldAdventureExp,
  isWorldLevelAdjustable,
  rank,
  toggleWorldLevel,
  worldLevel,
  worldLevelAdjustment,
} = useWorldAdventureRank({
  finishedMainQuestIds,
  savedAdventureExp: savedState.adventureExp,
  savedWorldLevelAdjustment: savedState.worldLevelAdjustment,
  setWallet,
  wallet,
});
// The Archive's entries, the volumes it reads and the defeats it counts, opened by the bag, the quests and the defeats
const { archiveData, archiveKillsMap, archiveProgressMap, bookReading, readBook } = useWorldArchive({
  events,
  finishedMainQuestIds,
  gameDataBaseUrl,
  language,
  screenKind,
});
const screenBehaviour = computed(() => ScreenBehaviourMap[screenKind.value]);
// A screen with a cursor of its own lets the pointer go, which a click on the world takes again once it closes
watch(
  () => screenBehaviour.value.isPointerReleased,
  (isPointerReleased) => {
    if (isPointerReleased) window.document.exitPointerLock();
  },
);
// The press that closes a screen is spent with it, so the F, Space or click that ended it never reaches the world as an
// Interact, a jump or an attack
watch(screenKind, (newScreenKind) => {
  if (newScreenKind === ScreenKind.World) input.readInput(0);
});
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
  input.dispose();
});
// The world's origin, owned here so the cameras read the ground through it before the floating origin shifts it
const origin = new Vector3();
// What the character's body and the camera collide with, given the landmarks as they arrive
const landmarkCollider = createLandmarkCollider();
// What the character on the field is drawn on, which the controller moves and the scene places among everything in the
// World
const characterBody = new Group();
// Elemental Sight, which its binding turns on and off where the world is open, spreading from the place it was turned on
const elementalSight: ElementalSight = { isOn: false, origin: { x: 0, z: 0 }, spreadSeconds: 0 };
// Every saved timer is read against the server's clock, which this machine's own runs behind or ahead of by the offset
const getWorldNow = () => Temporal.Now.instant().add({ milliseconds: serverClockOffsetMs });
// The achievements the finished steps and quests move, and their data, read as the Achievements screen opens
const { achievementData } = useWorldAchievements({
  achievementProgressMap,
  events,
  getWorldNow,
  language,
  screenKind,
  setWallet,
  wallet,
});
// The drops and the gathering points the character picks up, taken into the bag or the wallet
const {
  bagFullHint,
  pickUpGatheringPlace,
  pickUpInteractables,
  pickUpWorldDrop,
  placeWorldDrops,
  strikeGatheringOres,
  worldDrops,
} = useWorldPickups({
  archive: { archiveData, archiveProgressMap },
  events,
  gameText,
  getWorldNow,
  inventory,
  nameText,
  serverClockOffsetMs,
  setInventory,
  setWallet,
  wallet,
});
// The party, the characters, the enemies and the kit's effects, which a defeat places drops among and a team's fall revives
const {
  characterIdCombatantMap,
  characters,
  clearKitEffects,
  defeatEnemy,
  enemyMap,
  hudMember,
  kitEffectState,
  locomotion,
  party,
  respawnParty,
  strikeParty,
  worldRandom,
} = useWorldCombat({
  events,
  gameDataBaseUrl,
  onPartyRevived: () => {
    const nearestLandmark = findNearestLandmark(unlockedLandmarks.value, characterBody.position);
    if (nearestLandmark) jumpTo(computeJumpPose(nearestLandmark));
  },
  placeWorldDrops,
  statTables,
});
const windrise = useTemplateRef<InstanceType<typeof WorldWindrise>>("windrise");
// The talks a resident begins and the talk the world runs, held by id, with the duel a resident offers from each talk
const { gcgGameId, getTalkDuelGameId, residentInteractables, talk, talkDuelGameId, talkMap } = useWorldTalks({
  getResidents: () => [...(windrise.value?.regionDataMap.values() ?? [])].flatMap(({ residents }) => residents),
  getResidentSpot: (residentId) => windrise.value?.residentSpots.get(residentId),
  questsInProgress,
  questTextMap,
  // No resident holds a standing talk yet, so no standing talk is merged in
  standingTalkMap: new Map<string, Talk>(),
});
// The landmarks the world holds and the ones the player has unlocked, which a jump lands at and the first unlock pays
const { activateLandmark, explorationAreas, jumpLandmarks, jumpPose, jumpTo, unlockedLandmarkIds, unlockedLandmarks } =
  useWorldMap({
    events,
    gainWorldAdventureExp,
    regionDataBaseUrl,
    setWallet,
    unlockedLandmarkIds: savedState.unlockedLandmarkIds,
    wallet,
  });
// The Reputation and the Companionship EXP no source changes yet, so they are carried as they were saved
useWorldSaveSync({
  emitSave: (newSave) => emit("save", newSave),
  getSaveState: () => ({
    achievementProgressMap: achievementProgressMap.value,
    adventureExp: adventureExp.value,
    companionshipExpMap: savedState.companionshipExpMap,
    craftedCountMap: craftedCountMap.value,
    craftingProgress: craftingProgress.value,
    inventory: inventory.value,
    quests: questProgressMap.value,
    reputation: savedState.reputation,
    unlockedLandmarkIds: unlockedLandmarkIds.value,
    wallet: wallet.value,
    wishPityMap: wishPityMap.value,
    worldLevelAdjustment: worldLevelAdjustment.value,
  }),
});
// What the character can act on in the world: each drop, named by its item, each resident of the regions in reach
// Whose talk the world holds, named by its text, and each jump landmark still locked, which it resonates with. Each
// Stands on the ground beneath its point
const interactables = computed<Interactable[]>(() => {
  // A jump landmark is a Statue of The Seven until waypoints join the jumps, so each locked one is named by the statue
  const statues = jumpLandmarks.value
    .filter(({ id }) => !unlockedLandmarkIds.value.has(id))
    .map(({ id, position: { x, z } }) => ({
      id,
      kind: InteractionKind.Activate,
      name: gameText[GameTextKey.StatueOfTheSeven],
      position: { x, y: getWorldHeight(x, z), z },
    }));
  return [...pickUpInteractables.value, ...residentInteractables.value, ...statues];
});
const { interactionPrompts, readInteraction } = useInteraction(() => interactables.value, characterBody);
// A talk that ends is a talk-to for the quests in progress, and the world is back under the Traveler
const endTalk = () => {
  if (talk.value) events.emit("questEvent", { kind: QuestObjectiveKind.TalkTo, targetId: talk.value.id });
  screenKind.value = ScreenKind.World;
};
const character = useTemplateRef("character");
// Whether the backslash has hidden the HUD, as the game's Hide UI does, apart from the screens that hide it
const isHudHidden = ref(false);
// The character's ground point in world metres and the yaw the view faces, for the map and the minimap, read each frame
// And handed on only when it moved, so a still player re-renders nothing
const mapCamera = shallowRef<MapCamera>({ x: 0, yaw: 0, z: 0 });
const cameraEuler = new Euler();
// What the HUD's pieces read each frame. The stamina meter's pivot is projected only while the pool is spent or
// Refilling, and once it is full the meter fades out where it stood
const hudFrame = reactive<HudFrame>({ pivotX: 0, pivotY: 0, seconds: 0, stamina: STAMINA_MAX });
const pivot = new Vector3();
useRafFn(() => {
  const activeCamera = canvas.value?.context?.camera.activeCamera.value;
  if (!activeCamera) return;
  const { x, y, z } = characterBody.position;
  const { y: yaw } = cameraEuler.setFromQuaternion(activeCamera.quaternion, "YXZ");
  if (x !== mapCamera.value.x || yaw !== mapCamera.value.yaw || z !== mapCamera.value.z)
    mapCamera.value = { x, yaw, z };
  const stamina = character.value?.stamina.value ?? STAMINA_MAX;
  if (stamina >= STAMINA_MAX && hudFrame.stamina >= STAMINA_MAX) return;
  hudFrame.stamina = stamina;
  pivot
    .set(x - origin.x, y + locomotion.value.capsuleHeight * FOLLOW_CAMERA_PIVOT_SHARE, z - origin.z)
    .project(activeCamera);
  hudFrame.pivotX = (pivot.x + 1) / 2;
  hudFrame.pivotY = (1 - pivot.y) / 2;
});
// Where the camera stands in world metres, which its host reads to know where a player is
const readCameraPosition = (): Vector3 => {
  const activeCamera = canvas.value?.context?.camera.activeCamera.value;
  return activeCamera ? activeCamera.position.clone().add(origin) : origin.clone();
};
// The camera the world is drawn through, which the enemies' name tags project their enemies through
const getCamera = () => canvas.value?.context?.camera.activeCamera.value;
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
          hudFrame.seconds = context.elapsed;
          if (!isPaused) screenKind = getNextScreenKind(screenKind, inputState.pressedActions);
          if (!isPaused && screenKind === ScreenKind.World && inputState.pressedActions.has(InputAction.HideInterface))
            isHudHidden = !isHudHidden;
          if (!isPaused && screenKind === ScreenKind.World)
            stepElementalSight(
              elementalSight,
              characterBody.position,
              context.delta,
              inputState.pressedActions.has(InputAction.ElementalSight),
            );
          else elementalSight.isOn = false;
          if (inputState.pressedActions.has(InputAction.ShowCursor)) showCursor();
          // A switch with a burst switches as a plain one does, so its member is on the field when the kit reads the burst
          const partyMemberIndex = PARTY_MEMBER_INPUT_ACTIONS.findIndex(
            (action, index) =>
              inputState.pressedActions.has(action) ||
              inputState.pressedActions.has(PARTY_MEMBER_BURST_INPUT_ACTIONS[index] ?? action),
          );
          if (!isPaused && screenKind === ScreenKind.World && partyMemberIndex !== -1)
            switchPartyMember(party, partyMemberIndex, context.elapsed);
          if (
            !isPaused &&
            screenKind === ScreenKind.World &&
            trackerQuest &&
            inputState.pressedActions.has(InputAction.QuestNavigation)
          )
            trackedQuestId = trackerQuest.id;
          if (!isPaused && screenKind === ScreenKind.World) {
            const interactable = readInteraction(inputState, context.delta);
            const worldDrop = worldDrops.find(({ id }) => id === interactable?.id);
            if (interactable?.kind === InteractionKind.PickUp && worldDrop) pickUpWorldDrop(worldDrop);
            else if (interactable?.kind === InteractionKind.PickUp) pickUpGatheringPlace(interactable.id);
            else if (interactable?.kind === InteractionKind.Activate) {
              activateLandmark(interactable.id);
            } else if (interactable?.kind === InteractionKind.Talk) {
              talk = talkMap.get(interactable.id);
              talkDuelGameId = getTalkDuelGameId(interactable.id);
              screenKind = ScreenKind.Dialogue;
            }
          }
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
        <!-- The character walks the world with the camera behind it, held under any screen but the world, as a menu,
        photo mode or a talk holds it. Photo mode's camera orbits the held character, and under the tuning panel it flies
        free from where the orbit left it -->
        <WorldCharacter
          v-if="!witness && locomotion"
          ref="character"
          :body="characterBody"
          :character-id-combatant-map
          :kit-effect-state
          :enemy-map
          :input-state
          :is-held="screenKind !== ScreenKind.World || undefined"
          :is-orbiting="(screenKind === ScreenKind.PhotoMode && !isTuning) || undefined"
          :landmark-collider
          :locomotion
          :origin
          :party
          :random="worldRandom"
          @clear-kit-effects="clearKitEffects()"
          @drown="respawnParty()"
          @strike-ore="(body, hit) => strikeGatheringOres(body, hit, worldRandom)"
        />
        <WorldFreeCamera
          v-if="!witness && screenKind === ScreenKind.PhotoMode && isTuning"
          :input-state
          :is-held="screenBehaviour.isHeld || undefined"
          :origin
        />
      </template>
      <WorldWindrise
        ref="windrise"
        :character-body="cameraPose || witness || !locomotion ? undefined : characterBody"
        :character-id="getActiveCharacterId(party)"
        :character-locomotion="locomotion"
        :character-pack-base-url
        :create-terrain-worker
        :kit-effect-state
        :elemental-sight
        :enemy-map
        :held-minutes
        :is-held="screenBehaviour.isHeld || undefined"
        :interactables
        :is-tuning="Boolean(isTuning)"
        :landmark-collider
        :origin
        :quality-tier
        :quest-target-id
        :region-data-base-url
        :world-level
        @defeat="(enemy, enemyDrops) => defeatEnemy(enemy, enemyDrops)"
        @ready="emit('ready')"
        @strike="(enemy, taunt) => strikeParty(enemy, taunt)"
      />
    </TresCanvas>
    <WorldEnemyNameTags :elemental-sight :enemy-map :get-camera :name-text :origin />
    <!-- No HUD over a reference's held camera or a witness render, which the game's recordings show bare -->
    <HudScreen
      v-if="!cameraPose && !witness && !isPaused && !isHudHidden && !screenBehaviour.isHudHidden"
      :camera="mapCamera"
      :character-data-map="statTables.characterDataMap"
      :frame="hudFrame"
      :game-text
      :input
      :landmarks="unlockedLandmarks"
      :member="hudMember"
      :name-text-map="nameText"
      :party
      :quest-progress="trackerQuest && questProgressMap.get(trackerQuest.id)"
      :quest-text-map
      :tracked-quest="trackerQuest"
      @map="screenKind = ScreenKind.Map"
      @menu="screenKind = ScreenKind.PaimonMenu"
    >
      <template #prompts>
        <InteractionPromptList :interaction-prompts />
        <p v-if="bagFullHint" class="bag-full-hint">{{ bagFullHint }}</p>
      </template>
    </HudScreen>
    <MenuScreen
      v-model:screen-kind="screenKind"
      :adventure-exp-progress
      :adventure-rank="rank"
      :game-text
      :is-world-level-adjustable
      :is-world-level-lowered="worldLevelAdjustment.isLowered"
      :world-level
      @quit="emit('quit')"
      @toggle-world-level="toggleWorldLevel()"
    >
      <template #[ScreenKind.Map]>
        <MapOverlay
          :camera="mapCamera"
          :exploration-areas
          :game-text
          :landmarks="unlockedLandmarks"
          :server-clock-offset-ms
          :wallet
          @close="screenKind = ScreenKind.World"
          @jump="
            (pose) => {
              screenKind = ScreenKind.World;
              jumpTo(pose);
            }
          "
        />
      </template>
      <template v-if="achievementData" #[ScreenKind.Achievements]>
        <AchievementScreen
          :achievements="achievementData.achievements"
          :categories="achievementData.categories"
          :game-text
          :progress-map="achievementProgressMap"
          :text-map="achievementData.textMap"
          @close="screenKind = ScreenKind.World"
        />
      </template>
      <template v-if="archiveData" #[ScreenKind.Archive]>
        <BookReaderScreen
          v-if="bookReading"
          :body="bookReading.body"
          :game-text
          :title="bookReading.title"
          @close="bookReading = undefined"
        />
        <ArchiveScreen
          v-else
          :game-text
          :kills-map="archiveKillsMap"
          :progress-map="archiveProgressMap"
          :section-entries-map="archiveData.sectionEntriesMap"
          :text-map="archiveData.textMap"
          @close="screenKind = ScreenKind.World"
          @read-book="(entryId) => readBook(entryId)"
        />
      </template>
      <template #[ScreenKind.Quests]>
        <QuestScreen
          :game-text
          :quest-progress-map
          :quests="questsInProgress"
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
          :companionship-exp-map="savedState.companionshipExpMap"
          :game-data-base-url
          :game-text
          :initial-tab="CharacterMenuTab.Attributes"
          :language
          :max-stamina="STAMINA_MAX"
          :name-text
          :stat-tables
          @close="screenKind = ScreenKind.World"
        />
      </template>
      <template #[ScreenKind.Inventory]>
        <InventoryScreen
          :game-text
          :initial-category="ItemCategory.Weapon"
          :inventory
          :names="nameText"
          :wallet
          @close="screenKind = ScreenKind.World"
          @destroy="(destruction) => applyDestruction(destruction)"
        />
      </template>
      <template #[ScreenKind.Wish]>
        <WishScreen
          v-model:character-copy-count-map="characterCopyCountMap"
          v-model:characters="characters"
          v-model:pity-map="wishPityMap"
          v-model:wallet="wallet"
          :game-text
          :inventory
          :name-text
          :stat-tables
          @close="screenKind = ScreenKind.World"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
        />
      </template>
    </MenuScreen>
    <DialogueTalk
      v-if="screenKind === ScreenKind.Dialogue && talk"
      :game-text
      :is-duel-offered="talkDuelGameId !== undefined"
      :talk
      :text-map="questTextMap"
      @duel="
        gcgGameId = talkDuelGameId;
        screenKind = ScreenKind.GcgDuel;
      "
      @end="endTalk()"
    />
    <GcgSession
      v-if="screenKind === ScreenKind.GcgDuel && gcgGameId !== undefined"
      :game-id="gcgGameId"
      :game-text
      :language
      @leave="
        gcgGameId = undefined;
        screenKind = ScreenKind.World;
      "
    />
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
/* Provisional: where the game's hint sits and how long it stays wait on a recording of the English client at 1080 high */
.bag-full-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  color: #ece5d8;
  text-shadow: 0 0 4px rgb(0 0 0 / 0.8);
}

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
