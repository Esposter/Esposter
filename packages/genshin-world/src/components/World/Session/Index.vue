<script setup lang="ts">
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { WorldBagDependencies } from "#src/models/world/WorldBagDependencies";
import type { WorldScreenProps } from "#src/models/world/WorldScreenProps";
import type { WorldTables } from "#src/models/world/WorldTables";
import type { TresCanvasInstance } from "@tresjs/core";

import AchievementScreen from "#src/components/Achievement/Screen/Index.vue";
import BookReaderScreen from "#src/components/Archive/BookReader/Index.vue";
import ArchiveScreen from "#src/components/Archive/Screen/Index.vue";
import CharacterScene from "#src/components/Character/Scene/Index.vue";
import CharacterScreen from "#src/components/Character/Screen/Index.vue";
import CharacterTerms from "#src/components/Character/Terms/Index.vue";
import ProcessingScreen from "#src/components/Cooking/Processing/Index.vue";
import CookingScreen from "#src/components/Cooking/Screen/Index.vue";
import CraftingScreen from "#src/components/Crafting/Screen/Index.vue";
import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
import DomainScreen from "#src/components/Domain/Screen/Index.vue";
import ExpeditionLoader from "#src/components/Expedition/Loader/Index.vue";
import FishingScreen from "#src/components/Fishing/Screen/Index.vue";
import ForgeScreen from "#src/components/Forge/Screen/Index.vue";
import GameOverScreen from "#src/components/GameOver/Index.vue";
import GcgSession from "#src/components/Gcg/Session/Index.vue";
import HandbookScreen from "#src/components/Handbook/Screen/Index.vue";
import HudNavigation from "#src/components/Hud/Navigation/Index.vue";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import HudShortcutWheel from "#src/components/Hud/ShortcutWheel/Index.vue";
import OfferChoice from "#src/components/Interaction/OfferChoice/Index.vue";
import InventoryScreen from "#src/components/Inventory/Screen/Index.vue";
import MailScreen from "#src/components/Mail/Screen/Index.vue";
import MapOverlay from "#src/components/Map/Overlay/Index.vue";
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
import StatueScreen from "#src/components/Statue/Screen/Index.vue";
import StatueWorshipScreen from "#src/components/Statue/Worship/Index.vue";
import WishScreen from "#src/components/Wish/Screen/Index.vue";
import WorldCharacter from "#src/components/World/Character/Index.vue";
import WorldEnemyNameTags from "#src/components/World/EnemyNameTags/Index.vue";
import WorldFreeCamera from "#src/components/World/FreeCamera/Index.vue";
import WorldRealm from "#src/components/World/Realm/Index.vue";
import TipPopup from "#src/components/World/Tip/Index.vue";
import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { useMenuNavigation } from "#src/composables/useMenuNavigation";
import { useMiningOutcrops } from "#src/composables/useMiningOutcrops";
import { useStoredGenshinSettings } from "#src/composables/useStoredGenshinSettings";
import { useWorldAchievements } from "#src/composables/useWorldAchievements";
import { useWorldAdventureRank } from "#src/composables/useWorldAdventureRank";
import { useWorldArchive } from "#src/composables/useWorldArchive";
import { useWorldBagUse } from "#src/composables/useWorldBagUse";
import { useWorldCamera } from "#src/composables/useWorldCamera";
import { useWorldCardGame } from "#src/composables/useWorldCardGame";
import { useWorldChests } from "#src/composables/useWorldChests";
import { useWorldClock } from "#src/composables/useWorldClock";
import { useWorldCombat } from "#src/composables/useWorldCombat";
import { useWorldCommissionClaims } from "#src/composables/useWorldCommissionClaims";
import { useWorldCommissions } from "#src/composables/useWorldCommissions";
import { useWorldConstellations } from "#src/composables/useWorldConstellations";
import { useWorldCooking } from "#src/composables/useWorldCooking";
import { useWorldDevHandles } from "#src/composables/useWorldDevHandles";
import { useWorldDishes } from "#src/composables/useWorldDishes";
import { useWorldDoings } from "#src/composables/useWorldDoings";
import { useWorldDomains } from "#src/composables/useWorldDomains";
import { useWorldExpeditionRoster } from "#src/composables/useWorldExpeditionRoster";
import { useWorldFishing } from "#src/composables/useWorldFishing";
import { useWorldForging } from "#src/composables/useWorldForging";
import { useWorldFrame } from "#src/composables/useWorldFrame";
import { useWorldFriendship } from "#src/composables/useWorldFriendship";
import { useWorldGadgets } from "#src/composables/useWorldGadgets";
import { useWorldHomeRealm } from "#src/composables/useWorldHomeRealm";
import { useWorldHudFrame } from "#src/composables/useWorldHudFrame";
import { useWorldHudVisibility } from "#src/composables/useWorldHudVisibility";
import { useWorldInteractables } from "#src/composables/useWorldInteractables";
import { useWorldInteractionDispatch } from "#src/composables/useWorldInteractionDispatch";
import { useWorldMail } from "#src/composables/useWorldMail";
import { useWorldMap } from "#src/composables/useWorldMap";
import { useWorldOculi } from "#src/composables/useWorldOculi";
import { useWorldOfferings } from "#src/composables/useWorldOfferings";
import { useWorldOutcrops } from "#src/composables/useWorldOutcrops";
import { useWorldPickups } from "#src/composables/useWorldPickups";
import { useWorldPointedLandmark } from "#src/composables/useWorldPointedLandmark";
import { useWorldProfileNamecards } from "#src/composables/useWorldProfileNamecards";
import { useWorldPuzzles } from "#src/composables/useWorldPuzzles";
import { useWorldQuestRewards } from "#src/composables/useWorldQuestRewards";
import { useWorldQuests } from "#src/composables/useWorldQuests";
import { useWorldQuestTargets } from "#src/composables/useWorldQuestTargets";
import { useWorldReputationBounty } from "#src/composables/useWorldReputationBounty";
import { useWorldReputationRequest } from "#src/composables/useWorldReputationRequest";
import { useWorldRestorativePower } from "#src/composables/useWorldRestorativePower";
import { useWorldSave } from "#src/composables/useWorldSave";
import { useWorldSaveSync } from "#src/composables/useWorldSaveSync";
import { useWorldScreen } from "#src/composables/useWorldScreen";
import { useWorldScreenBehaviour } from "#src/composables/useWorldScreenBehaviour";
import { useWorldShortcutWheel } from "#src/composables/useWorldShortcutWheel";
import { useWorldShrines } from "#src/composables/useWorldShrines";
import { useWorldSpiralAbyss } from "#src/composables/useWorldSpiralAbyss";
import { useWorldStatues } from "#src/composables/useWorldStatues";
import { useWorldTalks } from "#src/composables/useWorldTalks";
import { useWorldTips } from "#src/composables/useWorldTips";
import { useWorldTrials } from "#src/composables/useWorldTrials";
import { useWorldTrounceBlossoms } from "#src/composables/useWorldTrounceBlossoms";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { computeCraftingCrafters } from "#src/services/crafting/computeCraftingCrafters";
import { HOME_REALM_GROUND_HEIGHT } from "#src/services/home/constants";
import { OUTCROP_REGION_ID } from "#src/services/leyLine/constants";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { MAP_REFERENCE_ZOOM_METRES, TELEPORT_FADE_IN_MS, TELEPORT_FADE_OUT_MS } from "#src/services/map/constants";
import { findAreaAt } from "#src/services/map/findAreaAt";
import { findNearestTeleportWaypoint } from "#src/services/map/findNearestTeleportWaypoint";
import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { createTresRenderer } from "#src/services/scene/createTresRenderer";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { getTeamAntiColdRatio } from "#src/services/sheerCold/getTeamAntiColdRatio";
import { PAIMON_BARGAINS_SHOP_ID } from "#src/services/shop/constants";
import { ABYSS_ENTRANCE_POSITION } from "#src/services/spiralAbyss/constants";
import { getResonatedRegionIds } from "#src/services/statue/getResonatedRegionIds";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import { TresCanvas } from "@tresjs/core";
import { useMediaQuery } from "@vueuse/core";
import {
  createGrassTrail,
  createInput,
  createLandmarkCollider,
  GENSHIN_TONE_MAPPING,
  QualityTierSettingsMap,
} from "genshin-engine";
import { CharacterMenuTab, GAME_CREAM, InventorySort, ItemCategory } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { Group, PCFShadowMap, Vector3 } from "three";

