<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Talk } from "#src/models/dialogue/Talk";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { HudMember } from "#src/models/hud/HudMember";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Combatant } from "#src/models/kit/Combatant";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { WorldCameraPose } from "#src/models/world/WorldCameraPose";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { TresCanvasInstance, TresContextWithClock, TresRendererSetupContext } from "@tresjs/core";
import type { QualityTier } from "genshin-engine";
import type { GameLanguage, GameText } from "genshin-text";

import CharacterScreen from "#src/components/Character/Screen/Index.vue";
import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
import HandbookScreen from "#src/components/Handbook/Screen/Index.vue";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import InteractionPromptList from "#src/components/Interaction/PromptList/Index.vue";
import InventoryScreen from "#src/components/Inventory/Screen/Index.vue";
import MapOverlay from "#src/components/Map/Overlay/Index.vue";
import MenuScreen from "#src/components/Menu/Screen/Index.vue";
import QuestScreen from "#src/components/Quest/Screen/Index.vue";
import WishScreen from "#src/components/Wish/Screen/Index.vue";
import WorldCharacter from "#src/components/World/Character/Index.vue";
import WorldFreeCamera from "#src/components/World/FreeCamera/Index.vue";
import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { useInteraction } from "#src/composables/useInteraction";
import { useJumpLandmarks } from "#src/composables/useJumpLandmarks";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { computeAdventureRankStanding } from "#src/services/adventureRank/computeAdventureRankStanding";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readStatTables } from "#src/services/character/readStatTables";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";
import { placeEnemyDrops } from "#src/services/interaction/placeEnemyDrops";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { TRAVELER_KIT } from "#src/services/kit/constants";
import { strikePartyMember } from "#src/services/kit/strikePartyMember";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { TELEPORT_FADE_IN_MS, TELEPORT_FADE_OUT_MS } from "#src/services/map/constants";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";
import { checkIsPartyDown } from "#src/services/party/checkIsPartyDown";
import { PARTY_MEMBER_INPUT_ACTIONS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { reviveParty } from "#src/services/party/reviveParty";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { getNextScreenKind } from "#src/services/screen/getNextScreenKind";
import { ScreenBehaviourMap } from "#src/services/screen/ScreenBehaviourMap";
import { InitialBannerKindWishPityMap } from "#src/services/wish/InitialBannerKindWishPityMap";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { getCharacterLocomotion } from "#src/services/world/locomotion/getCharacterLocomotion";
import { getResultAsync } from "@esposter/shared";
import { TresCanvas } from "@tresjs/core";
import { useEventListener, useRafFn } from "@vueuse/core";
import {
  createGenshinRenderer,
  createInput,
  createLandmarkCollider,
  FOLLOW_CAMERA_PIVOT_HEIGHT,
  GENSHIN_TONE_MAPPING,
  InputAction,
  QualityTierSettingsMap,
  STAMINA_MAX,
} from "genshin-engine";
import { InteractionKind, ItemCategory } from "genshin-interface";
import { GameTextKey } from "genshin-text";
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
  // The reader's game language, whose names the world loads
  language: GameLanguage;
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
  language,
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
const input = createInput(window);
const inputState = input.readInput(0);
// What is open over the world, one screen at a time, and what it does to the world under it
const screenKind = ref(ScreenKind.World);
// The talk a resident has begun, which the talk host runs over the world while the talk screen is open
const talk = shallowRef<Talk>();
// The game's stat tables, read as the world starts rather than with the package, which the opening downloads, and the
// Player's characters made from them and their party: the Traveler alone, as a new player's, on the field. Until the
// Tables arrive nobody walks the field and the character screen opens as a placeholder, and tables that fail to arrive
// Are logged and leave it so
const statTables = shallowRef<StatTables>();
const characters = shallowRef<Character[]>([]);
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(readStatTables).match(
  (newStatTables) => {
    statTables.value = newStatTables;
    characters.value = [createCharacter(TRAVELER_CHARACTER_ID, newStatTables.characterDataMap)];
  },
  (error) => {
    console.error(error);
  },
);
// The names the stat tables cite, in the reader's language, which the banners are named with once they arrive
const nameText = shallowRef<Readonly<Record<string, string>>>();
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => NameTextLoaderMap[language]()).match(
  (newNameText) => {
    nameText.value = newNameText;
  },
  (error) => {
    console.error(error);
  },
);
const party = reactive(createParty([TRAVELER_CHARACTER_ID]));
// How the character on the field moves, its body type's, once the roster has arrived
const locomotion = computed(() =>
  statTables.value ? getCharacterLocomotion(getActiveCharacterId(party), statTables.value.characterDataMap) : undefined,
);
// Each character's combat once the roster has arrived, priced by the Traveler's kit for every character until the kits
// Run reads each one's own. The character on the field's combat and its party member are what the HUD's health and
// Skills read
const characterIdCombatantMap = computed(() => {
  const combatantMap = new Map<number, Combatant>();
  if (!statTables.value) return combatantMap;
  for (const character of characters.value)
    combatantMap.set(character.id, {
      attributes: computeCharacterAttributes(getCharacterAttributeLines(character, statTables.value)),
      characterId: character.id,
      kit: TRAVELER_KIT,
      level: character.level,
    });
  return combatantMap;
});
const activeCombatant = computed(() => characterIdCombatantMap.value.get(getActiveCharacterId(party)));
const activePartyMember = computed(() => getPartyMember(party, getActiveCharacterId(party)));
// The field member's figures the HUD's health and skill buttons show, none until the character on the field is known
const hudMember = computed<HudMember | undefined>(() => {
  const combatant = activeCombatant.value;
  if (!combatant) return undefined;
  const partyMember = activePartyMember.value;
  return {
    burstCooldown: partyMember.burstCooldownSeconds,
    burstCooldownSeconds: combatant.kit.burstCooldownSeconds,
    energy: partyMember.energy,
    energyCost: combatant.kit.burstEnergyCost,
    health: partyMember.healthShare * combatant.attributes.maxHealth,
    level: combatant.level,
    maxHealth: combatant.attributes.maxHealth,
    skillCooldown: partyMember.skillCooldownSeconds,
    skillCooldownSeconds: combatant.kit.skillCooldownSeconds,
  };
});
// The player's bag, wallet, wish counters and characters' copies, holding nothing as a new player's do until the world
// Gives them something
const inventory = ref<Inventory>(EMPTY_INVENTORY);
const wallet = ref<Wallet>(EMPTY_WALLET);
const wishPityMap = ref(InitialBannerKindWishPityMap);
const characterCopyCountMap = shallowRef<ReadonlyMap<number, number>>(new Map());
// The quests in progress, how far each has come, their words and the one navigated to. Nothing starts a quest yet, so
// The quest screen opens empty
const quests: Quest[] = [];
const questProgressMap = new Map<string, QuestProgress>();
// The World Level the camps spawn at, from the player's Adventure EXP and quests. No source adds Adventure EXP or
// Completes a main quest yet, so the player stands at a new player's World Level 0
const worldLevel = computeAdventureRankStanding(0, new Set<string>()).worldLevel;
const questTextMap: Record<string, string> = {};
const trackedQuestId = ref("");
// The quest on the HUD's tracker, the one navigated to or with none the first in progress, which V navigates to, and the
// Navigated one's objective, which its beam rises over
const trackerQuest = computed(() => quests.find(({ id }) => id === trackedQuestId.value) ?? quests[0]);
const questTargetId = computed(() => {
  if (!trackedQuestId.value || !trackerQuest.value) return "";
  const { id, steps } = trackerQuest.value;
  return steps[questProgressMap.get(id)?.stepIndex ?? 0]?.objectives[0]?.targetId ?? "";
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
// The enemies in the world by their spawn key, which the enemies write as their camps load and as they die, and which
// The character's kit strikes and an enemy's strike lands from
const enemyMap = new Map<string, Enemy>();
// The drops lying in the world, which each defeated enemy's are placed among, and how many drops the page has placed,
// Which numbers the next ones
const worldDrops = shallowRef<WorldDrop[]>([]);
let placedDropCount = 0;
const windrise = useTemplateRef<InstanceType<typeof WorldWindrise>>("windrise");
// Each talk the quests in progress hold by its id, which a resident's talk is begun from
const talkMap = new Map(quests.flatMap(({ talks }) => talks.map((questTalk) => [questTalk.id, questTalk] as const)));
// What the character can act on in the world: each drop, named by its item, and each resident of the regions in reach
// Whose talk the world holds, named by its text. Each stands on the ground beneath its point
const interactables = computed<Interactable[]>(() => {
  const drops = worldDrops.value.map(({ id, itemId, position: { x, z } }) => ({
    id,
    kind: InteractionKind.PickUp,
    name: itemId === MORA_ITEM_ID ? gameText[GameTextKey.Mora] : getItemDefinition(itemId, gameText).name,
    position: { x, y: getWorldHeight(x, z), z },
  }));
  const residents = [...(windrise.value?.regionDataMap.values() ?? [])]
    .flatMap(({ residents: regionResidents }) => regionResidents)
    .filter(({ talkId }) => talkMap.has(talkId))
    .map(({ nameTextId, position: { x, z }, talkId }) => ({
      id: talkId,
      kind: InteractionKind.Talk,
      name: questTextMap[nameTextId] ?? "",
      position: { x, y: getWorldHeight(x, z), z },
    }));
  return [...drops, ...residents];
});
const { interactionPrompts, readInteraction } = useInteraction(() => interactables.value, characterBody);
// A defeated enemy's drops lie where it fell, numbered on from the drops placed before them
const placeWorldDrops = (enemy: Enemy, enemyDrops: EnemyDrops) => {
  const drops = placeEnemyDrops(enemy, enemyDrops, placedDropCount);
  placedDropCount += drops.length;
  worldDrops.value = [...worldDrops.value, ...drops];
};
// A pick up takes the drop's Mora or item into the wallet or the bag, and what the bag has no room for stays on the
// Ground as a smaller drop
const pickUpWorldDrop = (worldDrop: WorldDrop) => {
  const pickUp = pickUpDroppedItem(worldDrop, inventory.value, wallet.value, gameText);
  inventory.value = pickUp.inventory;
  wallet.value = pickUp.wallet;
  worldDrops.value =
    pickUp.overflow > 0
      ? worldDrops.value.map((drop) => (drop === worldDrop ? { ...drop, count: pickUp.overflow } : drop))
      : worldDrops.value.filter((drop) => drop !== worldDrop);
};
// Every landmark a jump lands at, which the map and the minimap draw
const jumpLandmarks = useJumpLandmarks(regionDataBaseUrl);
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
  pivot.set(x - origin.x, y + FOLLOW_CAMERA_PIVOT_HEIGHT, z - origin.z).project(activeCamera);
  hudFrame.pivotX = (pivot.x + 1) / 2;
  hudFrame.pivotY = (1 - pivot.y) / 2;
});
// A jump's pose while the screen is faded for it: set, the screen fades to black, and once that fade ends the character
// Is placed and the pose let go, so the screen fades back in
const jumpPose = shallowRef<WorldJumpPose>();
const jumpTo = (pose: WorldJumpPose) => {
  jumpPose.value = pose;
};
// A team that has all fallen revives at the share the game brings it back with, and is jumped to the landmark nearest
// The body, or left where it fell when no landmark is loaded
const respawnParty = () => {
  if (!checkIsPartyDown(party)) return;
  reviveParty(party);
  const nearestLandmark = findNearestLandmark(jumpLandmarks.value, characterBody.position);
  if (nearestLandmark) jumpTo(computeJumpPose(nearestLandmark));
};
// An enemy's strike lands on the character on the field, and a team it fells respawns
const strikeParty = (enemy: Enemy) => {
  const combatant = activeCombatant.value;
  if (!combatant) return;
  strikePartyMember(party, enemy, combatant);
  respawnParty();
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
          hudFrame.seconds = context.elapsed;
          if (!isPaused) screenKind = getNextScreenKind(screenKind, inputState.pressedActions);
          if (!isPaused && screenKind === ScreenKind.World && inputState.pressedActions.has(InputAction.HideInterface))
            isHudHidden = !isHudHidden;
          if (inputState.pressedActions.has(InputAction.ShowCursor)) showCursor();
          const partyMemberIndex = PARTY_MEMBER_INPUT_ACTIONS.findIndex((action) =>
            inputState.pressedActions.has(action),
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
            else if (interactable?.kind === InteractionKind.Talk) {
              talk = talkMap.get(interactable.id);
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
        photo mode or a talk holds it, and photo mode's camera flies free from where the follow camera left it -->
        <WorldCharacter
          v-if="!witness && locomotion"
          ref="character"
          :body="characterBody"
          :character-id-combatant-map
          :enemy-map
          :input-state
          :is-held="screenKind !== ScreenKind.World || undefined"
          :landmark-collider
          :locomotion
          :origin
          :party
          @drown="respawnParty()"
        />
        <WorldFreeCamera
          v-if="!witness && screenKind === ScreenKind.PhotoMode"
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
        @defeat="(enemy, enemyDrops) => placeWorldDrops(enemy, enemyDrops)"
        @ready="emit('ready')"
        @strike="(enemy) => strikeParty(enemy)"
      />
    </TresCanvas>
    <!-- No HUD over a reference's held camera or a witness render, which the game's recordings show bare -->
    <HudScreen
      v-if="!cameraPose && !witness && !isPaused && !isHudHidden && !screenBehaviour.isHudHidden"
      :camera="mapCamera"
      :character-data-map="statTables?.characterDataMap"
      :frame="hudFrame"
      :game-text
      :input
      :landmarks="jumpLandmarks"
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
      </template>
    </HudScreen>
    <MenuScreen v-model:screen-kind="screenKind" :game-text @quit="emit('quit')">
      <template #[ScreenKind.Map]>
        <MapOverlay
          :camera="mapCamera"
          :game-text
          :landmarks="jumpLandmarks"
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
      <template v-if="statTables && nameText" #[ScreenKind.Character]>
        <CharacterScreen
          :active-character-id="getActiveCharacterId(party)"
          :characters
          :game-text
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
          :wallet
          @close="screenKind = ScreenKind.World"
        />
      </template>
      <template v-if="statTables && nameText" #[ScreenKind.Wish]>
        <WishScreen
          v-model:character-copy-count-map="characterCopyCountMap"
          v-model:characters="characters"
          v-model:inventory="inventory"
          v-model:pity-map="wishPityMap"
          v-model:wallet="wallet"
          :game-text
          :name-text
          :stat-tables
          @close="screenKind = ScreenKind.World"
        />
      </template>
    </MenuScreen>
    <DialogueTalk
      v-if="screenKind === ScreenKind.Dialogue && talk"
      :game-text
      :talk
      :text-map="questTextMap"
      @end="screenKind = ScreenKind.World"
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
