<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";
import type { Constellation } from "#src/models/character/Constellation";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { InventoryDestruction } from "#src/models/inventory/InventoryDestruction";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { QuestMark } from "#src/models/quest/QuestMark";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldScreenProps } from "#src/models/world/WorldScreenProps";
import type { WorldTables } from "#src/models/world/WorldTables";
import type { TresCanvasInstance, TresContextWithClock, TresRendererSetupContext } from "@tresjs/core";

import AchievementScreen from "#src/components/Achievement/Screen/Index.vue";
import BookReaderScreen from "#src/components/Archive/BookReader/Index.vue";
import ArchiveScreen from "#src/components/Archive/Screen/Index.vue";
import CharacterPackLoader from "#src/components/Character/PackLoader/Index.vue";
import CharacterScene from "#src/components/Character/Scene/Index.vue";
import CharacterScreen from "#src/components/Character/Screen/Index.vue";
import CraftingScreen from "#src/components/Crafting/Screen/Index.vue";
import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
import FishingScreen from "#src/components/Fishing/Screen/Index.vue";
import GcgSession from "#src/components/Gcg/Session/Index.vue";
import HandbookScreen from "#src/components/Handbook/Screen/Index.vue";
import HudNavigation from "#src/components/Hud/Navigation/Index.vue";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import InteractionPromptList from "#src/components/Interaction/PromptList/Index.vue";
import InventoryScreen from "#src/components/Inventory/Screen/Index.vue";
import MapOverlay from "#src/components/Map/Overlay/Index.vue";
import MenuScreen from "#src/components/Menu/Screen/Index.vue";
import MenuTime from "#src/components/Menu/Time/Index.vue";
import PartyScreen from "#src/components/Party/Screen/Index.vue";
import QuestScreen from "#src/components/Quest/Screen/Index.vue";
import ReputationScreen from "#src/components/Reputation/Screen/Index.vue";
import WishScreen from "#src/components/Wish/Screen/Index.vue";
import WorldCharacter from "#src/components/World/Character/Index.vue";
import WorldEnemyNameTags from "#src/components/World/EnemyNameTags/Index.vue";
import WorldFreeCamera from "#src/components/World/FreeCamera/Index.vue";
import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { useCharacterPacks } from "#src/composables/useCharacterPacks";
import { useInteraction } from "#src/composables/useInteraction";
import { useWorldAchievements } from "#src/composables/useWorldAchievements";
import { useWorldAdventureRank } from "#src/composables/useWorldAdventureRank";
import { useWorldArchive } from "#src/composables/useWorldArchive";
import { useWorldChests } from "#src/composables/useWorldChests";
import { useWorldCombat } from "#src/composables/useWorldCombat";
import { useWorldCommissions } from "#src/composables/useWorldCommissions";
import { useWorldGadgets } from "#src/composables/useWorldGadgets";
import { useWorldFishing } from "#src/composables/useWorldFishing";
import { useWorldMap } from "#src/composables/useWorldMap";
import { useWorldOfferings } from "#src/composables/useWorldOfferings";
import { useWorldPickups } from "#src/composables/useWorldPickups";
import { useWorldPuzzles } from "#src/composables/useWorldPuzzles";
import { useWorldQuests } from "#src/composables/useWorldQuests";
import { useWorldSave } from "#src/composables/useWorldSave";
import { useWorldSaveSync } from "#src/composables/useWorldSaveSync";
import { useWorldTalks } from "#src/composables/useWorldTalks";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { readConstellationTables } from "#src/services/character/readConstellationTables";
import { computeCraftingBenchInteractables } from "#src/services/crafting/computeCraftingBenchInteractables";
import { computeCraftingCrafters } from "#src/services/crafting/computeCraftingCrafters";
import { computeFishingInteractables } from "#src/services/fishing/computeFishingInteractables";
import { getTalkScreenKind } from "#src/services/dialogue/getTalkScreenKind";
import { stepElementalSight } from "#src/services/elementalSight/stepElementalSight";
import { computeJumpLandmarkTextKey } from "#src/services/map/computeJumpLandmarkTextKey";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { TELEPORT_FADE_IN_MS, TELEPORT_FADE_OUT_MS } from "#src/services/map/constants";
import { findNearestTeleportWaypoint } from "#src/services/map/findNearestTeleportWaypoint";
import { findPointedLandmark } from "#src/services/map/findPointedLandmark";
import { PARTY_MEMBER_BURST_INPUT_ACTIONS, PARTY_MEMBER_INPUT_ACTIONS } from "#src/services/party/constants";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { findQuestTargetPosition } from "#src/services/quest/findQuestTargetPosition";
import { getEnteredGoToEvents } from "#src/services/quest/getEnteredGoToEvents";
import { getQuestTargetId } from "#src/services/quest/getQuestTargetId";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { getNextScreenKind } from "#src/services/screen/getNextScreenKind";
import { ScreenBehaviourMap } from "#src/services/screen/ScreenBehaviourMap";
import { tapActionKey } from "#src/services/shared/tapActionKey";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import { getResultAsync } from "@esposter/shared";
import { TresCanvas } from "@tresjs/core";
import { useEventListener, useMediaQuery, useRafFn } from "@vueuse/core";
import {
  createGenshinRenderer,
  createGrassTrail,
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

interface Props extends WorldScreenProps, WorldTables {}

const {
  accountCharacterPacks,
  accountFileBaseUrl,
  adventureRankTables,
  cameraPose,
  catalogue,
  characterPackBaseUrl,
  characterTalentKits,
  craftingBenchPlace,
  craftingRecipes,
  createTerrainWorker,
  enemyTables,
  frostbearingTreePlaces,
  gameDataBaseUrl,
  gameText,
  heldMinutes,
  hudInterfaceRects,
  isPaused,
  isTuning,
  keepAccountCharacterPack,
  language,
  materialDataMap,
  nameText,
  qualityTier,
  regionDataBaseUrl,
  removeAccountCharacterPack,
  save,
  sceneExportBaseUrl,
  seelies,
  serverClockOffsetMs = 0,
  startingCharacterIdKitMap,
  statTables,
  talentUpgradeMap,
  wildlifePlaces,
  windriseData,
  wishSchedule,
} = defineProps<Props>();
// Quitting the game leaves the world, which its host does. A grant is a change to the bag, the wallet, the wish counters or
// The achievements' progress, which the host saves once per tick, and a save is every change to what the world holds,
// Which the host saves on its own cadence
const emit = defineEmits<{ grant: []; quit: []; ready: []; save: [save: GenshinSave] }>();
const { maxPixelRatio } = QualityTierSettingsMap[qualityTier];
const canvas = useTemplateRef<TresCanvasInstance>("canvas");
const windrise = useTemplateRef<InstanceType<typeof WorldWindrise>>("windrise");
// The bends the character leaves as it walks through the grass, written by the character and read by the grass
const grassTrail = createGrassTrail();
// A witness render's tools set the camera themselves, which the controls would move off the pose they set
// oxlint-disable-next-line no-restricted-globals -- the parity page reaches a published scene's own parts with no prop for a host to see
const witness = inject(SceneWitnessKey, null);
// The keys, pointer and gamepad, read once a frame ahead of everything the frame moves, which reads the same state
const input = createInput(window);
const inputState = input.readInput(0);
// What is open over the world, one screen at a time, and what it does to the world under it
const screenKind = ref(ScreenKind.World);
// The systems the save holds, read once as the world is made, so the world starts where the player left it. A bag's
// Names are the game's own in the reader's language, and its weapons and materials are read from the game's tables, so
// All of them arrive first
const savedState = readGenshinSave(save ?? EMPTY_GENSHIN_SAVE, nameText, statTables.weaponDataMap, materialDataMap);
// The cross-system reactions of this screen, one emitter the systems share
const events = createWorldEvents();
const {
  achievementProgressMap,
  craftedCountMap,
  craftingProgress,
  frostbearingTreeProgress,
  archiveKillsMap,
  archiveProgressMap,
  inventory,
  openedChestIds,
  setInventory,
  setWallet,
  wallet,
  wishHistory,
  wishPityMap,
} = useWorldSave({ emitGrant: () => emit("grant"), events, savedState });
// A destroy's bag and wallet are applied together, since what it returns may be currency
const applyDestruction = ({ inventory: nextInventory, wallet: nextWallet }: InventoryDestruction) => {
  setInventory(nextInventory);
  setWallet(nextWallet);
};
// The copies of each character the player holds, from the save's counts and as the wish screen grants them
const characterCopyCountMap = shallowRef<ReadonlyMap<number, number>>(savedState.characterCopyCountMap);
// The carried quests, read as the world starts with their words in the reader's language, and how far each has come
const {
  finishedMainQuestIds,
  questProgressMap,
  quests,
  questsInProgress,
  questsOffered,
  questTargetId,
  questTextMap,
  trackedQuestId,
  trackerQuest,
} = useWorldQuests({ events, gameDataBaseUrl, language, savedQuestProgressMap: savedState.quests });
// Every saved timer is read against the server's clock, which this machine's own runs behind or ahead of by the offset
const getWorldNow = () => Temporal.Now.instant().add({ milliseconds: serverClockOffsetMs });
// The fishing points in reach, whether fishing is open at them, and the cast held while a point is fished
const { castView, closeFishing, fishingPointPlaces, isFishingOpen, isFishingPoint, openFishingPoint, stepFishing } =
  useWorldFishing({
    gameDataBaseUrl,
    getRegionIds: () => [...(windrise.value?.regionDataMap.keys() ?? [])],
    getWorldNow,
    inventory,
    materialDataMap,
    names: nameText,
    questProgressMap,
    quests,
    random: () => kitContext.random(),
    setInventory,
  });
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
  adventureRankTables,
  finishedMainQuestIds,
  getWorldNow,
  savedAdventureExp: savedState.adventureExp,
  savedWorldLevelAdjustment: savedState.worldLevelAdjustment,
  setWallet,
  wallet,
});
// The day's commissions, dealt again as the world opens when the day saved was dealt before the daily reset, and finished by
// The quests in progress that finish
const { commissionDay, handbookDayCommissions } = useWorldCommissions({
  events,
  finishedMainQuestIds,
  gameDataBaseUrl,
  getWorldNow,
  questProgressMap,
  questsInProgress,
  rank,
  savedCommissionDay: savedState.commissionDay,
});
// The Archive's entries, the volumes it reads and the defeats it counts, opened by the bag, the quests and the defeats
const { archiveData, bookReading, readBook } = useWorldArchive({
  archiveKillsMap,
  archiveProgressMap,
  enemyKindMap: enemyTables.enemyKindMap,
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
  if (newScreenKind !== ScreenKind.Fishing) closeFishing();
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
// The world's one ground, Windrise's with each region's laid over it from the moment the region first comes within
// Reach, which everything in the world stands on. It is built again only as a region's ground arrives
const worldHeight = computed(() =>
  createWorldHeight(windriseData.baseGround, [...(windrise.value?.regionGroundMap.values() ?? [])]),
);
const getGroundHeight = (x: number, z: number): number => worldHeight.value(x, z);
// What the character's body and the camera collide with, given the landmarks as they arrive
const landmarkCollider = createLandmarkCollider();
// What the character on the field is drawn on, which the controller moves and the scene places among everything in the
// World
const characterBody = new Group();
// Elemental Sight, which its binding turns on and off where the world is open, spreading from the place it was turned on
const elementalSight: ElementalSight = { isOn: false, origin: { x: 0, z: 0 }, spreadSeconds: 0 };
// The achievements the finished steps and quests move, and their data, read as the Achievements screen opens
const { achievementData } = useWorldAchievements({
  achievementProgressMap,
  events,
  gameDataBaseUrl,
  getWorldNow,
  language,
  screenKind,
  setWallet,
  wallet,
});
// The drops and the gathering points the character picks up, taken into the bag or the wallet
const {
  bagFullHint,
  materialSources,
  pickUpGatheringPlace,
  pickUpInteractables,
  pickUpMaterialSourcePlace,
  pickUpWorldDrop,
  placeWorldDrops,
  strikeGatheringOres,
  worldDrops,
} = useWorldPickups({
  archive: { archiveData, archiveProgressMap },
  events,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  getWorldNow,
  inventory,
  materialDataMap,
  nameText,
  serverClockOffsetMs,
  setInventory,
  setWallet,
  wallet,
});
// Mondstadt's chests, each unopened one a row to open beneath its point, and opened on the key with the world's random
const { chestInteractables, digChestById, openChestById } = useWorldChests({
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  inventory,
  materialDataMap,
  nameText,
  openedChestIds,
  placeWorldDrops,
  setInventory,
  setWallet,
  waterLevel: windriseData.water.level,
  wallet,
});
// The gadget equipped to the quick-use slot, which Z uses once its cooldown group is ready
const { equippedGadget, gadgetRows, getEquippedGadgetCooldown, quickUseEquippedGadget } = useWorldGadgets({
  gameDataBaseUrl,
  inventory,
});
// The Seelies of Mondstadt, each led to its court by the player following it, and settled where the save names it settled
const { puzzleSeelies, settledSeelieIds, stepWorldPuzzles } = useWorldPuzzles(seelies, savedState.settledSeelieIds);
// The Frostbearing Tree the bag is offered to, whose levels are read from the game's table as it is offered to, and
// Whose rewards the bag has no room for drop at the tree
const { offerFrostbearingTree } = useWorldOfferings({
  events,
  frostbearingTreeProgress,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  inventory,
  materialDataMap,
  nameText,
  placeWorldDrops,
  setInventory,
  setWallet,
  wallet,
});
// The party, the characters, the enemies and the kit's effects, which a defeat places drops among and a team's fall revives
const {
  characterIdSkillGlyphsMap,
  characters,
  chargeParty,
  clearKitEffects,
  defeatEnemy,
  hudMember,
  kitContext,
  locomotion,
  party,
  respawnParty,
  strikeParty,
} = useWorldCombat({
  enemyTables,
  events,
  gameDataBaseUrl,
  onPartyRevived: () => {
    const nearestWaypoint = findNearestTeleportWaypoint(unlockedLandmarks.value, characterBody.position);
    if (nearestWaypoint) jumpTo(computeJumpPose(nearestWaypoint));
  },
  placeWorldDrops,
  savedCharacters: savedState.characters,
  savedParty: savedState.party,
  startingCharacterIdKitMap,
  statTables,
  wildlifePlaces,
});
// The constellation table, read as the world starts, and the constellations each character's one set holds, by its id. A
// Traveler's form has a set for each element, which a statue picks, so it has none here until one does
const constellationKits = shallowRef<CharacterConstellationKit[]>([]);
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => readConstellationTables(gameDataBaseUrl)).match(
  (kits) => {
    constellationKits.value = kits;
  },
  (error) => {
    console.error(error);
  },
);
const characterIdConstellationsMap = computed(() => {
  const map = new Map<number, Constellation[]>();
  for (const { characterId, depots } of constellationKits.value) {
    const [depot] = depots;
    if (depots.length === 1 && depot) map.set(characterId, depot.constellations);
  }
  return map;
});
// The text id of each character's own Stella Fortuna's name, by the character's id, for a character with one set
const stellaFortunaNameTextIdMap = computed(() => {
  const map = new Map<number, string>();
  for (const { characterId, depots } of constellationKits.value) {
    const [depot] = depots;
    if (depots.length === 1 && depot) map.set(characterId, depot.stellaFortuna.nameTextId);
  }
  return map;
});
// The characters' packs: the ones the browser keeps, which a player loads on the character screen, read ahead of the
// Host's
const {
  activeCharacterPackReader,
  characterIdPackHashMap,
  getCharacterPackReader,
  isCharacterPackKept,
  keepCharacterPack,
  removeCharacterPack,
} = useCharacterPacks({
  accountFileBaseUrl,
  characterPackBaseUrl,
  getAccountCharacterPacks: () => accountCharacterPacks ?? [],
  getActiveCharacterId: () => getActiveCharacterId(party),
  keepAccountCharacterPack,
  removeAccountCharacterPack,
});
// The residents of the regions in reach, which the talks and a keeper's screen are read from
const getResidents = () => [...(windrise.value?.regionDataMap.values() ?? [])].flatMap(({ residents }) => residents);
// The talks a resident begins and the talk the world runs, held by id, with their words, the quest talks a resident's
// Standing talk offers and the duel a resident offers from each talk
const { gcgGameId, getTalkDuelGameId, residentInteractables, talk, talkDuelGameId, talkMap, talkOffers, talkTextMap } =
  useWorldTalks({
    gameDataBaseUrl,
    getGroundHeight,
    getResidents,
    getResidentSpot: (residentId) => windrise.value?.residentSpots.get(residentId),
    language,
    nameText,
    questProgressMap,
    questsInProgress,
    questsOffered,
    questTextMap,
  });
// The Mondstadt Reputation the player holds, which the exploration thresholds a statue's unlock crosses raise
const reputation = shallowRef<ReputationProgress>(savedState.reputation);
// Mondstadt's levels and their rewards, which the keeper's Reputation screen draws, and the level it is picked at
const reputationCity = shallowRef<ReputationCity>();
const reputationLevel = shallowRef(reputation.value.level);
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => readMondstadtReputation(gameDataBaseUrl)).match(
  (city) => {
    reputationCity.value = city;
  },
  (error) => {
    console.error(error);
  },
);
// The landmarks the world holds and the ones the player has unlocked, which a jump lands at and the first unlock pays
const {
  activateLandmark,
  explorationAreas,
  jumpPose,
  jumpTo,
  lockedDomainEntranceLandmarks,
  lockedJumpLandmarks,
  unlockedLandmarkIds,
  unlockedLandmarks,
} = useWorldMap({
  catalogue,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  regionDataBaseUrl,
  reputation,
  setReputation: (nextReputation) => {
    reputation.value = nextReputation;
  },
  setWallet,
  unlockedLandmarkIds: savedState.unlockedLandmarkIds,
  wallet,
});
// The Companionship EXP, the day's commissions, the statues, the solved puzzles and the Traveler's name no source changes
// Yet, so they are carried as they were saved
useWorldSaveSync({
  emitSave: (newSave) => emit("save", newSave),
  getSaveState: () => ({
    achievementProgressMap: achievementProgressMap.value,
    adventureExp: adventureExp.value,
    archiveKillsMap: archiveKillsMap.value,
    archiveProgressMap: archiveProgressMap.value,
    characterCopyCountMap: characterCopyCountMap.value,
    characters: characters.value,
    commissionDay: commissionDay.value,
    companionshipExpMap: savedState.companionshipExpMap,
    craftedCountMap: craftedCountMap.value,
    craftingProgress: craftingProgress.value,
    foundOculusIds: savedState.foundOculusIds,
    frostbearingTreeProgress: frostbearingTreeProgress.value,
    inventory: inventory.value,
    openedChestIds: openedChestIds.value,
    party,
    quests: questProgressMap.value,
    regionStatueProgressMap: savedState.regionStatueProgressMap,
    reputation: reputation.value,
    settledSeelieIds: settledSeelieIds.value,
    solvedPuzzleIds: savedState.solvedPuzzleIds,
    travelerName: savedState.travelerName,
    unlockedLandmarkIds: unlockedLandmarkIds.value,
    wallet: wallet.value,
    wishHistory: wishHistory.value,
    wishPityMap: wishPityMap.value,
    worldLevelAdjustment: worldLevelAdjustment.value,
  }),
});
// The party's crafters, each named by the game's text, and the one on the field, who is picked as the bench opens
const crafting = computed(() =>
  computeCraftingCrafters(
    getDeployedCharacterIds(party),
    getActiveCharacterId(party),
    (characterId) => nameText[statTables.characterDataMap.get(characterId)?.nameTextId ?? ""] || "",
  ),
);
// What the character can act on in the world: each drop, named by its item, each resident of the regions in reach
// Whose talk the world holds, named by its text, each locked jump landmark and domain entrance, which it resonates with,
// And the Crafting bench, named by its title. Each stands on the ground beneath its point
const interactables = computed<Interactable[]>(() => {
  // Each Frostbearing Tree is named by its game text and offered to on the key, so its row is an activation like a statue's
  const frostbearingTrees = frostbearingTreePlaces.map(({ id, position: { x, z } }) => ({
    id,
    kind: InteractionKind.Activate,
    name: gameText[GameTextKey.FrostbearingTree],
    position: { x, y: getGroundHeight(x, z), z },
  }));
  // A locked landmark is resonated with on the key, named by the game's text for its kind
  const toLandmarkInteractable = ({ id, position: { x, z } }: Landmark, textKey: GameTextKey): Interactable => ({
    id,
    kind: InteractionKind.Activate,
    name: gameText[textKey],
    position: { x, y: getGroundHeight(x, z), z },
  });
  return [
    ...pickUpInteractables.value,
    ...residentInteractables.value,
    ...chestInteractables.value,
    ...frostbearingTrees,
    ...lockedJumpLandmarks.value.map((landmark) =>
      toLandmarkInteractable(landmark, computeJumpLandmarkTextKey(landmark)),
    ),
    ...lockedDomainEntranceLandmarks.value.map((landmark) =>
      toLandmarkInteractable(landmark, GameTextKey.DomainEntrance),
    ),
    ...computeCraftingBenchInteractables(craftingBenchPlace, gameText[GameTextKey.CraftingTitle], getGroundHeight),
    ...computeFishingInteractables(fishingPointPlaces.value, isFishingOpen.value, gameText, getGroundHeight),
  ];
});
const { interactionPrompts, readInteraction, selectInteractable } = useInteraction(
  () => interactables.value,
  characterBody,
);
// A prompt's row pressed itself, by a tap or a click with the cursor shown: it is selected and Interact tapped
const pressInteractable = (id: string) => {
  selectInteractable(id);
  tapActionKey(input, InputAction.Interact);
};
// A quest's talk chosen on a standing talk's opening line runs in its place, and offers no duel of its own
const beginTalk = (talkId: string) => {
  talk.value = talkMap.value.get(talkId);
  talkDuelGameId.value = undefined;
};
// A talk that ends is a talk-to for the quests in progress, and the world is back under the Traveler
const endTalk = () => {
  if (talk.value) events.emit("questEvent", { kind: QuestObjectiveKind.TalkTo, targetId: talk.value.id });
  screenKind.value = ScreenKind.World;
};
const character = useTemplateRef("character");
// Whether the backslash has hidden the HUD, as the game's Hide UI does, apart from the screens that hide it
const isHudHidden = ref(false);
// Whether the HUD is drawn over the world, which a reference's held camera, a witness render, the pause and the screens
// That hide it all keep off
const isHudShown = computed(
  () => !cameraPose && !witness && !isPaused && !isHudHidden.value && !screenBehaviour.value.isHudHidden,
);
// Whether the device's main pointer is a finger, which the HUD draws the touch layout for
const isTouch = useMediaQuery("(pointer: coarse)");
// The character's ground point in world metres, the yaw the view faces and the yaw the character faces, for the map and
// The minimap, read each frame and handed on only when one moved, so a still player re-renders nothing
const mapCamera = shallowRef<MapCamera>({ facing: 0, x: 0, yaw: 0, z: 0 });
// The locked jump landmark the HUD points to, re-read as the character moves and as a landmark unlocks, so unlocking the
// One it points to lets the pointer go at once
const pointedLandmark = shallowRef<Landmark>();
watch([mapCamera, lockedJumpLandmarks], ([{ x, z }, lockedLandmarks]) => {
  pointedLandmark.value = findPointedLandmark(lockedLandmarks, { x, z }, pointedLandmark.value?.id);
});
// A quest's go-to step is reached once the character steps into its place's radius, so each place it steps into is a go-to
watch(mapCamera, (newCamera, oldCamera) => {
  if (!windrise.value) return;
  for (const questEvent of getEnteredGoToEvents([...windrise.value.regionDataMap.values()], oldCamera, newCamera))
    events.emit("questEvent", questEvent);
});
const cameraEuler = new Euler();
// What the HUD's pieces read each frame. The stamina meter's pivot is projected only while the pool is spent or
// Refilling, and once it is full the meter fades out where it stood
const hudFrame = reactive<HudFrame>({ gadgetCooldown: 0, pivotX: 0, pivotY: 0, seconds: 0, stamina: STAMINA_MAX });
const pivot = new Vector3();
useRafFn(() => {
  const activeCamera = canvas.value?.context?.camera.activeCamera.value;
  if (!activeCamera) return;
  const { x, y, z } = characterBody.position;
  const { y: facing } = characterBody.rotation;
  const { y: yaw } = cameraEuler.setFromQuaternion(activeCamera.quaternion, "YXZ");
  const { facing: lastFacing, x: lastX, yaw: lastYaw, z: lastZ } = mapCamera.value;
  if (x !== lastX || yaw !== lastYaw || z !== lastZ || facing !== lastFacing) mapCamera.value = { facing, x, yaw, z };
  const stamina = character.value?.stamina.value ?? STAMINA_MAX;
  if (stamina >= STAMINA_MAX && hudFrame.stamina >= STAMINA_MAX) return;
  hudFrame.stamina = stamina;
  pivot
    .set(x - origin.x, y + locomotion.value.capsuleHeight * FOLLOW_CAMERA_PIVOT_SHARE, z - origin.z)
    .project(activeCamera);
  hudFrame.pivotX = (pivot.x + 1) / 2;
  hudFrame.pivotY = (1 - pivot.y) / 2;
});
// How far each quest in progress's objective stands from the character's ground point, in metres, which the quest
// Screen lists. It is read only while that screen is drawn, and a quest whose target no region in reach places has none
const questDistanceMap = computed(() => {
  const distanceMap = new Map<string, number>();
  if (!windrise.value) return distanceMap;
  const { regionDataMap, residentSpots } = windrise.value;
  const { x, z } = mapCamera.value;
  for (const quest of questsInProgress.value) {
    const targetId = getQuestTargetId(quest, questProgressMap.value.get(quest.id));
    const position = targetId ? findQuestTargetPosition(regionDataMap, residentSpots, targetId) : undefined;
    if (position) distanceMap.set(quest.id, Math.hypot(position.x - x, position.z - z));
  }
  return distanceMap;
});
// Where the navigated objective stands from the character, which the tracker's line under its title reads: its distance
// Across the ground, as the quest screen lists it, and its ground's height over the character's ground point, both read
// Off the world's one ground. None while no quest is navigated to or no region in reach places its objective
const questMark = computed<QuestMark | undefined>(() => {
  if (!windrise.value || !questTargetId.value) return undefined;
  const { regionDataMap, residentSpots } = windrise.value;
  const position = findQuestTargetPosition(regionDataMap, residentSpots, questTargetId.value);
  if (!position) return undefined;
  const { x, z } = mapCamera.value;
  return {
    distance: Math.hypot(position.x - x, position.z - z),
    height: getGroundHeight(position.x, position.z) - getGroundHeight(x, z),
  };
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
          if (!isPaused && screenKind === ScreenKind.World) stepWorldPuzzles(context.delta, characterBody.position);
          if (!isPaused && screenKind === ScreenKind.Fishing)
            stepFishing({
              isReeling: inputState.heldActions.has(InputAction.NormalAttack),
              isStruck: inputState.pressedActions.has(InputAction.NormalAttack),
              seconds: context.delta,
            });
          if (inputState.pressedActions.has(InputAction.ShowCursor)) showCursor();
          if (!isPaused && screenKind === ScreenKind.World && inputState.pressedActions.has(InputAction.QuickUseGadget))
            quickUseEquippedGadget(getWorldNow());
          hudFrame.gadgetCooldown = getEquippedGadgetCooldown(getWorldNow());
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
            const materialSource = materialSources.find(({ id }) => id === interactable?.id);
            const frostbearingTreePlace = frostbearingTreePlaces.find(({ id }) => id === interactable?.id);
            if (interactable?.kind === InteractionKind.PickUp && worldDrop) pickUpWorldDrop(worldDrop);
            else if (interactable?.kind === InteractionKind.PickUp && materialSource)
              pickUpMaterialSourcePlace(materialSource.id);
            else if (interactable?.kind === InteractionKind.PickUp) pickUpGatheringPlace(interactable.id);
            else if (interactable?.kind === InteractionKind.Open) openChestById(interactable.id, kitContext.random);
            else if (interactable?.kind === InteractionKind.Dig) digChestById(interactable.id);
            else if (interactable?.kind === InteractionKind.Activate && frostbearingTreePlace)
              offerFrostbearingTree(frostbearingTreePlace);
            else if (interactable?.kind === InteractionKind.Activate) {
              activateLandmark(interactable.id);
            } else if (interactable?.kind === InteractionKind.Use && isFishingPoint(interactable.id)) {
              openFishingPoint(interactable.id);
              screenKind = ScreenKind.Fishing;
            } else if (interactable?.kind === InteractionKind.Use) {
              screenKind = ScreenKind.Crafting;
            } else if (interactable?.kind === InteractionKind.Talk) {
              talk = talkMap.get(interactable.id);
              talkDuelGameId = getTalkDuelGameId(interactable.id);
              screenKind = getTalkScreenKind(interactable.id, getResidents());
              reputationLevel = reputation.level;
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
          :get-ground-height
          :grass-trail="grassTrail"
          :input-state
          :is-held="screenKind !== ScreenKind.World || undefined"
          :is-orbiting="(screenKind === ScreenKind.PhotoMode && !isTuning) || undefined"
          :kit-context
          :landmark-collider
          :locomotion
          :origin
          :water-level="windriseData.water.level"
          @clear-kit-effects="clearKitEffects()"
          @drown="respawnParty()"
          @strike-ore="(body, hit) => strikeGatheringOres(body, hit, kitContext.random)"
        />
        <WorldFreeCamera
          v-if="!witness && screenKind === ScreenKind.PhotoMode && isTuning"
          :get-ground-height
          :input-state
          :is-held="screenBehaviour.isHeld || undefined"
          :origin
          :water-level="windriseData.water.level"
        />
      </template>
      <WorldWindrise
        ref="windrise"
        :active-character-id="getActiveCharacterId(party)"
        :catalogue
        :character-body="cameraPose || witness || !locomotion ? undefined : characterBody"
        :character-locomotion="locomotion"
        :character-pack-reader="activeCharacterPackReader"
        :create-terrain-worker
        :kit-effect-state="kitContext.kitEffectState"
        :elemental-sight
        :enemy-map="kitContext.enemyMap"
        :enemy-tables
        :grass-trail="grassTrail"
        :game-data-base-url
        :get-ground-height
        :held-minutes
        :is-held="screenBehaviour.isHeld || undefined"
        :interactables
        :is-paused
        :is-tuning="Boolean(isTuning)"
        :landmark-collider
        :origin
        :quality-tier
        :quest-target-id
        :region-data-base-url
        :scene-export-base-url
        :frostbearing-tree-places
        :seelies="puzzleSeelies"
        :wildlife-list="kitContext.wildlifeList"
        :windrise-data
        :world-level
        :world-level-rows="adventureRankTables.worldLevelRows"
        @charge="chargeParty()"
        @defeat="(enemy, enemyDrops) => defeatEnemy(enemy, enemyDrops)"
        @ready="emit('ready')"
        @strike="(enemy, taunt) => strikeParty(enemy, taunt)"
      />
    </TresCanvas>
    <WorldEnemyNameTags
      :elemental-sight
      :enemy-kind-map="enemyTables.enemyKindMap"
      :enemy-map="kitContext.enemyMap"
      :get-camera
      :get-ground-height
      :name-text
      :origin
    />
    <!-- No HUD over a reference's held camera or a witness render, which the game's recordings show bare -->
    <HudNavigation
      v-if="isHudShown && pointedLandmark"
      :get-camera
      :get-ground-height
      :landmark="pointedLandmark"
      :origin
    />
    <HudScreen
      v-if="isHudShown"
      :camera="mapCamera"
      :catalogue
      :character-data-map="statTables.characterDataMap"
      :character-id-skill-glyphs-map
      :frame="hudFrame"
      :game-text
      :gadget-cooldown-seconds="equippedGadget?.cooldownSeconds"
      :input
      :interface-rects="hudInterfaceRects"
      :is-touch
      :landmarks="unlockedLandmarks"
      :max-stamina="STAMINA_MAX"
      :member="hudMember"
      :name-text-map="nameText"
      :party
      :quest-mark
      :quest-progress="trackerQuest && questProgressMap.get(trackerQuest.id)"
      :quest-text-map
      :tracked-quest="trackerQuest"
      :traveler-name="savedState.travelerName"
      @map="screenKind = ScreenKind.Map"
      @menu="screenKind = ScreenKind.PaimonMenu"
    >
      <template #prompts>
        <InteractionPromptList :interaction-prompts :is-touch @press="(id) => pressInteractable(id)" />
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
      :server-clock-offset-ms
      :world-level
      :world-level-changed-at="worldLevelAdjustment.changedAt"
      @quit="emit('quit')"
      @toggle-world-level="toggleWorldLevel()"
    >
      <template #[ScreenKind.Map]>
        <MapOverlay
          :camera="mapCamera"
          :catalogue
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
          :quest-distance-map
          :quest-progress-map
          :quests="questsInProgress"
          :text-map="questTextMap"
          :tracked-quest-id
          @close="screenKind = ScreenKind.World"
          @navigate="(questId) => (trackedQuestId = questId)"
        />
      </template>
      <template #[ScreenKind.AdventurerHandbook]>
        <!-- The world keeps no investigations yet, so the Experience page opens on an empty panel -->
        <HandbookScreen
          :commissions="[]"
          :completed-count="0"
          :day-commissions="handbookDayCommissions"
          :game-text
          :investigation-rewards="[]"
          :name-text="nameText"
          :total-count="0"
          @close="screenKind = ScreenKind.World"
        />
      </template>
      <template #[ScreenKind.Character]>
        <CharacterScreen
          v-model:characters="characters"
          v-model:wallet="wallet"
          :active-character-id="getActiveCharacterId(party)"
          :character-talent-kits
          :character-id-constellations-map
          :companionship-exp-map="savedState.companionshipExpMap"
          :game-data-base-url
          :game-text
          :initial-tab="CharacterMenuTab.Attributes"
          :inventory
          :language
          :material-data-map
          :max-stamina="STAMINA_MAX"
          :name-text
          :stat-tables
          :talent-upgrade-map
          @close="screenKind = ScreenKind.World"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
        >
          <template #scene="{ tab }">
            <CharacterScene :tab />
          </template>
          <template #default="{ characterId }">
            <CharacterPackLoader
              :character-id
              :character-pack-reader="getCharacterPackReader(characterId)"
              :game-data-base-url
              :is-character-pack-kept="isCharacterPackKept(characterId)"
              :keep-character-pack
              :confirm-removal="() => removeCharacterPack(characterId)"
            />
          </template>
        </CharacterScreen>
      </template>
      <template #[ScreenKind.Inventory]>
        <InventoryScreen
          :game-text
          :gadget-rows="gadgetRows"
          :initial-category="ItemCategory.Weapon"
          :inventory
          :material-data-map
          :names="nameText"
          :wallet
          @close="screenKind = ScreenKind.World"
          @destroy="(destruction) => applyDestruction(destruction)"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
        />
      </template>
      <template #[ScreenKind.Wish]>
        <WishScreen
          v-model:character-copy-count-map="characterCopyCountMap"
          v-model:characters="characters"
          v-model:pity-map="wishPityMap"
          v-model:wish-history="wishHistory"
          v-model:wallet="wallet"
          :game-text
          :inventory
          :name-text
          :stat-tables
          :server-clock-offset-ms
          :wish-schedule
          :stella-fortuna-name-text-id-map
          @close="screenKind = ScreenKind.World"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
        />
      </template>
      <!-- The Time screen dials the hour and confirming sets the world's clock to it, from which the world runs on -->
      <template v-if="windrise" #[ScreenKind.Time]>
        <MenuTime
          :clock-minutes="windrise.gameClock.minutes"
          :game-text
          @close="screenKind = ScreenKind.World"
          @confirm="
            (minutes) => {
              if (windrise) windrise.gameClock.minutes = minutes;
              screenKind = ScreenKind.World;
            }
          "
        />
      </template>
      <template #[ScreenKind.PartySetup]>
        <PartyScreen
          :character-data-map="statTables.characterDataMap"
          :characters
          :game-text
          :name-text
          :party
          :traveler-name="savedState.travelerName"
          @close="screenKind = ScreenKind.World"
        />
      </template>
    </MenuScreen>
    <DialogueTalk
      v-if="screenKind === ScreenKind.Dialogue && talk"
      :key="talk.id"
      :game-text
      :is-duel-offered="talkDuelGameId !== undefined"
      :offers="talkOffers"
      :talk
      :text-map="talkTextMap"
      @begin="(talkId) => beginTalk(talkId)"
      @duel="
        gcgGameId = talkDuelGameId;
        screenKind = ScreenKind.GcgDuel;
      "
      @end="endTalk()"
    />
    <ReputationScreen
      v-if="screenKind === ScreenKind.Reputation && reputationCity"
      v-model:level="reputationLevel"
      :game-text
      :material-data-map
      :name-text
      :progress="reputation"
      :reputation="reputationCity"
      @close="screenKind = ScreenKind.World"
    />
    <GcgSession
      v-if="screenKind === ScreenKind.GcgDuel && gcgGameId !== undefined"
      :game-data-base-url
      :game-id="gcgGameId"
      :game-text
      :language
      @leave="
        gcgGameId = undefined;
        screenKind = ScreenKind.World;
      "
    />
    <FishingScreen v-if="screenKind === ScreenKind.Fishing" :view="castView" />
    <CraftingScreen
      v-if="screenKind === ScreenKind.Crafting"
      v-model:crafted-count-map="craftedCountMap"
      :adventure-rank="rank"
      :crafters="crafting.crafters"
      :game-text
      :initial-crafter-id="crafting.crafterId"
      :inventory
      :material-data-map
      :name-text
      :progress="craftingProgress"
      :random="kitContext.random"
      :recipes="craftingRecipes"
      :wallet
      @close="screenKind = ScreenKind.World"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
      @update:wallet="(nextWallet) => setWallet(nextWallet)"
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

/* The teleport's fade to the loading screen's background and back, its durations read off the teleport clip */
.teleport-fade {
  position: absolute;
  background: #e9ece9;
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