interface Props extends WorldScreenProps, WorldTables {}

const {
  accountAvatarUrl,
  accountName,
  adventureRankTables,
  artifactMainAffixPools,
  artifactRarityDataMap,
  cameraPose,
  catalogue,
  characterPackReaders,
  characterTalentKits,
  craftingBenchPlace,
  craftingRecipes,
  craftingStrongboxes,
  createTerrainWorker,
  devRegistry,
  domainChallengeLevels,
  enemyTables,
  frostbearingTreeLevels,
  frostbearingTreePlaces,
  gameDataBaseUrl,
  gameText,
  heldMinutes,
  hudInterfaceRects,
  isPaused,
  isTuning,
  language,
  materialDataMap,
  monumentPlaces,
  nameText,
  paimonsBargainsRotation,
  qualityTier,
  regionDataBaseUrl,
  reliquaryPieceEntryMap,
  reliquarySets,
  save,
  sceneExportBaseUrl,
  seelies,
  serverClockOffsetMs,
  shopIdShopGoodMap,
  shrineKeySources,
  shrinePlaces,
  startingCharacterIdKitMap,
  statTables,
  talentUpgradeMap,
  timeTrialPlaces,
  tips,
  tipText,
  wildlifePlaces,
  windriseData,
  wishSchedule,
} = defineProps<Props>();
// Quitting the game leaves the world, which its host does. A grant is a change to the bag, the wallet, the wish counters or
// The achievements' progress, which the host saves once per tick, and a save is every change to what the world holds,
// Which the host saves on its own cadence
const emit = defineEmits<{ grant: []; quit: []; ready: []; save: [save: GenshinSave] }>();
// The settings the device keeps, read over the host's defaults. The world renders at the quality tier it started with,
// Since its renderer and grass take the tier at setup, so a tier chosen in Settings is kept for the next start
const settingsDefaults = { ...GENSHIN_SETTINGS_DEFAULTS, language, qualityTier };
const settings = useStoredGenshinSettings(settingsDefaults);
const worldQualityTier = settings.value.qualityTier;
const { maxPixelRatio } = QualityTierSettingsMap[worldQualityTier];
// The world on its own canvas: the camera circling Windrise's oak, and the scene it looks at. It is ready once the
// Scene has the ground and the landmarks of its first view, which keep loading while the world is paused. A world that
// Cannot start, where neither WebGPU nor WebGL 2 is available, is ready all the same, so a host waiting on it moves on
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
const { closeScreen, screenKind } = useWorldScreen();
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
  applyDestruction,
  archiveKillsMap,
  archiveProgressMap,
  bossDefeatMap,
  chooseTravelerBirthday,
  clearedCamps,
  clearedDomainIds,
  cookingProgress,
  craftedCountMap,
  craftingProgress,
  enemyRespawnMap,
  forgetBossDefeat,
  foundOculusIds,
  frostbearingTreeProgress,
  inventory,
  namecardItemId,
  openedChestIds,
  processingJobs,
  queuedTipIds,
  regionStatueProgressMap,
  setBossDefeatAt,
  setEnemyRespawnAt,
  setInventory,
  setNamecardItemId,
  setWallet,
  shownTipIds,
  travelerBirthday,
  wallet,
  wishHistory,
  wishPityMap,
} = useWorldSave({ emitGrant: () => emit("grant"), events, savedState });
// The bag, the wallet and their setters, and the item data and names the composables that take from or pay into them read
const bag: WorldBagDependencies = { inventory, materialDataMap, nameText, setInventory, setWallet, wallet };
// The tips the world shows, each once per save, in the order the quests that trigger them finish
const { closeTip, showingTip } = useWorldTips({ events, queuedTipIds, shownTipIds, tips });
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
  questTargetIds,
  questTextMap,
  trackedQuestId,
  trackerQuest,
} = useWorldQuests({ events, gameDataBaseUrl, language, savedQuestProgressMap: savedState.quests });
// The world's time: every saved timer is read against the server's clock, and a ref the computeds read
const { getWorldNow, worldNow } = useWorldClock(() => serverClockOffsetMs);
// The fishing points in reach, whether fishing is open at them, and the cast held while a point is fished
const {
  castView,
  checkIsFishingPoint,
  closeFishing,
  fishingCatchAts,
  fishingPointPlaces,
  isFishingOpen,
  openFishingPoint,
  stepFishing,
} = useWorldFishing({
  gameDataBaseUrl,
  getRegionIds: () => [...(windrise.value?.regionDataMap.keys() ?? [])],
  getWorldNow,
  inventory,
  materialDataMap,
  names: nameText,
  questProgressMap,
  quests,
  random: () => kitContext.random(),
  savedFishingCatchAts: savedState.fishingCatchAts,
  setInventory,
  worldNow,
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
  questTargetIds,
  rank,
  savedCommissionDay: savedState.commissionDay,
  savedEncounterPoints: savedState.encounterPoints,
  savedLongTermEncounterPoints: savedState.longTermEncounterPoints,
  worldNow,
});
// The Archive's entries, the volumes it reads and the defeats it counts, opened by the bag, the quests and the defeats
const { archiveData, bookReading, offeredViewpoints, readBook, viewpointPlaceMap, viewViewpoint } = useWorldArchive({
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
// The screen open over the world sets what the pointer and the keys do, and the cursor Left Alt shows over it
const { screenBehaviour, showCursor } = useWorldScreenBehaviour({ closeFishing, input, screenKind });
// The world's root, which a menu's controls are walked within, so the pad's focus never leaves the menu over the world
const worldScreen = useTemplateRef("worldScreen");
const { stepMenuNavigation } = useMenuNavigation({ inputState, root: worldScreen, screenKind });
onUnmounted(() => {
  input.dispose();
});
// The world's origin, owned here so the cameras read the ground through it before the floating origin shifts it
const origin = new Vector3();
// The Serenitea Pot on the open world and the realm the player goes into from it
const { homePotPoint, homeRealmVisit, placeUsedGadget, toggleHomeRealm } = useWorldHomeRealm();
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
  deleteGift: deleteGiftMail,
  deleteRead: deleteReadMails,
  isBagFull: isMailBagFull,
  mailData,
  mails,
  markMailRead,
  toggleMailPin,
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
  ...bag,
  archive: { archiveData, archiveProgressMap },
  events,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  getServerClockOffsetMs: () => serverClockOffsetMs,
  getWorldNow,
  reliquaryPieceEntryMap,
  weaponDataMap: statTables.weaponDataMap,
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
const { campLockSources, chestInteractables, digChestById, openChestById, worldChestPlaces } = useWorldChests({
  ...bag,
  artifactMainAffixPools,
  artifactRarityDataMap,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  openedChestIds,
  placeWorldDrops,
  puzzleChestPlaces,
  reliquaryPieceEntryMap,
  reliquarySets,
  solvedPuzzleIds,
  timeTrialMarkers,
  waterLevel: windriseData.water.level,
  weaponDataMap: statTables.weaponDataMap,
});
// The gadget equipped to the quick-use slot, which Z uses once its cooldown group is ready
const { equippedGadget, gadgetRows, getEquippedGadgetCooldown, isQuickSwapOpen, stepQuickUse } = useWorldGadgets({
  gameDataBaseUrl,
  inventory,
});
// The statues' Oculi and resonances, which pay their levels as the bag's offers do
const {
  claimWorship,
  collectOculus,
  getRegionProgress,
  getWorshipItemName,
  offerWorship,
  openWorship,
  resonateStatue,
  staminaMaximum,
  worshipLevels,
  worshipRegionId,
} = useWorldStatues({
  ...bag,
  characterBody,
  events,
  foundOculusIds,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  placeWorldDrops,
  regionStatueProgressMap,
  screenKind,
});
// The Frostbearing Tree the bag is offered to, whose levels are read from the game's table as it is offered to, and
// Whose rewards the bag has no room for drop at the tree
const { offerFrostbearingTree } = useWorldOfferings({
  ...bag,
  events,
  frostbearingTreeProgress,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  placeWorldDrops,
});
// The Traveler's resonated regions, Restorative Power and auto-recover, and the element and bonuses they give it
const {
  autoRecoverSetting,
  resonatedRegionIds,
  restorativePower,
  stepAutoRecover,
  travelerBonusLines,
  travelerElement,
} = useWorldRestorativePower({
  finishedMainQuestIds,
  getWorldNow,
  unlockedLandmarkIds: savedState.unlockedLandmarkIds,
});
// The bonus lines the Spiral Abyss's chamber gives the whole party, held here as the combat and the chamber both read them
const abyssBonusLines = shallowRef<AttributeLine[]>([]);
// The constellations each character holds and the name of its own Stella Fortuna, which the character screen and the wish read
const { characterIdConstellationsMap, stellaFortunaNameTextIdMap } = useWorldConstellations(gameDataBaseUrl);
// The party, the characters, the enemies and the kit's effects, which a defeat places drops among and a team's fall revives
const {
  activeCharacterId,
  characterIdKitMap,
  characterIdSkillGlyphsMap,
  characters,
  chargeParty,
  clearKitEffects,
  coldDamageParty,
  defeatEnemy,
  getMemberMaxHealth,
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
    // A trial's fall ends the trial, which gives the player's roster back in place of the fallen one, so nothing revives
    if (trialArena.value) {
      const returnPose = stepTrial({ deltaMilliseconds: 0, isPartyDown: true, isPlaying: false });
      if (returnPose) jumpTo(returnPose);
      return;
    }
    // A domain's challenge ends in the party's fall: the team revives, and the leave to the entrance comes after the revive's
    // Jump to the nearest waypoint, so the entrance is where the player lands
    if (!domainArena.value) {
      screenKind.value = ScreenKind.GameOver;
      return;
    }
    reviveFallenParty();
    stepDomainChallenge({ deltaMilliseconds: 0, isPartyDown: true, isPlaying: false });
  },
  onPartyRevived: () => {
    const nearestWaypoint = findNearestTeleportWaypoint(unlockedLandmarks.value, characterBody.position);
    if (nearestWaypoint) jumpTo(computeJumpPose(nearestWaypoint));
  },
  partyBonusLines: abyssBonusLines,
  placeWorldDrops,
  savedCharacters: savedState.characters,
  savedParty: savedState.party,
  staminaMaximum,
  startingCharacterIdKitMap,
  statTables,
  travelerBonusLines,
  travelerElement,
  wildlifePlaces,
});
// The character trials: a trial takes the player's roster for its fight, and the claims its first clears make are saved
const { openTrial, playerRoster, stepTrial, trialArena, trialClaimedStageIds, trials, trialSecondsRemaining } =
  useWorldTrials({
    ...bag,
    artifactRarityDataMap,
    characterBody,
    characterDataMap: statTables.characterDataMap,
    characterIdKitMap,
    characters,
    claimedStageIds: savedState.characterTrialClaimedStageIds,
    closeScreen,
    gameDataBaseUrl,
    getGroundHeight,
    jumpTo: (pose) => jumpTo(pose),
    party,
    weaponDataMap: statTables.weaponDataMap,
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
const {
  cookingRecipe,
  cookingRecipes,
  cookingStovePlace,
  cookingTalents,
  instructionRecipeMap,
  openCookingRecipes,
  processingRecipes,
} = useWorldCooking({ gameDataBaseUrl });
const {
  blacksmithPlace,
  forgeAmount,
  forgeDefinitions,
  forgeNow,
  forgeProgress,
  forgeRecipeId,
  forgeRecipes,
  forgeTab,
  forgeWeapons,
} = useWorldForging({
  gameDataBaseUrl,
  getWorldNow,
  materialDataMap,
  nameText,
  screenKind,
  weaponDataMap: statTables.weaponDataMap,
});
const { friendshipLevels, friendshipNamecards } = useWorldFriendship(gameDataBaseUrl);
// The claims a commission makes with the points held, from the handbook's Commissions tab
const { claimCommission, claimKatheryneBonus, convertLongTermPoint, isLongTermPointConvertible } =
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
    worldNow,
  });
