<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";
import type { ChestLockSource } from "#src/models/chest/ChestLockSource";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Expedition } from "#src/models/expedition/Expedition";
import type { HomeRealmVisit } from "#src/models/home/HomeRealmVisit";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { InventoryDestruction } from "#src/models/inventory/InventoryDestruction";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { QuestMark } from "#src/models/quest/QuestMark";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ReputationRequest } from "#src/models/reputation/ReputationRequest";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { RestorativePower } from "#src/models/statue/RestorativePower";
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldScreenProps } from "#src/models/world/WorldScreenProps";
import type { WorldTables } from "#src/models/world/WorldTables";
import type { PlacedDoing } from "#src/services/exploration/placeExplorationDoings";
import type { TresCanvasInstance, TresContextWithClock, TresRendererSetupContext } from "@tresjs/core";

import AchievementScreen from "#src/components/Achievement/Screen/Index.vue";
import BookReaderScreen from "#src/components/Archive/BookReader/Index.vue";
import ArchiveScreen from "#src/components/Archive/Screen/Index.vue";
import CharacterPackLoader from "#src/components/Character/PackLoader/Index.vue";
import CharacterScene from "#src/components/Character/Scene/Index.vue";
import CharacterScreen from "#src/components/Character/Screen/Index.vue";
import ProcessingScreen from "#src/components/Cooking/Processing/Index.vue";
import CookingScreen from "#src/components/Cooking/Screen/Index.vue";
import StatueScreen from "#src/components/Statue/Screen/Index.vue";
import CraftingScreen from "#src/components/Crafting/Screen/Index.vue";
import DomainScreen from "#src/components/Domain/Screen/Index.vue";
import ForgeScreen from "#src/components/Forge/Screen/Index.vue";
import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
import ExpeditionLoader from "#src/components/Expedition/Loader/Index.vue";
import FishingScreen from "#src/components/Fishing/Screen/Index.vue";
import GameOverScreen from "#src/components/GameOver/Index.vue";
import GcgSession from "#src/components/Gcg/Session/Index.vue";
import HandbookScreen from "#src/components/Handbook/Screen/Index.vue";
import HudNavigation from "#src/components/Hud/Navigation/Index.vue";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import OfferChoice from "#src/components/Interaction/OfferChoice/Index.vue";
import InteractionPromptList from "#src/components/Interaction/PromptList/Index.vue";
import TipPopup from "#src/components/World/Tip/Index.vue";
import InventoryScreen from "#src/components/Inventory/Screen/Index.vue";
import MapOverlay from "#src/components/Map/Overlay/Index.vue";
import MailScreen from "#src/components/Mail/Screen/Index.vue";
import MenuScreen from "#src/components/Menu/Screen/Index.vue";
import MenuSettings from "#src/components/Menu/Settings/Index.vue";
import MenuTime from "#src/components/Menu/Time/Index.vue";
import PaimonsBargainsScreen from "#src/components/PaimonsBargains/Screen/Index.vue";
import PartyScreen from "#src/components/Party/Screen/Index.vue";
import QuestScreen from "#src/components/Quest/Screen/Index.vue";
import ReputationScreen from "#src/components/Reputation/Screen/Index.vue";
import ShopScreen from "#src/components/Shop/Screen/Index.vue";
import SpiralAbyssBenediction from "#src/components/SpiralAbyss/Benediction/Index.vue";
import SpiralAbyssEntryScreen from "#src/components/SpiralAbyss/Entry/Index.vue";
import WishScreen from "#src/components/Wish/Screen/Index.vue";
import WorldCharacter from "#src/components/World/Character/Index.vue";
import WorldRealm from "#src/components/World/Realm/Index.vue";
import WorldEnemyNameTags from "#src/components/World/EnemyNameTags/Index.vue";
import WorldFreeCamera from "#src/components/World/FreeCamera/Index.vue";
import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { useCharacterPacks } from "#src/composables/useCharacterPacks";
import { useInteraction } from "#src/composables/useInteraction";
import { useMiningOutcrops } from "#src/composables/useMiningOutcrops";
import { useWorldAchievements } from "#src/composables/useWorldAchievements";
import { useWorldAdventureRank } from "#src/composables/useWorldAdventureRank";
import { useWorldArchive } from "#src/composables/useWorldArchive";
import { useWorldMail } from "#src/composables/useWorldMail";
import { useWorldChests } from "#src/composables/useWorldChests";
import { useWorldCombat } from "#src/composables/useWorldCombat";
import { useWorldCommissionClaims } from "#src/composables/useWorldCommissionClaims";
import { useWorldCommissions } from "#src/composables/useWorldCommissions";
import { useWorldCooking } from "#src/composables/useWorldCooking";
import { useWorldForging } from "#src/composables/useWorldForging";
import { useWorldFriendship } from "#src/composables/useWorldFriendship";
import { useWorldDishes } from "#src/composables/useWorldDishes";
import { useWorldFishing } from "#src/composables/useWorldFishing";
import { useWorldGadgets } from "#src/composables/useWorldGadgets";
import { useWorldDomains } from "#src/composables/useWorldDomains";
import { useWorldMap } from "#src/composables/useWorldMap";
import { useWorldOfferings } from "#src/composables/useWorldOfferings";
import { useWorldOutcrops } from "#src/composables/useWorldOutcrops";
import { useWorldPickups } from "#src/composables/useWorldPickups";
import { useWorldPuzzles } from "#src/composables/useWorldPuzzles";
import { useWorldShrines } from "#src/composables/useWorldShrines";
import { useWorldQuestRewards } from "#src/composables/useWorldQuestRewards";
import { useWorldQuests } from "#src/composables/useWorldQuests";
import { useWorldSave } from "#src/composables/useWorldSave";
import { useWorldTips } from "#src/composables/useWorldTips";
import { useWorldSaveSync } from "#src/composables/useWorldSaveSync";
import { useWorldSpiralAbyss } from "#src/composables/useWorldSpiralAbyss";
import { useWorldStatues } from "#src/composables/useWorldStatues";
import { useWorldTalks } from "#src/composables/useWorldTalks";
import { useWorldTrounceBlossoms } from "#src/composables/useWorldTrounceBlossoms";
import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { ReputationRequestQuestIds } from "#src/models/quest/QuestId";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { BossMovesMap } from "#src/services/bosses/BossMovesMap";
import { checkIsWeeklyBossEntryOpen } from "#src/services/bosses/checkIsWeeklyBossEntryOpen";
import { startBossMove } from "#src/services/bosses/startBossMove";
import { TRAVELER_BONUS_QUEST_ID } from "#src/services/character/constants";
import { getCharacterIdConstellationsMap } from "#src/services/character/getCharacterIdConstellationsMap";
import { readConstellationTables } from "#src/services/character/readConstellationTables";
import { computeCookingStoveInteractables } from "#src/services/cooking/computeCookingStoveInteractables";
import { COOKING_PROCESSING_INTERACTABLE_ID, COOKING_STOVE_INTERACTABLE_ID } from "#src/services/cooking/constants";
import { listOpenCookingRecipes } from "#src/services/cooking/listOpenCookingRecipes";
import { computeCraftingBenchInteractables } from "#src/services/crafting/computeCraftingBenchInteractables";
import { computeCraftingCrafters } from "#src/services/crafting/computeCraftingCrafters";
import {
  DOMAIN_ARENA_PROMPT_OFFSET,
  DOMAIN_LEAVE_INTERACTABLE_ID,
  DOMAIN_TREE_INTERACTABLE_ID,
} from "#src/services/domains/constants";
import { computeForgeDefinitions } from "#src/services/forging/computeForgeDefinitions";
import { computeForgeInteractables } from "#src/services/forging/computeForgeInteractables";
import { computeForgeWeapons } from "#src/services/forging/computeForgeWeapons";
import { FIRST_FORGE_RECIPE_ID, FORGE_CLOCK_INTERVAL_MS, FORGE_INTERACTABLE_ID } from "#src/services/forging/constants";
import { createForgeProgress } from "#src/services/forging/createForgeProgress";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { computeProfileNamecardItemIds } from "#src/services/profile/computeProfileNamecardItemIds";
import { getTalkScreenKind } from "#src/services/dialogue/getTalkScreenKind";
import { getTalkVendorShopId } from "#src/services/dialogue/getTalkVendorShopId";
import { stepElementalSight } from "#src/services/elementalSight/stepElementalSight";
import { checkIsExpeditionTalk } from "#src/services/expedition/checkIsExpeditionTalk";
import { computeFishingInteractables } from "#src/services/fishing/computeFishingInteractables";
import { toHandbookDomains } from "#src/services/handbook/toHandbookDomains";
import { computeHomePotInteractable } from "#src/services/home/computeHomePotInteractable";
import { computeHomeRealmInteractables } from "#src/services/home/computeHomeRealmInteractables";
import { computeHomeRealmVisit } from "#src/services/home/computeHomeRealmVisit";
import {
  HOME_POT_GADGET_ID,
  HOME_REALM_GROUND_HEIGHT,
  HOME_REALM_SPAWN,
  HOME_STAND_IN_POT_REGION_ID,
  HOME_TUBBY_NPC_ID,
} from "#src/services/home/constants";
import { leaveHomeRealm } from "#src/services/home/leaveHomeRealm";
import { useInventoryEntry } from "#src/services/inventory/useInventoryEntry";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { OUTCROP_REGION_ID } from "#src/services/leyLine/constants";
import { computeJumpLandmarkTextKey } from "#src/services/map/computeJumpLandmarkTextKey";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { TELEPORT_FADE_IN_MS, TELEPORT_FADE_OUT_MS } from "#src/services/map/constants";
import { findAreaAt } from "#src/services/map/findAreaAt";
import { findNearestTeleportWaypoint } from "#src/services/map/findNearestTeleportWaypoint";
import { findPointedLandmark } from "#src/services/map/findPointedLandmark";
import { GENSHIN_SETTINGS_DEFAULTS, GENSHIN_SETTINGS_STORAGE_KEY } from "#src/services/menu/constants";
import { readGenshinSettings } from "#src/services/menu/readGenshinSettings";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { PARTY_MEMBER_BURST_INPUT_ACTIONS, PARTY_MEMBER_INPUT_ACTIONS } from "#src/services/party/constants";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { checkIsSpecialStoryModeActive } from "#src/services/quest/checkIsSpecialStoryModeActive";
import { getTeamAntiColdRatio } from "#src/services/sheerCold/getTeamAntiColdRatio";
import { findQuestTargetPosition } from "#src/services/quest/findQuestTargetPosition";
import { getEnteredGoToEvents } from "#src/services/quest/getEnteredGoToEvents";
import { getQuestTargetId } from "#src/services/quest/getQuestTargetId";
import { offerReputationRequest } from "#src/services/reputation/offerReputationRequest";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { getNextScreenKind } from "#src/services/screen/getNextScreenKind";
import { getShortcutWheelStep } from "#src/services/shortcutWheel/getShortcutWheelStep";
import { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import type { ShortcutWheelStep } from "#src/models/shortcutWheel/ShortcutWheelStep";
import { ScreenBehaviourMap } from "#src/services/screen/ScreenBehaviourMap";
import { tapActionKey } from "#src/services/shared/tapActionKey";
import { checkIsVendorHourOpen } from "#src/services/shop/checkIsVendorHourOpen";
import { checkIsVendorShopOpen } from "#src/services/shop/checkIsVendorShopOpen";
import { ABYSS_ENTRANCE_INTERACTABLE_ID, ABYSS_ENTRANCE_POSITION } from "#src/services/spiralAbyss/constants";
import { PAIMON_BARGAINS_SHOP_ID } from "#src/services/shop/constants";
import { VendorShopTypeMap } from "#src/services/shop/VendorShopTypeMap";
import { computeTravelerElement } from "#src/services/statue/computeTravelerElement";
import {
  OCULUS_MINIMAP_DISTANCE,
  OCULUS_REGION_ID,
  OCULUS_TOUCH_RADIUS,
  RESTORATIVE_POWER_PER_STATUE,
} from "#src/services/statue/constants";
import { computeStatueInteractables } from "#src/services/statue/computeStatueInteractables";
import { getNearOculusPlaces } from "#src/services/statue/getNearOculusPlaces";
import { getResonatedRegionIds } from "#src/services/statue/getResonatedRegionIds";
import { getTravelerElementBonusLines } from "#src/services/statue/getTravelerElementBonusLines";
import { readOculusPlaces } from "#src/services/statue/readOculusPlaces";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import { getResultAsync } from "@esposter/shared";
import { TresCanvas } from "@tresjs/core";
import { useEventListener, useIntervalFn, useLocalStorage, useMediaQuery, useRafFn } from "@vueuse/core";
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
import { CharacterMenuTab, ForgeTab, InteractionKind, ItemCategory } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { Euler, Group, MathUtils, PCFShadowMap, Vector3 } from "three";
import { unref } from "vue";

interface Props extends WorldScreenProps, WorldTables {}

const {
  accountAvatarUrl,
  accountCharacterPacks,
  accountFileBaseUrl,
  accountName,
  adventureRankTables,
  cameraPose,
  artifactMainAffixPools,
  artifactRarityDataMap,
  catalogue,
  characterPackBaseUrl,
  characterTalentKits,
  craftingBenchPlace,
  craftingRecipes,
  createTerrainWorker,
  enemyTables,
  frostbearingTreeLevels,
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
  monumentPlaces,
  nameText,
  paimonsBargainsRotation,
  qualityTier,
  regionDataBaseUrl,
  reliquaryPieceEntryMap,
  reliquarySets,
  removeAccountCharacterPack,
  save,
  sceneExportBaseUrl,
  seelies,
  serverClockOffsetMs = 0,
  shopIdShopGoodMap,
  shrineKeySources,
  shrinePlaces,
  startingCharacterIdKitMap,
  statTables,
  talentUpgradeMap,
  timeTrialPlaces,
  wildlifePlaces,
  windriseData,
  wishSchedule,
  tipText,
  tips,
} = defineProps<Props>();
// Quitting the game leaves the world, which its host does. A grant is a change to the bag, the wallet, the wish counters or
// The achievements' progress, which the host saves once per tick, and a save is every change to what the world holds,
// Which the host saves on its own cadence
const emit = defineEmits<{ grant: []; quit: []; ready: []; save: [save: GenshinSave] }>();
// The settings the device keeps, read over the host's defaults. The world renders at the quality tier it started with,
// Since its renderer and grass take the tier at setup, so a tier chosen in Settings is kept for the next start
const settingsDefaults = { ...GENSHIN_SETTINGS_DEFAULTS, language, qualityTier };
const settings = useLocalStorage<GenshinSettings>(GENSHIN_SETTINGS_STORAGE_KEY, settingsDefaults, {
  serializer: { read: (raw) => readGenshinSettings(raw, settingsDefaults), write: (value) => JSON.stringify(value) },
  writeDefaults: false,
});
const worldQualityTier = settings.value.qualityTier;
const { maxPixelRatio } = QualityTierSettingsMap[worldQualityTier];
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
const savedState = readGenshinSave(
  save ?? EMPTY_GENSHIN_SAVE,
  nameText,
  statTables.weaponDataMap,
  materialDataMap,
  reliquaryPieceEntryMap,
);
// The cross-system reactions of this screen, one emitter the systems share
const events = createWorldEvents();
const {
  achievementProgressMap,
  archiveKillsMap,
  archiveProgressMap,
  clearedCamps,
  clearedDomainIds,
  cookingProgress,
  craftedCountMap,
  craftingProgress,
  enemyRespawnMap,
  foundOculusIds,
  frostbearingTreeProgress,
  inventory,
  namecardItemId,
  openedChestIds,
  processingJobs,
  regionStatueProgressMap,
  setEnemyRespawnAt,
  setInventory,
  setNamecardItemId,
  setWallet,
  shownTipIds,
  wallet,
  wishHistory,
  wishPityMap,
} = useWorldSave({ emitGrant: () => emit("grant"), events, savedState });
// The tips the world shows, each once per save, in the order the quests that trigger them finish
const { closeTip, showingTip } = useWorldTips({ events, shownTipIds, tips });
// A destroy's bag and wallet are applied together, since what it returns may be currency
const applyDestruction = ({ inventory: nextInventory, wallet: nextWallet }: InventoryDestruction) => {
  setInventory(nextInventory);
  setWallet(nextWallet);
};
// The copies of each character the player holds, from the save's counts and as the wish screen grants them
const characterCopyCountMap = shallowRef<ReadonlyMap<number, number>>(savedState.characterCopyCountMap);
// The carried quests, read as the world starts with their words in the reader's language, and how far each has come
const {
  acceptQuest,
  finishedMainQuestIds,
  questChapters,
  questProgressMap,
  quests,
  questsInProgress,
  questsOffered,
  questStepTargets,
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
  adventureRankRewardsClaimed,
  claimKatheryneRewards,
  completedMainQuestIds,
  gainWorldAdventureExp,
  isWorldLevelAdjustable,
  rank,
  toggleWorldLevel,
  worldLevel,
  worldLevelAdjustment,
} = useWorldAdventureRank({
  adventureRankTables,
  events,
  finishedMainQuestIds,
  getWorldNow,
  savedAdventureExp: savedState.adventureExp,
  savedAdventureRankRewardsClaimed: savedState.adventureRankRewardsClaimed,
  savedWorldLevelAdjustment: savedState.worldLevelAdjustment,
  setWallet,
  wallet,
});
// The day's commissions, dealt again as the world opens when the day saved was dealt before the daily reset, and finished by
// The quests in progress that finish
const {
  commissionDay,
  commissionSlice,
  encounterPointLimit,
  encounterPoints,
  handbookDayCommissions,
  isAdventureEncountersUnlocked,
  longTermEncounterPoints,
  wholeEncounterPoints,
  wholeLongTermEncounterPoints,
} = useWorldCommissions({
  events,
  finishedMainQuestIds,
  gameDataBaseUrl,
  getWorldNow,
  questProgressMap,
  questsInProgress,
  rank,
  savedCommissionDay: savedState.commissionDay,
  savedEncounterPoints: savedState.encounterPoints,
  savedLongTermEncounterPoints: savedState.longTermEncounterPoints,
});
// The Archive's entries, the volumes it reads and the defeats it counts, opened by the bag, the quests and the defeats
const { archiveData, bookReading, readBook } = useWorldArchive({
  archiveKillsMap,
  archiveProgressMap,
  enemyKindMap: enemyTables.enemyKindMap,
  events,
  finishedMainQuestIds,
  gameDataBaseUrl,
  inventory,
  language,
  reliquaryPieceEntryMap,
  reliquarySets,
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
// The realm the player is in, once they have gone into it from the pot: the place they went in from. While it is set the realm's
// Island is shown in place of the world, and the world's ground gives way to the realm's flat ground
const homeRealmVisit = shallowRef<HomeRealmVisit>();
// The world's one ground, Windrise's with each region's laid over it from the moment the region first comes within
// Reach, which everything in the world stands on. It is built again only as a region's ground arrives
const worldHeight = computed(() =>
  createWorldHeight(windriseData.baseGrounds, [...(windrise.value?.regionGroundMap.values() ?? [])]),
);
const getGroundHeight = (x: number, z: number): number =>
  homeRealmVisit.value ? HOME_REALM_GROUND_HEIGHT : worldHeight.value(x, z);
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
// The mailbox, read as the world starts with the Traveler's birthday mail due and the expired mails gone, and claimed as
// The Mail screen claims them into the bag and wallet
const {
  claim: claimMail,
  claimAll: claimAllMails,
  isBagFull: isMailBagFull,
  mailData,
  mails,
  markMailRead,
} = useWorldMail({
  gameDataBaseUrl,
  getWorldNow,
  inventory,
  language,
  materialDataMap,
  names: nameText,
  savedMails: savedState.mails,
  savedTravelerBirthday: savedState.travelerBirthday,
  setInventory,
  setWallet,
  wallet,
});
// The drops and the gathering points the character picks up, taken into the bag or the wallet
const {
  bagFullHint,
  breakOre,
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
  reliquaryPieceEntryMap,
  serverClockOffsetMs,
  setInventory,
  setWallet,
  weaponDataMap: statTables.weaponDataMap,
  wallet,
});
// The Elemental Monuments of Mondstadt, the Seelies, the Time Trial Challenges and the Shrines of Depths, each lit, led,
// Started or opened by the player, and each settled or solved where the save names it, with the chests they spawn
const {
  puzzleChestPlaces,
  puzzleSeelies,
  settledSeelieIds,
  shrineMarkers,
  solvedPuzzleIds,
  stepWorldPuzzles,
  strikeWorldPuzzles,
  timeTrialMarkers,
} = useWorldPuzzles({
  monumentPlaces,
  savedSettledSeelieIds: savedState.settledSeelieIds,
  savedSolvedPuzzleIds: savedState.solvedPuzzleIds,
  seelies,
  shrinePlaces,
  timeTrialPlaces,
});
// The camps' chest locks as the Enemies component writes them, and each time trial's lock until it is solved
const campLockSources = shallowRef<ChestLockSource[]>([]);
const chestLockSources = computed<ChestLockSource[]>(() => [
  ...campLockSources.value,
  ...timeTrialMarkers.map(({ id, position }) => ({ isDone: solvedPuzzleIds.value.has(id), positions: [position] })),
]);
// Each shut shrine is offered beneath its point while the bag holds a key of its region, and opened with that key
const { openShrineById, shrineInteractables } = useWorldShrines({
  gameText,
  getGroundHeight,
  inventory,
  setInventory,
  shrineKeySources,
  shrineMarkers,
});
// Mondstadt's chests, each unopened one a row to open beneath its point, and opened on the key with the world's random
const { chestInteractables, digChestById, openChestById, worldChestPlaces } = useWorldChests({
  artifactMainAffixPools,
  artifactRarityDataMap,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  inventory,
  lockSources: chestLockSources,
  materialDataMap,
  nameText,
  openedChestIds,
  placeWorldDrops,
  puzzleChestPlaces,
  reliquaryPieceEntryMap,
  reliquarySets,
  setInventory,
  setWallet,
  weaponDataMap: statTables.weaponDataMap,
  wallet,
  waterLevel: windriseData.water.level,
});
// The gadget equipped to the quick-use slot, which Z uses once its cooldown group is ready
const { equippedGadget, gadgetRows, getEquippedGadgetCooldown, isQuickSwapOpen, stepQuickUse } = useWorldGadgets({
  gameDataBaseUrl,
  inventory,
});
// The Frostbearing Tree the bag is offered to, whose levels are read from the game's table as it is offered to, and
// Whose rewards the bag has no room for drop at the tree
// The statues' Oculi and resonances, which pay their levels as the bag's offers do
const { collectOculus, resonateStatue } = useWorldStatues({
  events,
  foundOculusIds,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  inventory,
  materialDataMap,
  nameText,
  placeWorldDrops,
  regionStatueProgressMap,
  setInventory,
  setWallet,
  wallet,
});
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
// The regions whose statues the Traveler resonated with, which give its element and, once Welkin Moon's Homecoming is
// Done, its bonuses. The unlocked landmarks, which hold the resonances, set them again as they change, below the map
const resonatedRegionIds = shallowRef(getResonatedRegionIds(savedState.unlockedLandmarkIds));
// The Restorative Power the Statue's Blessing holds, full to the statues resonated with. The save holds no pool, so it is kept for the session
const restorativePower = shallowRef<RestorativePower>({
  amount: RESTORATIVE_POWER_PER_STATUE * resonatedRegionIds.value.length,
  changedAt: getWorldNow(),
});
const travelerElement = computed(() => computeTravelerElement(resonatedRegionIds.value));
const travelerBonusLines = computed(() =>
  getTravelerElementBonusLines(resonatedRegionIds.value, finishedMainQuestIds.value.has(TRAVELER_BONUS_QUEST_ID)),
);
// The bonus lines the Spiral Abyss's chamber gives the whole party, held here as the combat and the chamber both read them
const abyssBonusLines = shallowRef<AttributeLine[]>([]);
// The party, the characters, the enemies and the kit's effects, which a defeat places drops among and a team's fall revives
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
const characterIdConstellationsMap = computed(() => getCharacterIdConstellationsMap(constellationKits.value));
const {
  characterIdSkillGlyphsMap,
  characters,
  chargeParty,
  clearKitEffects,
  coldDamageParty,
  defeatEnemy,
  hudMember,
  kitContext,
  locomotion,
  party,
  respawnParty,
  reviveFallenParty,
  strikeParty,
} = useWorldCombat({
  characterIdConstellationsMap,
  enemyTables,
  events,
  gameDataBaseUrl,
  onPartyDown: () => {
    // A domain's challenge ends in the party's fall: the team revives, and the leave to the entrance comes after the revive's
    // Jump to the nearest waypoint, so the entrance is where the player lands
    if (!domainArena.value) {
      screenKind.value = ScreenKind.GameOver;
      return;
    }
    reviveFallenParty();
    stepDomainChallenge({ deltaMilliseconds: 0, isPlaying: false, partyDown: true });
  },
  onPartyRevived: () => {
    const nearestWaypoint = findNearestTeleportWaypoint(unlockedLandmarks.value, characterBody.position);
    if (nearestWaypoint) jumpTo(computeJumpPose(nearestWaypoint));
  },
  partyBonusLines: abyssBonusLines,
  placeWorldDrops,
  savedCharacters: savedState.characters,
  savedParty: savedState.party,
  startingCharacterIdKitMap,
  statTables,
  travelerBonusLines,
  travelerElement,
  wildlifePlaces,
});
// The rewards each quest's finish pays into the bag, the wallet, the deployed team and the rank, as it finishes
const { grantRewards } = useWorldQuestRewards({
  characters,
  events,
  gainAdventureExp: gainWorldAdventureExp,
  getDeployedCharacterIds: () => getDeployedCharacterIds(party),
  getMaxLevel: (character) =>
    statTables.characterDataMap.get(character.id)?.ascensionPhases[character.ascension]?.maxLevel ?? 0,
  inventory,
  materialDataMap,
  names: nameText,
  setCharacters: (nextCharacters) => {
    characters.value = nextCharacters;
  },
  setInventory,
  setWallet,
  wallet,
});
// The dishes' uses, read as the world starts. A food the bag uses is eaten by the character on the field, through its use
const { dishUseMap } = useWorldDishes(gameDataBaseUrl);
// The cooking recipes and the stove's place as the world starts. A used stove opens the cooking screen on a recipe, which
// Is held here while the screen is open
const { cookingRecipes, cookingStovePlace, cookingTalents, instructionRecipeMap, processingRecipes } =
  useWorldCooking(gameDataBaseUrl);
const { blacksmithPlace, forgeRecipes } = useWorldForging(gameDataBaseUrl);
const { friendshipLevels, friendshipNamecards } = useWorldFriendship(gameDataBaseUrl);
// The claims a commission makes with the points held, from the handbook's Commissions tab
const { canConvertLongTermPoint, claimCommission, claimKatheryneBonus, convertLongTermPoint } =
  useWorldCommissionClaims({
    adventureExp,
    adventureRankTables,
    characters,
    commissionDay,
    commissionSlice,
    completedMainQuestIds,
    encounterPoints,
    friendshipLevels,
    getWorldNow,
    inventory,
    longTermEncounterPoints,
    materialDataMap,
    names: nameText,
    party,
    rank,
    setCharacters: (nextCharacters) => {
      characters.value = nextCharacters;
    },
    setInventory,
    setWallet,
    wallet,
  });
// The namecards the profile holds, read from the Friendship and the achievements each time, each named in the reader's language
const profileNamecards = computed(() =>
  computeProfileNamecardItemIds({
    achievements: achievementData.value?.achievements ?? [],
    categories: achievementData.value?.categories ?? [],
    characters: characters.value,
    friendshipLevels: friendshipLevels.value,
    friendshipNamecards: friendshipNamecards.value,
    progressMap: achievementProgressMap.value,
  })
    .filter((itemId) => materialDataMap.has(itemId))
    .map((itemId) => ({ itemId, name: getItemDefinition(itemId, nameText, materialDataMap).name })),
);
// The forge's state for this session: the save holds no forge slice, so a reload empties it, and its clock is read again each
// Interval while the forge screen is open so its queues' time left moves
const forgeAmount = ref(1);
const forgeDefinitions = computed(() => computeForgeDefinitions(forgeRecipes.value, materialDataMap, nameText));
const forgeNow = shallowRef(getWorldNow());
const forgeProgress = shallowRef(createForgeProgress(getWorldNow()));
const forgeRecipeId = ref(FIRST_FORGE_RECIPE_ID);
const forgeTab = ref(ForgeTab.Materials);
const forgeWeapons = computed(() => computeForgeWeapons(forgeRecipes.value, statTables.weaponDataMap, nameText));
useIntervalFn(() => {
  if (screenKind.value === ScreenKind.Forge) forgeNow.value = getWorldNow();
}, FORGE_CLOCK_INTERVAL_MS);
const cookingRecipe = shallowRef<CookingRecipe>();
// The dishes the cook knows at the stove, the one on the screen being the first of them when it opens
const openCookingRecipes = shallowRef<CookingRecipe[]>([]);
const useBagEntry = (entryId: number) => {
  const use = useInventoryEntry(inventory.value, entryId, {
    cookingProgress: cookingProgress.value,
    dishUseMap: dishUseMap.value,
    eaterId: getActiveCharacterId(party),
    getMaxHealth: (characterId) => kitContext.characterIdCombatantMap.get(characterId)?.attributes.maxHealth ?? 0,
    instructionRecipeMap: instructionRecipeMap.value,
    kitEffectState: kitContext.kitEffectState,
    now: getWorldNow(),
    party,
    wallet: wallet.value,
  });
  if (!use) return;
  setInventory(use.inventory);
  if (use.wallet) setWallet(use.wallet);
  if (use.cookingProgress) cookingProgress.value = use.cookingProgress;
};
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
const shopId = shallowRef(0);
const shopPurchases = shallowRef<ShopPurchase[]>(savedState.shopPurchases);
// The Spiral Abyss on the world: its entry, its chambers in the arena beside the entrance, and the Benediction a Corridor chamber offers
const {
  abyssBlessing,
  abyssCamps,
  abyssChoices,
  abyssFloorsOffered,
  abyssProgressMap,
  chooseAbyssBenediction,
  enterAbyssChamber,
  openAbyssEntrance,
  stepAbyss,
} = useWorldSpiralAbyss({
  areaId: findAreaAt(catalogue, ABYSS_ENTRANCE_POSITION.x, ABYSS_ENTRANCE_POSITION.z)?.id ?? "",
  bonusLines: abyssBonusLines,
  events,
  gameDataBaseUrl,
  getWorldNow,
  inventory,
  materialDataMap,
  nameText,
  party,
  savedProgressMap: savedState.spiralAbyssProgressMap,
  setInventory,
  setWallet,
  wallet,
});
// The expeditions out from the Adventurers' Guild, held for the session, so a reload empties them
const expeditions = shallowRef<Expedition[]>([]);
const reputationLevel = shallowRef(reputation.value.level);
// The request the keeper offers as her screen opens, drawn from the requests the world carries that the player has not
// Started, and not kept with the save: a provisional rule until the weekly refresh is read
const reputationOffer = shallowRef<ReputationRequest>();
const reputationOfferTitle = computed(() => {
  const quest = reputationOffer.value && quests.value.find(({ id }) => id === String(reputationOffer.value?.questId));
  return quest ? questTextMap.value[quest.titleTextId] : undefined;
});
const drawReputationOffer = () => {
  if (!reputationCity.value) return;
  const offerableQuestIds = ReputationRequestQuestIds.filter((questId) => !questProgressMap.value.has(questId));
  reputationOffer.value = offerReputationRequest(
    reputationCity.value,
    reputation.value.level,
    Math.random(),
    offerableQuestIds,
  );
};
// Accepting the offer starts its quest, which the world then runs as any other
const acceptReputationOffer = () => {
  if (!reputationOffer.value) return;
  acceptQuest(String(reputationOffer.value.questId));
  reputationOffer.value = undefined;
};
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => readMondstadtReputation(gameDataBaseUrl)).match(
  (city) => {
    reputationCity.value = city;
  },
  (error) => {
    console.error(error);
  },
);
// The Oculi of the region published, read as the world starts. Those not yet found are stood in, a touch within the
// Touch radius finds one, and those near the camera within the minimap's distance are marked on it
const oculusPlaces = shallowRef<OculusPlace[]>([]);
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => readOculusPlaces(gameDataBaseUrl, `oculi/${OCULUS_REGION_ID}`)).match(
  (places) => {
    oculusPlaces.value = places;
  },
  (error) => {
    console.error(error);
  },
);
// The doings the world places, each counted toward the area its point stands in: the chests, the Oculi, the puzzles' marks
// And Seelies at their courts, and the camps the save records as cleared
const placedDoings = computed<PlacedDoing[]>(() => [
  ...worldChestPlaces.value.map(({ id, position }) => ({ id, kind: ExplorationKind.Chest, position })),
  ...oculusPlaces.value.map(({ id, position }) => ({ id, kind: ExplorationKind.Oculus, position })),
  ...[...monumentPlaces.filter(({ monument }) => monument !== undefined), ...timeTrialPlaces].map(
    ({ id, position }) => ({ id, kind: ExplorationKind.Puzzle, position }),
  ),
  ...puzzleSeelies.map(({ court, id }) => ({ id, kind: ExplorationKind.Puzzle, position: court })),
  ...clearedCamps.value.map(({ id, position }) => ({ id, kind: ExplorationKind.Camp, position })),
]);
// The doings the save records as done, by id: the chests opened, the Oculi found, the puzzles and Seelies settled, and
// The camps cleared
const recordedDoingIds = computed<ReadonlySet<string>>(
  () =>
    new Set([
      ...openedChestIds.value,
      ...foundOculusIds.value,
      ...solvedPuzzleIds.value,
      ...settledSeelieIds.value,
      ...clearedCamps.value.map(({ id }) => id),
    ]),
);
// The landmarks the world holds and the ones the player has unlocked, which a jump lands at and the first unlock pays
const {
  activateLandmark,
  explorationAreas,
  jumpLandmarks,
  jumpPose,
  jumpTo,
  lockedJumpLandmarks,
  unlockedLandmarkIds,
  unlockedLandmarks,
} = useWorldMap({
  catalogue,
  completedMainQuestIds,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  placedDoings,
  questStepTargets,
  recordedDoingIds,
  regionDataBaseUrl,
  reputation,
  setReputation: (nextReputation) => {
    reputation.value = nextReputation;
  },
  setWallet,
  unlockedLandmarkIds: savedState.unlockedLandmarkIds,
  wallet,
});
watch(unlockedLandmarkIds, (landmarkIds) => {
  resonatedRegionIds.value = getResonatedRegionIds(landmarkIds);
});
// The Companionship EXP, the day's commissions, the statues, the solved puzzles, the realm's placements and the
// Traveler's name no source changes yet, so they are carried as they were saved
useWorldSaveSync({
  emitSave: (newSave) => emit("save", newSave),
  getSaveState: () => ({
    achievementProgressMap: achievementProgressMap.value,
    adventureExp: adventureExp.value,
    adventureRankRewardsClaimed: adventureRankRewardsClaimed.value,
    archiveKillsMap: archiveKillsMap.value,
    archiveProgressMap: archiveProgressMap.value,
    characterCopyCountMap: characterCopyCountMap.value,
    characters: characters.value,
    characterTrialClaimedStageIds: savedState.characterTrialClaimedStageIds,
    clearedCamps: clearedCamps.value,
    clearedDomainIds: clearedDomainIds.value,
    commissionDay: commissionDay.value,
    companionshipExpMap: savedState.companionshipExpMap,
    cookingProgress: cookingProgress.value,
    craftedCountMap: craftedCountMap.value,
    craftingProgress: craftingProgress.value,
    encounterPoints: encounterPoints.value,
    longTermEncounterPoints: longTermEncounterPoints.value,
    enemyRespawnMap: enemyRespawnMap.value,
    foundOculusIds: foundOculusIds.value,
    frostbearingTreeProgress: frostbearingTreeProgress.value,
    homePlacements: savedState.homePlacements,
    inventory: inventory.value,
    mails: mails.value,
    namecardItemId: namecardItemId.value,
    openedChestIds: openedChestIds.value,
    party,
    processingJobs: processingJobs.value,
    quests: questProgressMap.value,
    regionStatueProgressMap: regionStatueProgressMap.value,
    reputation: reputation.value,
    settledSeelieIds: settledSeelieIds.value,
    shopPurchases: shopPurchases.value,
    shownTipIds: shownTipIds.value,
    spiralAbyssProgressMap: abyssProgressMap.value,
    solvedPuzzleIds: solvedPuzzleIds.value,
    travelerBirthday: savedState.travelerBirthday,
    travelerName: savedState.travelerName,
    unlockedLandmarkIds: unlockedLandmarkIds.value,
    wallet: wallet.value,
    wishHistory: wishHistory.value,
    wishPityMap: wishPityMap.value,
    worldLevelAdjustment: worldLevelAdjustment.value,
  }),
});
// The roster the expedition picker lists in the game's order, each named by the game's text, and the characters down,
// Whom no expedition is sent with
const expeditionCharacters = computed(() =>
  characters.value.map(({ id }) => ({
    id,
    name: nameText[statTables.characterDataMap.get(id)?.nameTextId ?? ""] || "",
  })),
);
// Each character's passives it has unlocked at its ascension, by their proud skill groups, which the expedition talents are
// Read from. A character with no talent kit has none
const characterPassiveGroupIdMap = computed(
  () =>
    new Map(
      characters.value.map(
        ({ ascension, id }) =>
          [
            id,
            new Set(
              (characterTalentKits.find((kit) => kit.characterId === id)?.passives ?? [])
                .filter(({ phase }) => phase <= ascension)
                .map(({ proudSkillGroupId }) => proudSkillGroupId),
            ),
          ] as const,
      ),
    ),
);
const downCharacterIds = computed(
  () => new Set(characters.value.filter(({ id }) => checkIsCharacterDown(party, id)).map(({ id }) => id)),
);
// The party's crafters, each named by the game's text, and the one on the field, who is picked as the bench opens
const crafting = computed(() =>
  computeCraftingCrafters(
    getDeployedCharacterIds(party),
    getActiveCharacterId(party),
    (characterId) => nameText[statTables.characterDataMap.get(characterId)?.nameTextId ?? ""] || "",
  ),
);
// The ley line outcrops the world draws: a touch starts a blossom's fight, a camp's last enemy reveals it, and F claims it
// With resin, and each day's are drawn at the daily reset
// The places of the outcrop region, which its loaded data holds, and none while the region is not loaded
const outcropPlaces = computed(() => windrise.value?.regionDataMap.get(OUTCROP_REGION_ID)?.outcropPlaces ?? []);
// The mining outcrops of each region the world has loaded, drawn at the daily reset and struck as the ores are
const { refreshMiningOutcrops, standingMiningOutcrops, strikeMiningOutcrops } = useMiningOutcrops({
  breakOre,
  gameDataBaseUrl,
  getWorldNow,
  rank,
  regionIds: computed(() => [...(windrise.value?.regionDataMap.keys() ?? [])]),
});
const {
  chooseOutcropClaim,
  claimPrompt,
  closeOutcropClaim,
  drawDayOutcrops,
  openOutcropClaim,
  outcropCamps,
  outcropInteractables,
  restoreOutcropClaim,
  touchOutcropsNear,
} = useWorldOutcrops({
  adventureExp,
  adventureRankTables,
  areaId: ref(OUTCROP_REGION_ID),
  characters,
  completedMainQuestIds,
  enemyMap: kitContext.enemyMap,
  events,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  inventory,
  materialDataMap,
  nameText,
  party,
  placements: outcropPlaces,
  rank,
  regionStatueProgressMap,
  setInventory,
  setWallet,
  wallet,
});
// The Trounce Blossoms a defeated normal boss leaves, claimed at its place by F for the Original Resin its claim costs
const {
  chooseTrounceBlossomClaim,
  claimPrompt: trounceClaimPrompt,
  closeTrounceBlossomClaim,
  forgetTrounceBlossom,
  lastTeleportAt,
  openTrounceBlossomClaim,
  trounceBlossomInteractables,
  trounceBlossoms,
} = useWorldTrounceBlossoms({
  adventureExp,
  adventureRankTables,
  characters,
  completedMainQuestIds,
  enemyKindMap: enemyTables.enemyKindMap,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  getWorldNow,
  inventory,
  materialDataMap,
  nameText,
  party,
  setInventory,
  setWallet,
  wallet,
});
// What the character can act on in the world: each drop, named by its item, each resident of the regions in reach
// Whose talk the world holds, named by its text, each locked jump landmark, a domain entrance among them, which it
// Resonates with, and the Crafting bench, named by its title. Each stands on the ground beneath its point
const {
  chooseDomainTreeClaim,
  claimWeeklyBossFirstClearReward,
  closeDomainTreeClaim,
  domainArena,
  domainCamps,
  domainClaimOffers,
  domainEntrance,
  domainLevelRows,
  enterDomain,
  isDomainTreeRaised,
  leaveDomain,
  openDomain,
  openDomainTreeClaim,
  quickChallengeDomain,
  stepDomainChallenge,
  unlockedDomainEntrances,
} = useWorldDomains({
  adventureExp,
  adventureRankTables,
  artifactMainAffixPools,
  artifactRarityDataMap,
  clearedDomainIds,
  completedMainQuestIds,
  events,
  gameDataBaseUrl,
  getWorldNow,
  inventory,
  jumpTo,
  materialDataMap,
  nameText,
  kitEffectState: kitContext.kitEffectState,
  party,
  random: () => kitContext.random(),
  rank,
  reliquaryPieceEntryMap,
  reliquarySets,
  setInventory,
  setWallet,
  unlockedLandmarks,
  weaponDataMap: statTables.weaponDataMap,
  wallet,
});
// The enemies in the world are the ley line outcrops' fighting camps and the domain challenge's camp
const fightingCamps = computed(() => [...outcropCamps.value, ...domainCamps.value, ...abyssCamps.value]);
// The arena's leave prompt, and the Petrified Tree's prompt once a clear has raised it, both beside the arena's centre
const domainArenaInteractables = computed<Interactable[]>(() => {
  if (!domainArena.value) return [];
  const { x, z } = domainArena.value.center;
  const y = getGroundHeight(x, z);
  return [
    {
      id: DOMAIN_LEAVE_INTERACTABLE_ID,
      kind: InteractionKind.Activate,
      name: gameText[GameTextKey.DomainLeave],
      position: { x: x - DOMAIN_ARENA_PROMPT_OFFSET, y, z },
    },
    ...(isDomainTreeRaised.value
      ? [
          {
            id: DOMAIN_TREE_INTERACTABLE_ID,
            kind: InteractionKind.Activate,
            name: gameText[GameTextKey.PetrifiedTree],
            position: { x: x + DOMAIN_ARENA_PROMPT_OFFSET, y, z },
          },
        ]
      : []),
  ];
});
const interactables = computed<Interactable[]>(() => {
  if (homeRealmVisit.value) return computeHomeRealmInteractables(gameText);
  // Each Frostbearing Tree is named by its game text and offered to on the key, so its row is an activation like a statue's
  // The Spiral Abyss's entrance is offered on the key as the Moon Spire's, standing provisionally at the centre of Cape Oath
  const { x: abyssX, z: abyssZ } = ABYSS_ENTRANCE_POSITION;
  const abyssEntrance: Interactable = {
    id: ABYSS_ENTRANCE_INTERACTABLE_ID,
    kind: InteractionKind.Activate,
    name: gameText[GameTextKey.AbyssMoonSpire],
    position: { x: abyssX, y: getGroundHeight(abyssX, abyssZ), z: abyssZ },
  };
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
    ...shrineInteractables.value,
    ...outcropInteractables.value,
    ...trounceBlossomInteractables.value,
    ...frostbearingTrees,
    abyssEntrance,
    ...computeStatueInteractables(unlockedLandmarks.value, gameText[GameTextKey.StatueBlessing], getGroundHeight),
    ...lockedJumpLandmarks.value.map((landmark) =>
      toLandmarkInteractable(landmark, computeJumpLandmarkTextKey(landmark)),
    ),
    // An unlocked domain entrance is entered on the key, its screen opened with its levels
    ...unlockedDomainEntrances.value.map((landmark) => toLandmarkInteractable(landmark, GameTextKey.DomainEnter)),
    ...domainArenaInteractables.value,
    ...computeCraftingBenchInteractables(craftingBenchPlace, gameText[GameTextKey.CraftingTitle], getGroundHeight),
    ...computeCookingStoveInteractables(
      cookingStovePlace.value,
      { cooking: gameText[GameTextKey.CookingTitle], processing: gameText[GameTextKey.ProcessingStart] },
      getGroundHeight,
    ),
    ...computeForgeInteractables(blacksmithPlace.value, gameText[GameTextKey.ForgeTitle], getGroundHeight),
    ...computeFishingInteractables(fishingPointPlaces.value, isFishingOpen.value, gameText, getGroundHeight),
    computeHomePotInteractable(gameText, getGroundHeight),
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
// A level entered from a domain's screen leaves the screen for the world, where its challenge begins at the stand-in arena
const enterDomainLevel = (dungeonId: number) => {
  screenKind.value = ScreenKind.World;
  enterDomain(dungeonId);
};
// The Domains tab lists every domain entrance the map has, the locked and the unlocked alike, each with what the player can do
const handbookDomains = computed(() =>
  toHandbookDomains(
    jumpLandmarks.value.filter(
      (landmark): landmark is DomainEntranceLandmark => landmark.kind === LandmarkKind.DomainEntrance,
    ),
    {
      adventureRank: rank.value,
      clearedDomainIds: clearedDomainIds.value,
      completedMainQuestIds: completedMainQuestIds.value,
      unlockedLandmarkIds: new Set(unlockedLandmarks.value.map(({ id }) => id)),
    },
  ),
);
// A locked weekly boss is challenged from the handbook. Its quick challenge enters the domain at the tier the rank reaches
// And the world opens once that fight has started
const challengeWeeklyBoss = async (landmark: DomainEntranceLandmark) => {
  const isEntered = await quickChallengeDomain(
    landmark,
    rank.value,
    !checkIsWeeklyBossEntryOpen(landmark.entryId, completedMainQuestIds.value),
  );
  if (isEntered) screenKind.value = ScreenKind.World;
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
// Entering combat returns the camera to its default distance, keeping the look it has
events.on("enterCombat", () => character.value?.returnToDefaultDistance());
// Whether the backslash has hidden the HUD, as the game's Hide UI does, apart from the screens that hide it
const isHudHidden = ref(false);
// Whether the HUD is drawn over the world, which a reference's held camera, a witness render, the pause and the screens
// That hide it all keep off
const isHudShown = computed(
  () => !cameraPose && !witness && !isPaused && !isHudHidden.value && !screenBehaviour.value.isHudHidden,
);
// The shortcut wheel is open while its key is held in the world: the move points at an entry, and letting the key go
// Opens that entry's screen
const shortcutWheelDirectionCount = ShortcutWheelDirectionCount.Eight;
const isShortcutWheelOpen = ref(false);
const shortcutWheelPickedIndex = ref<number>();
let shortcutWheelStep: ShortcutWheelStep = {
  isOpen: false,
  move: { x: 0, y: 0 },
  openedScreenKind: undefined,
  pickedIndex: undefined,
};
const stepShortcutWheel = (isHeld: boolean, x: number, y: number): void => {
  shortcutWheelStep = getShortcutWheelStep(shortcutWheelStep, isHeld, { x, y }, shortcutWheelDirectionCount);
  isShortcutWheelOpen.value = shortcutWheelStep.isOpen;
  shortcutWheelPickedIndex.value = shortcutWheelStep.pickedIndex;
  if (shortcutWheelStep.openedScreenKind !== undefined) screenKind.value = shortcutWheelStep.openedScreenKind;
};
// Whether the device's main pointer is a finger, which the HUD draws the touch layout for
const isTouch = useMediaQuery("(pointer: coarse)");
// The character's ground point in world metres, the yaw the view faces and the yaw the character faces, for the map and
// The minimap, read each frame and handed on only when one moved, so a still player re-renders nothing
const mapCamera = shallowRef<MapCamera>({ facing: 0, x: 0, yaw: 0, z: 0 });
const unfoundOculusPlaces = computed(() => oculusPlaces.value.filter(({ id }) => !foundOculusIds.value.has(id)));
const nearOculusPlaces = computed(() =>
  getNearOculusPlaces(oculusPlaces.value, foundOculusIds.value, mapCamera.value, OCULUS_MINIMAP_DISTANCE),
);
// The unfound Oculus the body is touching, if it is touching one, which the frame collects
const findTouchedOculus = () =>
  getNearOculusPlaces(oculusPlaces.value, foundOculusIds.value, characterBody.position, OCULUS_TOUCH_RADIUS)[0];
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
// The locomotion phase of the character on the field, which Windrise's Sheer Cold gauge reads its swimming off
// The character on the field's locomotion and max HP, which the sheer cold gauge reads each frame
const getCharacter = () => {
  const phase = character.value?.phase;
  const maxHealth = kitContext.characterIdCombatantMap.get(getActiveCharacterId(party))?.attributes.maxHealth;
  return phase && maxHealth !== undefined ? { maxHealth, phase } : undefined;
};
const getAntiColdRatio = () => getTeamAntiColdRatio(kitContext.kitEffectState.effects);
// What the HUD's pieces read each frame. The stamina meter's pivot is projected only while the pool is spent or
// Refilling, and once it is full the meter fades out where it stood
const hudFrame = reactive<HudFrame>({
  gadgetCooldown: 0,
  pivotX: 0,
  pivotY: 0,
  seconds: 0,
  sheerCold: 0,
  stamina: STAMINA_MAX,
});
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
          if (!isPaused)
            screenKind = getNextScreenKind(
              screenKind,
              inputState.pressedActions,
              checkIsSpecialStoryModeActive(questsInProgress, questProgressMap),
            );
          if (!isPaused && screenKind === ScreenKind.World)
            stepShortcutWheel(
              inputState.heldActions.has(InputAction.OpenShortcutWheel),
              inputState.moveRight,
              -inputState.moveForward,
            );
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
          if (!isPaused && screenKind === ScreenKind.World) drawDayOutcrops(getWorldNow(), kitContext.random);
          const transitionAttacks = stepDomainChallenge({
            deltaMilliseconds: context.delta,
            isPlaying: !isPaused && screenKind === ScreenKind.World && domainClaimOffers === undefined,
            partyDown: false,
          });
          stepAbyss({
            deltaMilliseconds: context.delta,
            isPlaying: !isPaused && screenKind === ScreenKind.World && abyssChoices === undefined,
            partyDown: false,
          });
          if (!isPaused && screenKind === ScreenKind.World) refreshMiningOutcrops(getWorldNow(), kitContext.random);
          // Each attack a phase's end names starts on whichever boss makes it, and a name no boss makes starts nothing
          for (const attack of transitionAttacks)
            for (const enemy of kitContext.enemyMap.values())
              startBossMove(enemy, BossMovesMap[enemy.enemyKindId] ?? [], attack);
          if (!isPaused && screenKind === ScreenKind.World)
            touchOutcropsNear(characterBody.position.x, characterBody.position.z, kitContext.random);
          if (!isPaused && screenKind === ScreenKind.Fishing)
            stepFishing({
              isReeling: inputState.heldActions.has(InputAction.NormalAttack),
              isStruck: inputState.pressedActions.has(InputAction.NormalAttack),
              seconds: context.delta,
            });
          if (inputState.pressedActions.has(InputAction.ShowCursor)) showCursor();
          stepQuickUse({
            isActive: !isPaused && screenKind === ScreenKind.World,
            isHeld:
              inputState.heldActions.has(InputAction.QuickUseGadget) ||
              inputState.pressedActions.has(InputAction.QuickUseGadget),
            now: getWorldNow(),
            seconds: context.delta,
          });
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
            const touchedOculus = findTouchedOculus();
            if (touchedOculus) collectOculus(OCULUS_REGION_ID, touchedOculus);
            const worldDrop = worldDrops.find(({ id }) => id === interactable?.id);
            const materialSource = materialSources.find(({ id }) => id === interactable?.id);
            const frostbearingTreePlace = frostbearingTreePlaces.find(({ id }) => id === interactable?.id);
            const domainEntranceLandmark = unlockedDomainEntrances.find(({ id }) => id === interactable?.id);
            if (interactable?.kind === InteractionKind.PickUp && worldDrop) pickUpWorldDrop(worldDrop);
            else if (interactable?.kind === InteractionKind.PickUp && materialSource)
              pickUpMaterialSourcePlace(materialSource.id);
            else if (interactable?.kind === InteractionKind.PickUp) pickUpGatheringPlace(interactable.id);
            else if (
              interactable?.kind === InteractionKind.Open &&
              shrineMarkers.some(({ id }) => id === interactable.id)
            )
              openShrineById(interactable.id);
            else if (interactable?.kind === InteractionKind.Open) openChestById(interactable.id, kitContext.random);
            else if (interactable?.kind === InteractionKind.Claim && trounceBlossoms.has(interactable.id))
              openTrounceBlossomClaim(interactable.id, getWorldNow());
            else if (interactable?.kind === InteractionKind.Claim)
              openOutcropClaim(Number(interactable.id), getWorldNow());
            else if (interactable?.kind === InteractionKind.Dig) digChestById(interactable.id);
            else if (interactable?.kind === InteractionKind.Activate && frostbearingTreePlace)
              offerFrostbearingTree(frostbearingTreePlace);
            else if (
              interactable?.kind === InteractionKind.Activate &&
              interactable.id === COOKING_STOVE_INTERACTABLE_ID
            ) {
              openCookingRecipes = listOpenCookingRecipes(cookingRecipes, cookingProgress);
              cookingRecipe = openCookingRecipes[0];
              if (cookingRecipe) screenKind = ScreenKind.Cooking;
            } else if (
              interactable?.kind === InteractionKind.Activate &&
              interactable.id === COOKING_PROCESSING_INTERACTABLE_ID
            ) {
              screenKind = ScreenKind.Processing;
            } else if (interactable?.kind === InteractionKind.Activate && unlockedLandmarkIds.has(interactable.id)) {
              screenKind = ScreenKind.Blessing;
            } else if (
              interactable?.kind === InteractionKind.Activate &&
              interactable.id === DOMAIN_LEAVE_INTERACTABLE_ID
            ) {
              screenKind = ScreenKind.Domain;
            } else if (
              interactable?.kind === InteractionKind.Activate &&
              interactable.id === DOMAIN_TREE_INTERACTABLE_ID
            ) {
              openDomainTreeClaim(getWorldNow());
            } else if (interactable?.kind === InteractionKind.Activate && domainEntranceLandmark) {
              openDomain(domainEntranceLandmark);
              screenKind = ScreenKind.Domain;
            } else if (
              interactable?.kind === InteractionKind.Activate &&
              interactable.id === ABYSS_ENTRANCE_INTERACTABLE_ID
            ) {
              openAbyssEntrance();
              screenKind = ScreenKind.SpiralAbyss;
            } else if (
              interactable?.kind === InteractionKind.Activate &&
              interactable.id === String(HOME_POT_GADGET_ID)
            ) {
              if (homeRealmVisit) {
                jumpTo(leaveHomeRealm(homeRealmVisit).pose);
                homeRealmVisit = undefined;
              } else {
                homeRealmVisit = computeHomeRealmVisit(
                  { position: characterBody.position, yaw: characterBody.rotation.y },
                  getGroundHeight(characterBody.position.x, characterBody.position.z),
                  HOME_STAND_IN_POT_REGION_ID,
                );
                jumpTo(HOME_REALM_SPAWN);
              }
            } else if (interactable?.kind === InteractionKind.Talk && interactable.id === String(HOME_TUBBY_NPC_ID)) {
              shopId = VendorShopTypeMap[String(HOME_TUBBY_NPC_ID)] ?? 0;
              reputationLevel = reputation.level;
              screenKind = ScreenKind.Shop;
            } else if (interactable?.kind === InteractionKind.Activate) {
              activateLandmark(interactable.id);
              resonateStatue(interactable.id, { id: interactable.id, position: characterBody.position });
            } else if (interactable?.kind === InteractionKind.Use && isFishingPoint(interactable.id)) {
              openFishingPoint(interactable.id);
              screenKind = ScreenKind.Fishing;
            } else if (interactable?.id === FORGE_INTERACTABLE_ID) {
              forgeNow = getWorldNow();
              screenKind = ScreenKind.Forge;
            } else if (interactable?.kind === InteractionKind.Use) {
              screenKind = ScreenKind.Crafting;
            } else if (interactable?.kind === InteractionKind.Talk) {
              talk = talkMap.get(interactable.id);
              talkDuelGameId = getTalkDuelGameId(interactable.id);
              screenKind = getTalkScreenKind(interactable.id, getResidents());
              // Katheryne's talk opens the expedition screen in place of the talk, once she stands in the world
              if (checkIsExpeditionTalk(interactable.id, getResidents())) {
                grantRewards(claimKatheryneRewards());
                claimKatheryneBonus();
                screenKind = ScreenKind.Expedition;
              }
              shopId = getTalkVendorShopId(interactable.id, getResidents()) ?? 0;
              // A Souvenir Shop stays closed until its region's offering is at its last level, a day vendor's outside their hours,
              // And no shop opens before the world's clock is read, so its talk is a dialogue until then
              const gameClockMinutes = windrise?.gameClock.minutes;
              if (
                screenKind === ScreenKind.Shop &&
                (!checkIsVendorShopOpen(shopId, frostbearingTreeProgress.level, frostbearingTreeLevels) ||
                  gameClockMinutes === undefined ||
                  !checkIsVendorHourOpen(shopId, gameClockMinutes))
              )
                screenKind = ScreenKind.Dialogue;
              reputationLevel = reputation.level;
              if (screenKind === ScreenKind.Reputation) drawReputationOffer();
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
          :grass-trail
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
          @party-health-changed="(change) => events.emit('partyHealthChanged', change)"
          @reaction-triggered="(enemy, reactions) => events.emit('reactionTriggered', enemy, reactions)"
          @strike-ore="
            (body, hit) => {
              strikeGatheringOres(body, hit, kitContext.random);
              strikeMiningOutcrops(body, hit, kitContext.random);
            }
          "
          @strike-puzzle="(body, hit) => strikeWorldPuzzles(body, hit)"
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
        v-if="!homeRealmVisit"
        ref="windrise"
        :last-teleport-at
        :trounce-blossoms
        :jump-pose="jumpPose"
        :mining-outcrop-places="standingMiningOutcrops"
        :oculus-places="unfoundOculusPlaces"
        :active-character-id="getActiveCharacterId(party)"
        :catalogue
        :character-body="cameraPose || witness || !locomotion ? undefined : characterBody"
        :character-locomotion="locomotion"
        :get-character="getCharacter"
        :get-anti-cold-ratio="getAntiColdRatio"
        :character-pack-reader="activeCharacterPackReader"
        :create-terrain-worker
        :kit-effect-state="kitContext.kitEffectState"
        :elemental-sight
        :enemy-map="kitContext.enemyMap"
        :enemy-respawn-map
        :enemy-tables
        :grass-trail
        :game-data-base-url
        :get-ground-height
        :get-world-now
        :held-minutes
        :is-held="screenBehaviour.isHeld || undefined"
        :interactables
        :outcrop-camps="fightingCamps"
        :is-paused
        :is-tuning="Boolean(isTuning)"
        :landmark-collider
        :origin
        :quality-tier="worldQualityTier"
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
        @camp-cleared="(camp) => events.emit('campCleared', camp)"
        @camp-locks="(locks) => (campLockSources = locks)"
        @defeat="(enemy, enemyDrops) => defeatEnemy(enemy, enemyDrops)"
        @enter-combat="events.emit('enterCombat')"
        @leave-combat="events.emit('leaveCombat')"
        @shield-break="(enemy) => events.emit('shieldBreak', enemy)"
        @ready="emit('ready')"
        @respawn="(spawnKey) => forgetTrounceBlossom(spawnKey)"
        @save-respawn="(spawnKey, respawnAt) => setEnemyRespawnAt(spawnKey, respawnAt)"
        @sheer-cold="(value) => (hudFrame.sheerCold = value)"
        @cold-damage="(damage) => coldDamageParty(damage)"
        @strike="(enemy, taunt) => strikeParty(enemy, taunt)"
      />
      <WorldRealm v-else />
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
    <!-- The shortcut wheel drawn over the world while its key is held, its entries and their pick from the move -->
    <div v-if="isShortcutWheelOpen" class="shortcut-wheel">
      <HudShortcutWheel
        :direction-count="shortcutWheelDirectionCount"
        :game-text="gameText"
        :picked-index="shortcutWheelPickedIndex"
      />
    </div>
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
      :near-oculus-places
      :member="hudMember"
      :name-text-map="nameText"
      :party
      :quest-mark
      :quest-progress="trackerQuest && questProgressMap.get(trackerQuest.id)"
      :quest-text-map
      :quick-swap-open="isQuickSwapOpen"
      :tracked-quest="trackerQuest"
      :traveler-name="savedState.travelerName"
      @map="screenKind = ScreenKind.Map"
      @menu="screenKind = ScreenKind.PaimonMenu"
    >
      <template #prompts>
        <InteractionPromptList :interaction-prompts :is-touch @press="(id) => pressInteractable(id)" />
        <TipPopup
          v-if="showingTip"
          :game-text="gameText"
          :subtitle="tipText[showingTip.subtitleTextId] || ''"
          :title="tipText[showingTip.titleTextId] || ''"
          @close="closeTip"
        />
        <OfferChoice
          v-if="claimPrompt"
          :cancel-label="gameText[GameTextKey.Cancel]"
          :can-restore="claimPrompt.canRestore"
          :condensed-label="gameText[GameTextKey.UseCondensedResin]"
          :offers="claimPrompt.offers"
          :original-label="gameText[GameTextKey.UseOriginalResin]"
          :restore-label="gameText[GameTextKey.FragileResinRestore]"
          @choose="(offer) => chooseOutcropClaim(offer, getWorldNow(), worldLevel, kitContext.random)"
          @close="closeOutcropClaim()"
          @restore="restoreOutcropClaim(getWorldNow())"
        />
        <OfferChoice
          v-if="trounceClaimPrompt"
          :cancel-label="gameText[GameTextKey.Cancel]"
          :condensed-label="gameText[GameTextKey.UseCondensedResin]"
          :offers="trounceClaimPrompt.offers"
          :original-label="gameText[GameTextKey.UseOriginalResin]"
          @choose="() => chooseTrounceBlossomClaim(getWorldNow(), worldLevel, kitContext.random)"
          @close="closeTrounceBlossomClaim()"
        />
        <OfferChoice
          v-if="domainClaimOffers"
          :cancel-label="gameText[GameTextKey.Cancel]"
          :condensed-label="gameText[GameTextKey.UseCondensedResin]"
          :offers="domainClaimOffers"
          :original-label="gameText[GameTextKey.UseOriginalResin]"
          @choose="(offer) => chooseDomainTreeClaim(offer, getWorldNow())"
          @close="closeDomainTreeClaim"
        />
        <p v-if="bagFullHint" class="bag-full-hint">{{ bagFullHint }}</p>
      </template>
    </HudScreen>
    <MenuScreen
      v-model:screen-kind="screenKind"
      :account-avatar-url
      :account-name
      :adventure-exp-progress
      :adventure-rank="rank"
      :game-text
      :is-world-level-adjustable
      :is-world-level-lowered="worldLevelAdjustment.isLowered"
      :namecard-item-id="namecardItemId"
      :namecards="profileNamecards"
      :server-clock-offset-ms
      :world-level
      :world-level-changed-at="worldLevelAdjustment.changedAt"
      @pick-namecard="(itemId) => setNamecardItemId(itemId)"
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
          :recorded-doing-ids
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
      <template v-if="mailData" #[ScreenKind.Mail]>
        <MailScreen
          :birthday-mail-ids="mailData.birthdayMailIds"
          :game-text
          :is-bag-full="isMailBagFull"
          :mail-rows="mailData.mailRows"
          :mails
          :material-data-map="materialDataMap"
          :names="nameText"
          :now="getWorldNow()"
          :text-map="mailData.textMap"
          @claim="(mailId) => claimMail(mailId)"
          @claim-all="claimAllMails()"
          @close="screenKind = ScreenKind.World"
          @read="(mailId) => markMailRead(mailId)"
        />
      </template>
      <template #[ScreenKind.Quests]>
        <QuestScreen
          :game-text
          :quest-chapters
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
          :can-use-long-term-encounter-points="isAdventureEncountersUnlocked && canConvertLongTermPoint"
          :day-commissions="handbookDayCommissions"
          :domains="handbookDomains"
          :encounter-point-limit="encounterPointLimit"
          :encounter-points="wholeEncounterPoints"
          :game-text
          :investigation-rewards="[]"
          :is-adventure-encounters-unlocked="isAdventureEncountersUnlocked"
          :long-term-encounter-points="wholeLongTermEncounterPoints"
          :name-text
          :total-count="0"
          @challenge="challengeWeeklyBoss"
          @claim-commission="(commissionId) => claimCommission(commissionId)"
          @claim-first-clear="claimWeeklyBossFirstClearReward"
          @close="screenKind = ScreenKind.World"
          @use-long-term-encounter-points="convertLongTermPoint()"
        />
      </template>
      <template #[ScreenKind.Character]>
        <CharacterScreen
          v-model:characters="characters"
          v-model:wallet="wallet"
          :active-character-id="getActiveCharacterId(party)"
          :adventure-rank="rank"
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
          :traveler-bonus-lines
          :traveler-element
          @close="screenKind = ScreenKind.World"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
        >
          <template #scene="{ element, tab }">
            <CharacterScene :element :tab />
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
          :cooking-progress
          :dish-use-map
          :game-text
          :gadget-rows
          :initial-category="ItemCategory.Weapon"
          :instruction-recipe-map
          :inventory
          :material-data-map
          :names="nameText"
          :wallet
          @close="screenKind = ScreenKind.World"
          @destroy="(destruction) => applyDestruction(destruction)"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
          @use="(entryId) => useBagEntry(entryId)"
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
      <template #[ScreenKind.PaimonsBargains]>
        <PaimonsBargainsScreen
          v-model:characters="characters"
          v-model:purchases="shopPurchases"
          :adventure-rank="rank"
          :character-data-map="statTables.characterDataMap"
          :game-text
          :goods="shopIdShopGoodMap.get(PAIMON_BARGAINS_SHOP_ID) ?? []"
          :inventory
          :material-data-map
          :name-text
          :rotation="paimonsBargainsRotation"
          :wallet
          :weapon-data-map="statTables.weaponDataMap"
          @close="screenKind = ScreenKind.World"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
          @update:wallet="(nextWallet) => setWallet(nextWallet)"
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
      <template #[ScreenKind.Settings]>
        <MenuSettings
          v-model:settings="settings"
          :default-quality-tier="qualityTier"
          :game-text
          :language
          @close="screenKind = ScreenKind.World"
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
    <GameOverScreen
      v-if="screenKind === ScreenKind.GameOver"
      :revive-label="gameText[GameTextKey.Revive]"
      :title="gameText[GameTextKey.PlayerDieNone]"
      @revive="
        reviveFallenParty();
        screenKind = ScreenKind.World;
      "
    />
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
      :offer-title="reputationOfferTitle"
      :progress="reputation"
      :reputation="reputationCity"
      @accept="acceptReputationOffer"
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
    <StatueScreen
      v-if="screenKind === ScreenKind.Blessing"
      v-model:power="restorativePower"
      :game-text
      :get-max-health="(characterId) => kitContext.characterIdCombatantMap.get(characterId)?.attributes.maxHealth ?? 0"
      :get-name="(characterId) => nameText[statTables.characterDataMap.get(characterId)?.nameTextId ?? ''] || ''"
      :get-now="getWorldNow"
      :party
      :statue-count="resonatedRegionIds.length"
      @close="screenKind = ScreenKind.World"
    />
    <CookingScreen
      v-if="screenKind === ScreenKind.Cooking && cookingRecipe"
      v-model:progress="cookingProgress"
      v-model:recipe="cookingRecipe"
      :avatar-id="getActiveCharacterId(party)"
      :game-text
      :inventory
      :material-data-map
      :name-text
      :random="kitContext.random"
      :recipes="openCookingRecipes"
      :talent="cookingTalents[getActiveCharacterId(party)]"
      @close="screenKind = ScreenKind.World"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
    />
    <ProcessingScreen
      v-if="screenKind === ScreenKind.Processing"
      v-model:jobs="processingJobs"
      :game-text
      :inventory
      :material-data-map
      :name-text
      :now="getWorldNow"
      :recipes="processingRecipes"
      @close="screenKind = ScreenKind.World"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
    />
    <FishingScreen v-if="screenKind === ScreenKind.Fishing" :view="castView" />
    <DomainScreen
      v-if="screenKind === ScreenKind.Domain"
      :game-text
      :is-in-domain="domainArena !== undefined"
      :levels="domainLevelRows"
      @close="screenKind = ScreenKind.World"
      @enter="enterDomainLevel"
      @leave="
        leaveDomain();
        screenKind = ScreenKind.World;
      "
    />
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
      @achievement-events="(achievementEvents) => events.emit('achievementEvents', achievementEvents)"
      @close="screenKind = ScreenKind.World"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
      @update:wallet="(nextWallet) => setWallet(nextWallet)"
    />
    <SpiralAbyssEntryScreen
      v-if="screenKind === ScreenKind.SpiralAbyss"
      :blessing="abyssBlessing"
      :floors="abyssFloorsOffered"
      :game-text
      :name-text
      @choose="
        (floorId, chamberId) => {
          enterAbyssChamber(floorId, chamberId);
          screenKind = ScreenKind.World;
        }
      "
      @close="screenKind = ScreenKind.World"
    />
    <SpiralAbyssBenediction
      v-if="abyssChoices"
      :choices="abyssChoices"
      :game-text
      :name-text
      @choose="chooseAbyssBenediction"
    />
    <ForgeScreen
      v-if="screenKind === ScreenKind.Forge"
      v-model:adventure-exp="adventureExp"
      v-model:amount="forgeAmount"
      v-model:progress="forgeProgress"
      v-model:recipe-id="forgeRecipeId"
      v-model:tab="forgeTab"
      :adventure-rank="rank"
      :adventure-rank-tables="adventureRankTables"
      :completed-main-quest-ids="completedMainQuestIds"
      :definitions="forgeDefinitions"
      :game-text
      :inventory
      :is-in-realm="false"
      :now="forgeNow"
      :party-character-ids="getDeployedCharacterIds(party)"
      :random="kitContext.random"
      :recipes="forgeRecipes"
      :wallet
      :weapons="forgeWeapons"
      @achievement-events="(achievementEvents) => events.emit('achievementEvents', achievementEvents)"
      @close="screenKind = ScreenKind.World"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
      @update:wallet="(nextWallet) => setWallet(nextWallet)"
    />
    <ShopScreen
      v-if="screenKind === ScreenKind.Shop"
      v-model:purchases="shopPurchases"
      :adventure-rank="rank"
      :game-text
      :goods="shopIdShopGoodMap.get(shopId) ?? []"
      :inventory
      :material-data-map
      :name-text
      :reputation-level="reputation.level"
      :wallet
      @close="screenKind = ScreenKind.World"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
      @update:wallet="(nextWallet) => setWallet(nextWallet)"
    />
    <ExpeditionLoader
      v-if="screenKind === ScreenKind.Expedition"
      v-model:expeditions="expeditions"
      :adventure-rank="rank"
      :characters="expeditionCharacters"
      :character-passive-group-id-map="characterPassiveGroupIdMap"
      :completed-quest-ids="completedMainQuestIds"
      :down-character-ids="downCharacterIds"
      :game-data-base-url="gameDataBaseUrl"
      :game-text
      :inventory
      :material-data-map
      :name-text
      :now="getWorldNow()"
      :random="kitContext.random"
      :region-statue-progress-map="regionStatueProgressMap"
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

/* The shortcut wheel centred over the world, its size the shorter side of the view so it fits any window */
.shortcut-wheel {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(60vh, 60vw);
  aspect-ratio: 1;
  pointer-events: none;
  transform: translate(-50%, -50%);
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