// The namecards the profile holds, which the profile's screen lists
const { profileNamecards } = useWorldProfileNamecards({
  achievementData,
  achievementProgressMap,
  characters,
  friendshipLevels,
  friendshipNamecards,
  materialDataMap,
  nameText,
});
// Using an entry of the bag, which the bag's screen offers
const { useBagEntry } = useWorldBagUse({
  cookingProgress,
  dishUseMap,
  getMemberMaxHealth,
  getWorldNow,
  instructionRecipeMap,
  inventory,
  kitContext,
  party,
  setInventory,
  setWallet,
  wallet,
});
// The residents of the regions in reach, which the talks and a keeper's screen are read from
const getResidents = () => [...(windrise.value?.regionDataMap.values() ?? [])].flatMap(({ residents }) => residents);
// The card game's EXP and the games whose one-time reward is paid, which a won week game's duel pays into
const { cardGameExp, cardGameRewardedGameIds, payCardGameReward } = useWorldCardGame({
  ...bag,
  getResidents,
  savedCardGameExp: savedState.cardGameExp,
  savedRewardedGameIds: savedState.cardGameRewardedGameIds,
});
// The talks a resident begins and the talk the world runs, held by id, with their words, the quest talks a resident's
// Standing talk offers and the duel a resident offers from each talk
const {
  beginTalk,
  endTalk,
  gcgGameId,
  getTalkDuelGameId,
  residentInteractables,
  talk,
  talkDuelGameId,
  talkMap,
  talkOffers,
  talkTextMap,
} = useWorldTalks({
  closeScreen,
  events,
  gameDataBaseUrl,
  getAdventureRank: () => rank.value,
  getCardGameExp: () => cardGameExp.value,
  getCompletedMainQuestIds: () => completedMainQuestIds.value,
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
const shopId = shallowRef(0);
const shopPurchases = shallowRef<ShopPurchase[]>(savedState.shopPurchases);
// The Spiral Abyss on the world: its entry, its chambers in the arena beside the entrance, and the Benediction a Corridor chamber offers
const {
  abyssBlessing,
  abyssCamps,
  abyssChoiceChamberIndex,
  abyssChoiceFloorIndex,
  abyssChoices,
  abyssFloorsOffered,
  abyssProgressMap,
  chooseAbyssBenediction,
  enterAbyssChamber,
  openAbyssEntrance,
  stepAbyss,
} = useWorldSpiralAbyss({
  ...bag,
  areaId: findAreaAt(catalogue, ABYSS_ENTRANCE_POSITION.x, ABYSS_ENTRANCE_POSITION.z)?.id ?? "",
  bonusLines: abyssBonusLines,
  events,
  gameDataBaseUrl,
  getWorldNow,
  party,
  savedProgressMap: savedState.spiralAbyssProgressMap,
});
const reputationLevel = shallowRef(reputation.value.level);
// The Oculi of the region published: those not found, those near the camera and the one the body touches
const { findTouchedOculus, nearOculusPlaces, oculusPlaces, unfoundOculusPlaces } = useWorldOculi({
  characterBody,
  foundOculusIds,
  gameDataBaseUrl,
  getMapCamera: () => mapCamera.value,
});
// The doings the world places and the ids the save records of them as done, which each area's exploration counts
const { placedDoings, recordedDoingIds } = useWorldDoings({
  clearedCamps,
  foundOculusIds,
  monumentPlaces,
  oculusPlaces,
  openedChestIds,
  puzzleSeelies,
  settledSeelieIds,
  solvedPuzzleIds,
  timeTrialPlaces,
  worldChestPlaces,
});
// The landmarks the world holds and the ones the player has unlocked, which a jump lands at and the first unlock pays
const {
  activateLandmark,
  explorationAreas,
  jumpLandmarks,
  jumpPose,
  jumpTo,
  lockedJumpLandmarks,
  payReputationReward,
  reputationCity,
  requestClaimedAts,
  subareaLabels,
  unlockedLandmarkIds,
  unlockedLandmarks,
} = useWorldMap({
  catalogue,
  completedMainQuestIds,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  getWorldNow,
  placedDoings,
  questStepTargets,
  recordedDoingIds,
  regionDataBaseUrl,
  reputation,
  savedRequestClaimedAts: savedState.reputationRequestClaimedAts,
  setReputation: (nextReputation) => {
    reputation.value = nextReputation;
  },
  setWallet,
  unlockedLandmarkIds: savedState.unlockedLandmarkIds,
  wallet,
});
// The Mondstadt bounty the keeper offers from the level its bounties unlock at, and its claim once the taken one's target is
// Defeated. A bounty's offer stands ahead of her request, which waits until the bounty is claimed
const { bountyCamps, bountyClaimedAts, bountyHunt, bountyTrailEnds, claimBounty, reputationBountyOffer, takeBounty } =
  useWorldReputationBounty({
    events,
    getWorldNow,
    payReputationReward,
    random: () => kitContext.random(),
    reputation,
    reputationCity,
    savedBountyClaimedAts: savedState.reputationBountyClaimedAts,
    savedBountyHunt: savedState.reputationBountyHunt,
    worldLevel,
  });
const { acceptReputationOffer, drawReputationOffer, reputationOfferTitle } = useWorldReputationRequest({
  acceptQuest,
  bountyHunt,
  claimBounty,
  getWorldNow,
  questProgressMap,
  quests,
  questTextMap,
  reputation,
  reputationBountyOffer,
  reputationCity,
  requestClaimedAts,
  takeBounty,
});
watch(unlockedLandmarkIds, (landmarkIds) => {
  resonatedRegionIds.value = getResonatedRegionIds(landmarkIds);
});
// A character's name in the reader's language, read from the game's text by its data's name
const getCharacterName = (characterId: number) =>
  nameText[statTables.characterDataMap.get(characterId)?.nameTextId ?? ""] || "";
// The world's developer commands, which read and change the state this session holds, and join the registry while it is
// Mounted; the scene's clock and weather are read through the Windrise scene
useWorldDevHandles({
  body: characterBody,
  catalogue,
  devRegistry,
  getCharacterName,
  getGameClock: () => windrise.value?.gameClock,
  getLandmarks: () => jumpLandmarks.value,
  getWeather: () => windrise.value?.areaWeather,
  jumpTo,
  party,
});
// The expeditions out from the Adventurers' Guild and the roster the expedition picker lists
const { characterPassiveGroupIdMap, downCharacterIds, expeditionCharacters, expeditions } = useWorldExpeditionRoster({
  characters,
  characterTalentKits,
  getCharacterName,
  party,
});
// The artifact tables the Mystic Offering rolls its strongbox's artifact from, the same ones the chests draw from
const craftingArtifactDropTables = { artifactMainAffixPools, artifactRarityDataMap, reliquarySets };
// The party's crafters, each named by the game's text, and the one on the field, who is picked as the bench opens
const crafting = computed(() =>
  computeCraftingCrafters(getDeployedCharacterIds(party), activeCharacterId.value, getCharacterName),
);
// The ley line outcrops the world draws: a touch starts a blossom's fight, a camp's last enemy reveals it, and F claims it
// With resin, and each day's are drawn at the daily reset
// The places of the outcrop region, which its loaded data holds, and none while the region is not loaded
const outcropPlaces = computed(() => windrise.value?.regionDataMap.get(OUTCROP_REGION_ID)?.outcropPlaces ?? []);
// The mining outcrops of each region the world has loaded, drawn at the daily reset and struck as the ores are
const { minedOutcrops, refreshMiningOutcrops, standingMiningOutcrops, strikeMiningOutcrops } = useMiningOutcrops({
  breakOre,
  gameDataBaseUrl,
  getWorldNow,
  rank,
  regionIds: computed(() => [...(windrise.value?.regionDataMap.keys() ?? [])]),
  savedMinedOutcrops: savedState.minedOutcrops,
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
  ...bag,
  adventureExp,
  adventureRankTables,
  areaId: ref(OUTCROP_REGION_ID),
  characters,
  completedMainQuestIds,
  enemyMap: kitContext.enemyMap,
  events,
  friendshipLevels,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  party,
  placements: outcropPlaces,
  rank,
  regionStatueProgressMap,
});
// The Trounce Blossoms a defeated normal boss leaves, claimed at its place by F for the Original Resin its claim costs
const {
  chooseTrounceBlossomClaim,
  claimPrompt: trounceClaimPrompt,
  closeTrounceBlossomClaim,
  forgetTrounceBlossom,
  lastTeleportAts,
  openTrounceBlossomClaim,
  trounceBlossomInteractables,
  trounceBlossoms,
} = useWorldTrounceBlossoms({
  ...bag,
  catalogue,
  characters,
  emitGrant: () => emit("grant"),
  enemyKindMap: enemyTables.enemyKindMap,
  events,
  friendshipLevels,
  gainWorldAdventureExp,
  gameText,
  getGroundHeight,
  getWorldNow,
  party,
  savedState,
  worldNow,
});
// What the character can act on in the world: each drop, named by its item, each resident of the regions in reach
// Whose talk the world holds, named by its text, each locked jump landmark, a domain entrance among them, which it
// Resonates with, and the Crafting bench, named by its title. Each stands on the ground beneath its point
const {
  challengeWeeklyBoss,
  chooseDomainTreeClaim,
  claimWeeklyBossFirstClearReward,
  closeDomainTreeClaim,
  domainArena,
  domainCamps,
  domainClaimOffers,
  domainLevelRows,
  enterDomainLevel,
  handbookDomains,
  isDomainTreeRaised,
  leaveDomain,
  openDomain,
  openDomainTreeClaim,
  stepDomainChallenge,
  unlockedDomainEntrances,
} = useWorldDomains({
  ...bag,
  adventureExp,
  adventureRankTables,
  artifactMainAffixPools,
  artifactRarityDataMap,
  clearedDomainIds,
  closeScreen,
  completedMainQuestIds,
  domainChallengeLevels,
  events,
  gameDataBaseUrl,
  getWorldNow,
  jumpLandmarks,
  jumpTo,
  kitEffectState: kitContext.kitEffectState,
  party,
  random: () => kitContext.random(),
  rank,
  reliquaryPieceEntryMap,
  reliquarySets,
  unlockedLandmarks,
  weaponDataMap: statTables.weaponDataMap,
  worldNow,
});
// The enemies in the world are the ley line outcrops' fighting camps, the domain challenge's camp and the taken bounty's camp
const fightingCamps = computed(() => [
  ...outcropCamps.value,
  ...domainCamps.value,
  ...abyssCamps.value,
  ...bountyCamps.value,
]);
// What using the interactable the player is prompted on does, joined from the features that act on it
const { dispatchInteraction } = useWorldInteractionDispatch({
  activateLandmark,
  characterBody,
  checkIsFishingPoint,
  claimKatheryneBonus,
  claimKatheryneRewards,
  cookingProgress,
  cookingRecipe,
  cookingRecipes,
  digChestById,
  drawReputationOffer,
  forgeNow,
  frostbearingTreeLevels,
  frostbearingTreePlaces,
  frostbearingTreeProgress,
  getGameClockMinutes: () => windrise.value?.gameClock.minutes,
  getGroundHeight,
  getResidents,
  getTalkDuelGameId,
  getWorldNow,
  grantRewards,
  jumpTo,
  materialSources,
  offeredViewpoints,
  offerFrostbearingTree,
  openAbyssEntrance,
  openChestById,
  openCookingRecipes,
  openDomain,
  openDomainTreeClaim,
  openFishingPoint,
  openOutcropClaim,
  openShrineById,
  openTrounceBlossomClaim,
  openWorship,
  pickUpGatheringPlace,
  pickUpMaterialSourcePlace,
  pickUpWorldDrop,
  random: () => kitContext.random(),
  reputation,
  reputationLevel,
  resonateStatue,
  screenKind,
  shopId,
  shrineMarkers,
  talk,
  talkDuelGameId,
  talkMap,
  toggleHomeRealm,
  trounceBlossoms,
  unlockedDomainEntrances,
  unlockedLandmarkIds,
  viewViewpoint,
  worldDrops,
});
// The prompts beside the character, joined from every source that offers one
const { interactables, interactionPrompts, pressInteractable, readInteraction } = useWorldInteractables({
  archiveData,
  blacksmithPlace,
  characterBody,
  chestInteractables,
  cookingStovePlace,
  craftingBenchPlace,
  domainArena,
  fishingPointPlaces,
  frostbearingTreePlaces,
  gameText,
  getGroundHeight,
  homePotPoint,
  homeRealmVisit,
  input,
  isDomainTreeRaised,
  isFishingOpen,
  lockedJumpLandmarks,
  offeredViewpoints,
  outcropInteractables,
  pickUpInteractables,
  residentInteractables,
  shrineInteractables,
  trounceBlossomInteractables,
  unlockedDomainEntrances,
  unlockedLandmarks,
  viewpointPlaceMap,
});
const character = useTemplateRef("character");
// Entering combat returns the camera to its default distance, keeping the look it has
events.on("enterCombat", () => character.value?.returnToDefaultDistance());
// Whether the world is paused, read as the HUD's visibility and the frame step
const checkIsPaused = () => isPaused;
// Whether the HUD is hidden, and drawn over the world
const { isHudHidden, isHudShown } = useWorldHudVisibility({
  checkIsCameraHeld: () => cameraPose !== undefined,
  checkIsPaused,
  checkIsWitnessed: () => witness !== null,
  screenBehaviour,
});
const {
  closeShortcutWheel,
  isShortcutWheelOpen,
  shortcutWheelDirectionCount,
  shortcutWheelPickedIndex,
  stepShortcutWheel,
} = useWorldShortcutWheel({ screenKind });
// Whether the device's main pointer is a finger, which the HUD draws the touch layout for
const isTouch = useMediaQuery("(pointer: coarse)");
// The camera the world is drawn through, where it stands and the rotation a reference holds it at
const { cameraRotation, getCamera, readCameraPosition } = useWorldCamera({
  canvas,
  getCameraPose: () => cameraPose,
  getIsPaused: () => isPaused,
  origin,
});
const { hudFrame, mapCamera } = useWorldHudFrame({
  characterBody,
  getCamera,
  getCapsuleHeight: () => locomotion.value.capsuleHeight,
  getStamina: () => character.value?.stamina.value ?? staminaMaximum.value,
  origin,
  staminaMaximum,
});
// The zoom the open map is at, in metres across its width, which the map's slider and wheel change and the world keeps
// From one opening of the map to the next
const mapZoom = shallowRef(MAP_REFERENCE_ZOOM_METRES);
// The frame run before each draw, which reads the input and steps each feature that moves on its own
const { stepFrame } = useWorldFrame({
  abyssChoices,
  characterBody,
  checkIsPaused,
  closeShortcutWheel,
  collectOculus,
  dispatchInteraction,
  domainClaimOffers,
  drawDayOutcrops,
  elementalSight,
  findTouchedOculus,
  getEquippedGadgetCooldown,
  getMemberMaxHealth,
  getWorldNow,
  hudFrame,
  input,
  inputState,
  interactionPrompts,
  isHudHidden,
  jumpTo,
  kitContext,
  party,
  placeUsedGadget,
  questProgressMap,
  questsInProgress,
  readInteraction,
  refreshMiningOutcrops,
  screenKind,
  showCursor,
  stepAbyss,
  stepAutoRecover,
  stepDomainChallenge,
  stepFishing,
  stepMenuNavigation,
  stepQuickUse,
  stepShortcutWheel,
  stepTrial,
  stepWorldPuzzles,
  touchOutcropsNear,
  trackedQuestId,
  trackerQuest,
  unlockedLandmarkIds,
});
// The locked jump landmark the HUD points to
const { pointedLandmark } = useWorldPointedLandmark({ lockedJumpLandmarks, mapCamera });
// The locomotion phase of the character on the field, which Windrise's Sheer Cold gauge reads its swimming off
// The character on the field's locomotion and max HP, which the sheer cold gauge reads each frame
const getCharacter = () => {
  const phase = character.value?.phase;
  const maxHealth = getMemberMaxHealth(activeCharacterId.value);
  return phase && maxHealth !== undefined ? { maxHealth, phase } : undefined;
};
const getAntiColdRatio = () => getTeamAntiColdRatio(kitContext.kitEffectState.effects);
// Where the quests' targets stand from the character, which the quest screen and the tracker read
const { questDistanceMap, questMark } = useWorldQuestTargets({
  events,
  getGroundHeight,
  mapCamera,
  questProgressMap,
  questsInProgress,
  questTargetId,
  windrise,
});
defineExpose({ jumpTo, readCameraPosition });
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
    bossDefeatMap: bossDefeatMap.value,
    cardGameExp: cardGameExp.value,
    cardGameRewardedGameIds: cardGameRewardedGameIds.value,
    characterCopyCountMap: characterCopyCountMap.value,
    characters: playerRoster.value?.characters ?? characters.value,
    characterTrialClaimedStageIds: trialClaimedStageIds.value,
    clearedCamps: clearedCamps.value,
    clearedDomainIds: clearedDomainIds.value,
    commissionDay: commissionDay.value,
    companionshipExpMap: savedState.companionshipExpMap,
    cookingProgress: cookingProgress.value,
    craftedCountMap: craftedCountMap.value,
    craftingProgress: craftingProgress.value,
    encounterPoints: encounterPoints.value,
    enemyRespawnMap: enemyRespawnMap.value,
    fishingCatchAts: fishingCatchAts.value,
    foundOculusIds: foundOculusIds.value,
    frostbearingTreeProgress: frostbearingTreeProgress.value,
    homePlacements: savedState.homePlacements,
    homePlantings: savedState.homePlantings,
    homeProgress: savedState.homeProgress,
    inventory: inventory.value,
    investigationDay: savedState.investigationDay,
    lastTeleportAts: lastTeleportAts.value,
    longTermEncounterPoints: longTermEncounterPoints.value,
    mails: mails.value,
    minedOutcrops: minedOutcrops.value,
    namecardItemId: namecardItemId.value,
    openedChestIds: openedChestIds.value,
    party: playerRoster.value?.party ?? party,
    processingJobs: processingJobs.value,
    quests: questProgressMap.value,
    queuedTipIds: queuedTipIds.value,
    regionStatueProgressMap: regionStatueProgressMap.value,
    reputation: reputation.value,
    reputationBountyClaimedAts: bountyClaimedAts.value,
    reputationBountyHunt: bountyHunt.value,
    reputationRequestClaimedAts: requestClaimedAts.value,
    settledSeelieIds: settledSeelieIds.value,
    shopPurchases: shopPurchases.value,
    shownTipIds: shownTipIds.value,
    solvedPuzzleIds: solvedPuzzleIds.value,
    spiralAbyssProgressMap: abyssProgressMap.value,
    travelerBirthday: travelerBirthday.value,
    travelerName: savedState.travelerName,
    trounceBlossoms: trounceBlossoms.value,
    unlockedLandmarkIds: unlockedLandmarkIds.value,
    wallet: wallet.value,
    wishHistory: wishHistory.value,
    wishPityMap: wishPityMap.value,
    worldLevelAdjustment: worldLevelAdjustment.value,
  }),
});
</script>

<template>
  <div ref="worldScreen" class="world-screen">
    <TresCanvas
      ref="canvas"
      :dpr="[1, maxPixelRatio]"
      :renderer="createTresRenderer"
      :render-mode="isPaused ? 'manual' : 'always'"
      :tone-mapping="GENSHIN_TONE_MAPPING"
      shadows
      :shadow-map-type="PCFShadowMap"
      @before-loop="(context) => stepFrame(context)"
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
          :is-held="screenKind !== ScreenKind.World"
          :is-move-held="isShortcutWheelOpen"
          :is-orbiting="screenKind === ScreenKind.PhotoMode && !isTuning"
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
          :is-held="screenBehaviour.isHeld"
          :origin
          :water-level="windriseData.water.level"
        />
      </template>
      <WorldWindrise
        v-if="!homeRealmVisit"
        ref="windrise"
        :last-teleport-ats
        :trounce-blossoms
        :mining-outcrop-places="standingMiningOutcrops"
        :oculus-places="unfoundOculusPlaces"
        :active-character-id
        :catalogue
        :character-body="cameraPose || witness || !locomotion ? undefined : characterBody"
        :character-locomotion="locomotion"
        :get-character
        :get-anti-cold-ratio
        :character-pack-readers
        :create-terrain-worker
        :dev-registry
        :kit-effect-state="kitContext.kitEffectState"
        :elemental-sight
        :enemy-map="kitContext.enemyMap"
        :enemy-respawn-map
        :boss-defeat-map
        :enemy-tables
        :grass-trail
        :game-data-base-url
        :get-ground-height
        :get-world-now
        :held-minutes
        :is-held="screenBehaviour.isHeld"
        :interactables
        :outcrop-camps="fightingCamps"
        :is-paused
        :landmark-collider
        :origin
        :quality-tier="worldQualityTier"
        :quest-clue-target-ids="questTargetIds"
        :quest-target-id
        :region-data-base-url
        :scene-export-base-url
        :frostbearing-tree-places
        :bounty-trail-ends
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
        @respawn="
          (spawnKey) => {
            forgetTrounceBlossom(spawnKey);
            forgetBossDefeat(spawnKey);
          }
        "
        @save-boss-defeat="(spawnKey, defeatedAt) => setBossDefeatAt(spawnKey, defeatedAt)"
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
    <div v-if="isShortcutWheelOpen" class="shortcut-wheel">
      <HudShortcutWheel
        :direction-count="shortcutWheelDirectionCount"
        :game-text
        :picked-index="shortcutWheelPickedIndex"
      />
    </div>
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
      :interaction-prompts
      :interface-rects="hudInterfaceRects"
      :is-quick-swap-open
      :is-touch
      :landmarks="unlockedLandmarks"
      :max-stamina="staminaMaximum"
      :member="hudMember"
      :name-text-map="nameText"
      :near-oculus-places
      :party
      :quest-mark
      :quest-progress="trackerQuest && questProgressMap.get(trackerQuest.id)"
      :quest-text-map
      :tracked-quest="trackerQuest"
      :traveler-name="savedState.travelerName"
      :trial-seconds-remaining
      @map="screenKind = ScreenKind.Map"
      @menu="screenKind = ScreenKind.PaimonMenu"
      @press="(id) => pressInteractable(id)"
    >
      <template #prompts>
        <TipPopup
          v-if="showingTip"
          :game-text
          :subtitle="tipText[showingTip.subtitleTextId] || ''"
          :title="tipText[showingTip.titleTextId] || ''"
          @close="closeTip()"
        />
        <OfferChoice
          v-if="claimPrompt"
          :can-restore="claimPrompt.canRestore"
          :game-text
          :offers="claimPrompt.offers"
          @choose="(offer) => chooseOutcropClaim(offer, getWorldNow(), worldLevel, kitContext.random)"
          @close="closeOutcropClaim()"
          @restore="restoreOutcropClaim(getWorldNow())"
        />
        <OfferChoice
          v-if="trounceClaimPrompt"
          :game-text
          :offers="trounceClaimPrompt.offers"
          @choose="chooseTrounceBlossomClaim(getWorldNow(), worldLevel, kitContext.random)"
          @close="closeTrounceBlossomClaim()"
        />
        <OfferChoice
          v-if="domainClaimOffers"
          :game-text
          :offers="domainClaimOffers"
          @choose="(offer) => chooseDomainTreeClaim(offer, getWorldNow())"
          @close="closeDomainTreeClaim()"
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
      :alerted-icons="[]"
      :finished-main-quest-ids
      :game-text
      :is-world-level-adjustable
      :is-world-level-lowered="worldLevelAdjustment.isLowered"
      :namecard-item-id
      :namecards="profileNamecards"
      :server-clock-offset-ms
      :traveler-birthday
      :world-level
      :world-level-changed-at="worldLevelAdjustment.changedAt"
      @pick-namecard="(itemId) => setNamecardItemId(itemId)"
      @quit="emit('quit')"
      @set-birthday="(birthday) => chooseTravelerBirthday(birthday)"
      @toggle-world-level="toggleWorldLevel()"
    >
      <template #[ScreenKind.Map]>
        <MapOverlay
          v-model:metres="mapZoom"
          :camera="mapCamera"
          :catalogue
          :exploration-areas
          :game-text
          :landmarks="unlockedLandmarks"
          :name-text
          :recorded-doing-ids
          :now="worldNow"
          :subarea-labels
          :wallet
          @close="closeScreen()"
          @jump="
            (pose) => {
              closeScreen();
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
          @close="closeScreen()"
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
          :weapon-data-map="statTables.weaponDataMap"
          @close="closeScreen()"
          @read-book="(entryId) => readBook(entryId)"
        />
      </template>
      <template v-if="mailData" #[ScreenKind.Mail]>
        <!-- eslint-disable vue/no-restricted-syntax -- the Mail screen's own confirm dialog asks first and emits a delete only once the player confirms -->
        <MailScreen
          :birthday-mail-ids="mailData.birthdayMailIds"
          :game-text
          :is-bag-full="isMailBagFull"
          :mail-rows="mailData.mailRows"
          :mails
          :material-data-map
          :names="nameText"
          :now="worldNow"
          :text-map="mailData.textMap"
          @claim="(mail) => claimMail(mail)"
          @claim-all="claimAllMails()"
          @close="closeScreen()"
          @delete-gift="(mail) => deleteGiftMail(mail)"
          @delete-read="deleteReadMails()"
          @read="(mail) => markMailRead(mail)"
          @pin="(mail) => toggleMailPin(mail)"
        />
        <!-- eslint-enable vue/no-restricted-syntax -->
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
          @close="closeScreen()"
          @navigate="(questId) => (trackedQuestId = questId)"
        />
      </template>
      <template #[ScreenKind.AdventurerHandbook]>
        <!-- The world keeps no investigations yet, so the Experience page opens on an empty panel -->
        <HandbookScreen
          :commissions="[]"
          :completed-count="0"
          :is-long-term-encounter-point-usable="isAdventureEncountersUnlocked && isLongTermPointConvertible"
          :day-commissions="handbookDayCommissions"
          :domains="handbookDomains"
          :encounter-point-limit
          :encounter-points="wholeEncounterPoints"
          :game-text
          :investigation-rewards="[]"
          :is-adventure-encounters-unlocked
          :is-reward-claimed="false"
          :long-term-encounter-points="wholeLongTermEncounterPoints"
          :name-text
          :total-count="0"
          @challenge="(landmark) => challengeWeeklyBoss(landmark)"
          @claim-commission="(commissionId) => claimCommission(commissionId)"
          @claim-first-clear="(entryId) => claimWeeklyBossFirstClearReward(entryId)"
          @close="closeScreen()"
          @use-long-term-encounter-points="convertLongTermPoint()"
        />
      </template>
      <template #[ScreenKind.Character]>
        <CharacterScreen
          v-model:characters="characters"
          v-model:wallet="wallet"
          :active-character-id
          :adventure-rank="rank"
          :character-talent-kits
          :character-id-constellations-map
          :companionship-exp-map="savedState.companionshipExpMap"
          :game-data-base-url
          :game-text
          :initial-tab="CharacterMenuTab.Attributes"
          :inventory
          :is-touch
          :language
          :material-data-map
          :max-stamina="staminaMaximum"
          :name-text
          :reliquary-sets
          :stat-tables
          :talent-upgrade-map
          :traveler-bonus-lines
          :traveler-element
          @close="closeScreen()"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
        >
          <template #scene="{ element, tab }">
            <CharacterScene :element :tab />
          </template>
          <template #default="{ characterId }">
            <div class="character-terms">
              <CharacterTerms :key="characterId" :character-id :character-pack-readers />
            </div>
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
          initial-selected-id=""
          :initial-sort="InventorySort.Level"
          :instruction-recipe-map
          :inventory
          :material-data-map
          :names="nameText"
          :wallet
          @close="closeScreen()"
          @destroy="(destruction) => applyDestruction(destruction)"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
          @use="(entryId, count) => useBagEntry(entryId, count)"
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
          :get-world-now
          :now="worldNow"
          :wish-schedule
          :stella-fortuna-name-text-id-map
          :trials
          @close="closeScreen()"
          @start-trial="(trial) => openTrial(trial)"
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
          :get-world-now
          :goods="shopIdShopGoodMap.get(PAIMON_BARGAINS_SHOP_ID) ?? []"
          :inventory
          :material-data-map
          :name-text
          :now="worldNow"
          :rotation="paimonsBargainsRotation"
          :wallet
          :weapon-data-map="statTables.weaponDataMap"
          @close="closeScreen()"
          @update:inventory="(nextInventory) => setInventory(nextInventory)"
          @update:wallet="(nextWallet) => setWallet(nextWallet)"
        />
      </template>
      <!-- The Time screen dials the hour and confirming sets the world's clock to it, from which the world runs on -->
      <template v-if="windrise" #[ScreenKind.Time]>
        <MenuTime
          :clock-minutes="windrise.gameClock.minutes"
          :game-text
          @close="closeScreen()"
          @confirm="
            (minutes) => {
              if (windrise) windrise.gameClock.minutes = minutes;
              closeScreen();
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
          @close="closeScreen()"
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
          @close="closeScreen()"
        />
      </template>
    </MenuScreen>
    <GameOverScreen
      v-if="screenKind === ScreenKind.GameOver"
      :revive-label="gameText[GameTextKey.Revive]"
      :title="gameText[GameTextKey.PlayerDieNone]"
      @revive="
        reviveFallenParty();
        closeScreen();
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
      :bounty-offer="reputationBountyOffer"
      :offer-title="reputationOfferTitle"
      :progress="reputation"
      :reputation="reputationCity"
      @accept="acceptReputationOffer()"
      @close="closeScreen()"
    />
    <GcgSession
      v-if="screenKind === ScreenKind.GcgDuel && gcgGameId !== undefined"
      :game-data-base-url
      :game-id="gcgGameId"
      :game-text
      :language
      @leave="
        (won) => {
          payCardGameReward(gcgGameId, won);
          gcgGameId = undefined;
          closeScreen();
        }
      "
    />
    <FishingScreen v-if="screenKind === ScreenKind.Fishing" :view="castView" />
    <ShopScreen
      v-if="screenKind === ScreenKind.Shop"
      v-model:purchases="shopPurchases"
      :adventure-rank="rank"
      :game-text
      :get-world-now
      :goods="shopIdShopGoodMap.get(shopId) ?? []"
      :inventory
      :material-data-map
      :name-text
      :now="worldNow"
      :reputation-level="reputation.level"
      :shop-id
      :wallet
      @close="closeScreen()"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
      @update:wallet="(nextWallet) => setWallet(nextWallet)"
    />
    <ExpeditionLoader
      v-if="screenKind === ScreenKind.Expedition"
      v-model:expeditions="expeditions"
      :adventure-rank="rank"
      :characters="expeditionCharacters"
      :character-passive-group-id-map
      :completed-quest-ids="completedMainQuestIds"
      :down-character-ids
      :game-data-base-url
      :game-text
      :inventory
      :material-data-map
      :name-text
      :now="worldNow"
      :random="kitContext.random"
      :region-statue-progress-map
      :wallet
      @close="closeScreen()"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
      @update:wallet="(nextWallet) => setWallet(nextWallet)"
    />
    <StatueScreen
      v-if="screenKind === ScreenKind.Blessing"
      v-model:auto-recover="autoRecoverSetting"
      v-model:power="restorativePower"
      :game-text
      :get-max-health="(characterId) => getMemberMaxHealth(characterId) ?? 0"
      :get-name="getCharacterName"
      :get-now="getWorldNow"
      :party
      :statue-count="resonatedRegionIds.length"
      @close="closeScreen()"
      @worship="screenKind = ScreenKind.Worship"
    />
    <StatueWorshipScreen
      v-if="screenKind === ScreenKind.Worship && worshipRegionId"
      :game-text
      :get-item-name="getWorshipItemName"
      :levels="worshipLevels"
      :progress="getRegionProgress(worshipRegionId)"
      @blessing="screenKind = ScreenKind.Blessing"
      @claim="claimWorship()"
      @close="closeScreen()"
      @offer="offerWorship()"
    />
    <DomainScreen
      v-if="screenKind === ScreenKind.Domain"
      :game-text
      :is-in-domain="domainArena !== undefined"
      :levels="domainLevelRows"
      @close="closeScreen()"
      @enter="(dungeonId) => enterDomainLevel(dungeonId)"
      @leave="
        leaveDomain();
        closeScreen();
      "
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
          closeScreen();
        }
      "
      @close="closeScreen()"
    />
    <SpiralAbyssBenediction
      v-if="abyssChoices"
      :chamber="abyssChoiceChamberIndex"
      :choices="abyssChoices"
      :floor="abyssChoiceFloorIndex"
      :game-text
      :name-text
      @choose="(towerBuffId) => chooseAbyssBenediction(towerBuffId)"
    />
    <CookingScreen
      v-if="screenKind === ScreenKind.Cooking && cookingRecipe"
      v-model:progress="cookingProgress"
      v-model:recipe="cookingRecipe"
      :avatar-id="activeCharacterId"
      :game-text
      :inventory
      :material-data-map
      :name-text
      :random="kitContext.random"
      :recipes="openCookingRecipes"
      :talent="cookingTalents[activeCharacterId]"
      @close="closeScreen()"
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
      @close="closeScreen()"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
    />
    <CraftingScreen
      v-if="screenKind === ScreenKind.Crafting"
      v-model:crafted-count-map="craftedCountMap"
      :adventure-rank="rank"
      :artifact-drop-tables="craftingArtifactDropTables"
      :crafters="crafting.crafters"
      :game-text
      :get-world-now
      :initial-crafter-id="crafting.crafterId"
      :inventory
      :material-data-map
      :name-text
      :now="worldNow"
      :progress="craftingProgress"
      :random="kitContext.random"
      :recipes="craftingRecipes"
      :reliquary-piece-entry-map
      :strongboxes="craftingStrongboxes"
      :wallet
      :weapon-data-map="statTables.weaponDataMap"
      @achievement-events="(achievementEvents) => events.emit('achievementEvents', achievementEvents)"
      @close="closeScreen()"
      @update:inventory="(nextInventory) => setInventory(nextInventory)"
      @update:wallet="(nextWallet) => setWallet(nextWallet)"
    />
    <ForgeScreen
      v-if="screenKind === ScreenKind.Forge"
      v-model:adventure-exp="adventureExp"
      v-model:amount="forgeAmount"
      v-model:progress="forgeProgress"
      v-model:recipe-id="forgeRecipeId"
      v-model:tab="forgeTab"
      :adventure-rank="rank"
      :adventure-rank-tables
      :completed-main-quest-ids
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
      @close="closeScreen()"
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
/* Provisional: where the game's hint sits and how long it stays wait on a recording of the English client at 1080 high */
.bag-full-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  color: v-bind(GAME_CREAM);
  text-shadow: 0 0 4px rgb(0 0 0 / 0.8);
}

/* The shortcut wheel centred over the world, its size the shorter side of the view so it fits any window */
.shortcut-wheel {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(60dvh, 60vw);
  aspect-ratio: 1;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

/* The package carries no utility classes, so the screen fills its host with a style of its own */
.world-screen {
  position: relative;
  width: 100%;
  height: 100%;
}

/* The terms of the character's model, beside its foot, read as its release carries them */
.character-terms {
  position: absolute;
  right: calc(var(--unit) * 120);
  bottom: calc(var(--unit) * 48);
  max-width: calc(var(--unit) * 720);
  max-height: calc(var(--unit) * 300);
  overflow: auto;
  color: v-bind(GAME_CREAM);
  font-size: calc(var(--unit) * 22);
}

.character-terms > pre {
  margin: 0;
  font: inherit;
  white-space: pre-wrap;
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
