<script setup lang="ts">
import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
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
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { WorldCameraPose } from "#src/models/world/WorldCameraPose";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { TresCanvasInstance, TresContextWithClock, TresRendererSetupContext } from "@tresjs/core";
import type { QualityTier } from "genshin-engine";
import type { GameLanguage, GameText } from "genshin-text";

import AchievementScreen from "#src/components/Achievement/Screen/Index.vue";
import ArchiveScreen from "#src/components/Archive/Screen/Index.vue";
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
import WorldEnemyNameTags from "#src/components/World/EnemyNameTags/Index.vue";
import WorldFreeCamera from "#src/components/World/FreeCamera/Index.vue";
import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { useExplorationAreas } from "#src/composables/useExplorationAreas";
import { useGatheringPoints } from "#src/composables/useGatheringPoints";
import { useInteraction } from "#src/composables/useInteraction";
import { useJumpLandmarks } from "#src/composables/useJumpLandmarks";
import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { Currency } from "#src/models/inventory/Currency";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { AchievementTextLoaderMap } from "#src/services/achievement/AchievementTextLoaderMap";
import { advanceAchievements } from "#src/services/achievement/advanceAchievements";
import { readAchievements } from "#src/services/achievement/readAchievements";
import { computeAdventureRankProgress } from "#src/services/adventureRank/computeAdventureRankProgress";
import { computeAdventureRankStanding } from "#src/services/adventureRank/computeAdventureRankStanding";
import { ArchiveTextLoaderMap } from "#src/services/archive/ArchiveTextLoaderMap";
import { ARCHIVE_UNLOCK_QUEST_ID } from "#src/services/archive/constants";
import { countArchiveDefeat } from "#src/services/archive/countArchiveDefeat";
import { openArchiveEntries } from "#src/services/archive/openArchiveEntries";
import { openArchiveEntry } from "#src/services/archive/openArchiveEntry";
import { openTravelLogEntries } from "#src/services/archive/openTravelLogEntries";
import { readArchiveEntries } from "#src/services/archive/readArchiveEntries";
import { readTravelLogEntries } from "#src/services/archive/readTravelLogEntries";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readStatTables } from "#src/services/character/readStatTables";
import { stepElementalSight } from "#src/services/elementalSight/stepElementalSight";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { checkIsGatheringPlaceStanding } from "#src/services/gathering/checkIsGatheringPlaceStanding";
import { GATHERING_CLOCK_INTERVAL_MS } from "#src/services/gathering/constants";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";
import { placeEnemyDrops } from "#src/services/interaction/placeEnemyDrops";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { EMPTY_INVENTORY, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { toItemDefinition } from "#src/services/inventory/toItemDefinition";
import { CharacterIdKitMap } from "#src/services/kit/CharacterIdKitMap";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { strikePartyMember } from "#src/services/kit/strikePartyMember";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { TELEPORT_FADE_IN_MS, TELEPORT_FADE_OUT_MS } from "#src/services/map/constants";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";
import { checkIsPartyDown } from "#src/services/party/checkIsPartyDown";
import { PARTY_MEMBER_BURST_INPUT_ACTIONS, PARTY_MEMBER_INPUT_ACTIONS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getElementalResonances } from "#src/services/party/getElementalResonances";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { reviveParty } from "#src/services/party/reviveParty";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";
import { getFinishedQuestEvents } from "#src/services/quest/getFinishedQuestEvents";
import { QuestTextLoaderMap } from "#src/services/quest/QuestTextLoaderMap";
import { readQuests } from "#src/services/quest/readQuests";
import { startQuests } from "#src/services/quest/startQuests";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { toGenshinSave } from "#src/services/save/toGenshinSave";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { getNextScreenKind } from "#src/services/screen/getNextScreenKind";
import { ScreenBehaviourMap } from "#src/services/screen/ScreenBehaviourMap";
import { LandmarkIdStatuePointIdMap } from "#src/services/statue/LandmarkIdStatuePointIdMap";
import { readOpenWorldTransPointRewards } from "#src/services/transPoint/readOpenWorldTransPointRewards";
import { InitialBannerKindWishPityMap } from "#src/services/wish/InitialBannerKindWishPityMap";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { getCharacterLocomotion } from "#src/services/world/locomotion/getCharacterLocomotion";
import { getResultAsync } from "@esposter/shared";
import { TresCanvas } from "@tresjs/core";
import { useEventListener, useIntervalFn, useNow, useRafFn, watchImmediate } from "@vueuse/core";
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
import { CharacterMenuTab, InteractionKind, ItemCategory } from "genshin-interface";
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
  // The player's save the world's systems start from, a new player's when there is none
  save?: GenshinSave;
  // The server's clock minus this machine's, which every saved timer is read against
  serverClockOffsetMs?: number;
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
  save,
  serverClockOffsetMs = 0,
} = defineProps<Props>();
// Quitting the game leaves the world, which its host does. A grant is a change to the bag or the wallet the host saves
// At once, and a save is every change to what the world holds, which the host saves on its own cadence
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
// The carried quests, read as the world starts with their words in the reader's language, and the Archon quests started
// From the prologue's first. A quest that fails to read is logged and leaves the quest screen empty
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(readQuests).match(
  (newQuests) => {
    quests.value = newQuests;
    questProgressMap.value = startQuests(newQuests, questProgressMap.value);
  },
  (error) => {
    console.error(error);
  },
);
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => QuestTextLoaderMap[language]()).match(
  (newQuestTextMap) => {
    questTextMap.value = newQuestTextMap;
  },
  (error) => {
    console.error(error);
  },
);
const party = reactive(createParty([TRAVELER_CHARACTER_ID]));
// The combat talent multipliers of the deployed team, read as the world starts and again whenever the team changes, each
// Character's chunk on demand. The Traveler's kit is built from them once they arrive, and nothing is priced until then
const talentMultipliers = shallowRef<TalentMultiplierMap>();
const deployedCharacterIds = computed(() => party.teams[party.deployedTeamIndex]?.characterIds ?? []);
watchImmediate(deployedCharacterIds, (characterIds) => {
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readTalentMultipliers(characterIds)).match(
    (newTalentMultipliers) => {
      talentMultipliers.value = { ...talentMultipliers.value, ...newTalentMultipliers };
    },
    (error) => {
      console.error(error);
    },
  );
});
const travelerKit = computed(() => (talentMultipliers.value ? createTravelerKit(talentMultipliers.value) : undefined));
// How the character on the field moves, its body type's, once the roster has arrived
const locomotion = computed(() =>
  statTables.value ? getCharacterLocomotion(getActiveCharacterId(party), statTables.value.characterDataMap) : undefined,
);
// Each character's combat once the roster has arrived, priced by the Traveler's kit for every character until the kits
// Run reads each one's own. The character on the field's combat and its party member are what the HUD's health and
// Skills read
const characterIdCombatantMap = computed(() => {
  const combatantMap = new Map<number, Combatant>();
  if (!statTables.value || !travelerKit.value) return combatantMap;
  // The deployed team's resonances, read off its members' elements in the roster, which hold on every member
  const { characterDataMap } = statTables.value;
  const elementalResonances = getElementalResonances(
    (party.teams[party.deployedTeamIndex]?.characterIds ?? []).flatMap((characterId) => {
      const element = characterDataMap.get(characterId)?.element;
      return element ? [element] : [];
    }),
  );
  for (const character of characters.value)
    combatantMap.set(character.id, {
      ascension: character.ascension,
      attributes: computeCharacterAttributes(
        getCharacterAttributeLines(character, statTables.value),
        elementalResonances,
      ),
      characterId: character.id,
      elementalResonances,
      kit: CharacterIdKitMap[character.id] ?? travelerKit.value,
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
// The systems the save holds, read once as the world is made, so the world starts where the player left it
const savedState = readGenshinSave(save ?? EMPTY_GENSHIN_SAVE);
const inventory = ref<Inventory>(EMPTY_INVENTORY);
const wallet = ref<Wallet>(savedState.wallet);
const wishPityMap = ref(InitialBannerKindWishPityMap);
const characterCopyCountMap = shallowRef<ReadonlyMap<number, number>>(new Map());
// The carried quests, read as the world starts, with how far each has come. A quest shows once it starts, and a finished
// One stays in the progress map at its last step, so the quests in progress are those started and not yet finished
const quests = shallowRef<Quest[]>([]);
const questProgressMap = shallowRef<ReadonlyMap<string, QuestProgress>>(savedState.quests);
const questsInProgress = computed(() =>
  quests.value.filter((quest) => {
    const progress = questProgressMap.value.get(quest.id);
    return progress !== undefined && !checkIsQuestFinished(quest, progress);
  }),
);
// The World Level the camps spawn at, from the player's Adventure EXP and quests. No source adds Adventure EXP or
// Completes a main quest yet, so the player stands at a new player's World Level 0
const adventureRankStanding = computeAdventureRankStanding(0, new Set<string>());
const worldLevel = adventureRankStanding.worldLevel;
const adventureExpProgress = computeAdventureRankProgress(0, adventureRankStanding.rank);
const questTextMap = shallowRef<Readonly<Record<string, string>>>({});
const trackedQuestId = ref("");
// The quest on the HUD's tracker, the one navigated to or with none the first in progress, which V navigates to, and the
// Navigated one's objective, which its beam rises over
const trackerQuest = computed(
  () => questsInProgress.value.find(({ id }) => id === trackedQuestId.value) ?? questsInProgress.value[0],
);
const questTargetId = computed(() => {
  if (!trackedQuestId.value || !trackerQuest.value) return "";
  const { id, steps } = trackerQuest.value;
  return steps[questProgressMap.value.get(id)?.stepIndex ?? 0]?.objectives[0]?.targetId ?? "";
});
// The achievements, their categories and their words in the reader's language, read the first time the Achievements
// Screen opens rather than with the world. The quests a player finishes move the achievements whatever screen is open,
// Which reads their table on its own
const achievementData = shallowRef<{
  achievements: Achievement[];
  categories: AchievementCategory[];
  textMap: Readonly<Record<string, string>>;
}>();
const achievementProgressMap = shallowRef<ReadonlyMap<number, AchievementProgress>>(new Map());
// The Archive's entries by section and their names, read once the quest it opens after is done, as the game opens it.
// Its progress starts empty, and the bag's items open their entries as it takes them in
const archiveData = shallowRef<{
  sectionEntriesMap: Record<ArchiveSection, ArchiveEntry[]>;
  textMap: Readonly<Record<string, string>>;
}>();
const archiveProgressMap = shallowRef<ArchiveProgress>(new Map());
// The defeats of each Living Being, counted under its entry for the Archive to show
const archiveKillsMap = shallowRef<ArchiveKills>(new Map());
// The main quests done, by id. The Archive opens once the quest it opens after is among them
const finishedMainQuestIds = computed(
  () =>
    new Set(
      quests.value
        .filter((quest) => checkIsQuestFinished(quest, questProgressMap.value.get(quest.id)))
        .map(({ id }) => Number(id)),
    ),
);
const isArchiveUnlocked = computed(() => finishedMainQuestIds.value.has(ARCHIVE_UNLOCK_QUEST_ID));
watch(isArchiveUnlocked, (newIsArchiveUnlocked) => {
  if (!newIsArchiveUnlocked || archiveData.value) return;
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(async () => {
    const [sectionEntriesMap, textMap] = await Promise.all([readArchiveEntries(), ArchiveTextLoaderMap[language]()]);
    return { sectionEntriesMap, textMap };
  }).match(
    (newArchiveData) => {
      archiveData.value = newArchiveData;
    },
    (error) => {
      console.error(error);
    },
  );
});
watch(screenKind, (newScreenKind) => {
  if (newScreenKind !== ScreenKind.Achievements || achievementData.value) return;
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(async () => {
    const [{ achievements, categories }, textMap] = await Promise.all([
      readAchievements(),
      AchievementTextLoaderMap[language](),
    ]);
    return { achievements, categories, textMap };
  }).match(
    (newAchievementData) => {
      achievementData.value = newAchievementData;
    },
    (error) => {
      console.error(error);
    },
  );
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
// The enemies in the world by their spawn key, which the enemies write as their camps load and as they die, and which
// The character's kit strikes and an enemy's strike lands from
const enemyMap = new Map<string, Enemy>();
// The drops lying in the world, which each defeated enemy's are placed among, and how many drops the page has placed,
// Which numbers the next ones
const worldDrops = shallowRef<WorldDrop[]>([]);
let placedDropCount = 0;
const windrise = useTemplateRef<InstanceType<typeof WorldWindrise>>("windrise");
// Each talk the quests in progress hold by its id, which a resident's talk is begun from
const talkMap = computed(
  () =>
    new Map(
      questsInProgress.value.flatMap(({ talks }) => talks.map((questTalk) => [questTalk.id, questTalk] as const)),
    ),
);
// Every landmark a jump lands at, and the ones the player has unlocked: the map, the minimap, the jump list and a revive
// Offer only those. A new player has unlocked none, and each is unlocked by resonating with it
const jumpLandmarks = useJumpLandmarks(regionDataBaseUrl);
// The areas the map counts the exploration of, read as the world opens and shown on each area the unlocked statues fill
const explorationAreas = useExplorationAreas();
// Mondstadt's gathering points and the items they give, read as the world opens. A point picked is kept with the instant
// It was picked, and stands again once its respawn has come, read each time the clock is looked at
const { gatheringItems, gatheringPlaces } = useGatheringPoints();
const idGatheringItemMap = computed(() => new Map(gatheringItems.value.map((item) => [item.id, item] as const)));
const gatheringPlaceIdPickedAtMap = shallowRef<ReadonlyMap<string, Temporal.Instant>>(new Map());
const gatheringClock = useNow({ scheduler: (callback) => useIntervalFn(callback, GATHERING_CLOCK_INTERVAL_MS) });
// Every saved timer is read against the server's clock, which this machine's own runs behind or ahead of by the offset
const getWorldNow = () => Temporal.Now.instant().add({ milliseconds: serverClockOffsetMs });
const unlockedLandmarkIds = shallowRef<ReadonlySet<string>>(savedState.unlockedLandmarkIds);
const unlockedLandmarks = computed(() => jumpLandmarks.value.filter(({ id }) => unlockedLandmarkIds.value.has(id)));
// The systems as the save holds them, emitted on every change at once, so a grant's emit after its change carries it
const gameSave = computed(() =>
  toGenshinSave({
    quests: questProgressMap.value,
    unlockedLandmarkIds: unlockedLandmarkIds.value,
    wallet: wallet.value,
  }),
);
watch(gameSave, (newGameSave) => emit("save", newGameSave), { flush: "sync" });
// What the character can act on in the world: each drop, named by its item, each resident of the regions in reach
// Whose talk the world holds, named by its text, and each jump landmark still locked, which it resonates with. Each
// Stands on the ground beneath its point
const interactables = computed<Interactable[]>(() => {
  const drops = worldDrops.value.map(({ id, itemId, position: { x, z } }) => ({
    id,
    kind: InteractionKind.PickUp,
    name: itemId === MORA_ITEM_ID ? gameText[GameTextKey.Mora] : getItemDefinition(itemId, gameText).name,
    position: { x, y: getWorldHeight(x, z), z },
  }));
  // A resident is a row only at the spot they are shown at this hour, so one absent from it is no row
  const residents = [...(windrise.value?.regionDataMap.values() ?? [])]
    .flatMap(({ residents: regionResidents }) => regionResidents)
    .flatMap(({ id, nameTextId, talkId }) => {
      const spot = windrise.value?.residentSpots.get(id);
      if (!spot || !talkMap.value.has(talkId)) return [];
      const { x, z } = spot.position;
      return [
        {
          id: talkId,
          kind: InteractionKind.Talk,
          name: questTextMap.value[nameTextId] ?? "",
          position: { x, y: getWorldHeight(x, z), z },
        },
      ];
    });
  // A jump landmark is a Statue of The Seven until waypoints join the jumps, so each locked one is named by the statue
  const statues = jumpLandmarks.value
    .filter(({ id }) => !unlockedLandmarkIds.value.has(id))
    .map(({ id, position: { x, z } }) => ({
      id,
      kind: InteractionKind.Activate,
      name: gameText[GameTextKey.StatueOfTheSeven],
      position: { x, y: getWorldHeight(x, z), z },
    }));
  // Each gathering point that stands now, named by its item, and drawn beside the drops as the same kind of row
  const now = Temporal.Instant.fromEpochMilliseconds(gatheringClock.value.getTime() + serverClockOffsetMs);
  const gatherings = gatheringPlaces.value.flatMap(({ id, kind, position: { x, z } }) => {
    const item = idGatheringItemMap.value.get(kind);
    if (!item || !checkIsGatheringPlaceStanding(gatheringPlaceIdPickedAtMap.value.get(id), item.respawn, now))
      return [];
    return [
      {
        id,
        kind: InteractionKind.PickUp,
        name: toItemDefinition(item, gameText).name,
        position: { x, y: getWorldHeight(x, z), z },
      },
    ];
  });
  return [...drops, ...gatherings, ...residents, ...statues];
});
const { interactionPrompts, readInteraction } = useInteraction(() => interactables.value, characterBody);
// The achievements a finished step or quest moves, read off their table when first needed, and the Primogems of those
// Finished are paid into the wallet
const advanceAchievementsWith = (achievementEvents: AchievementEvent[]) => {
  if (achievementEvents.length === 0) return;
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(readAchievements).match(
    ({ achievements }) => {
      const now = getWorldNow();
      let primogems = 0;
      let nextProgressMap = achievementProgressMap.value;
      for (const achievementEvent of achievementEvents) {
        const advance = advanceAchievements(achievements, nextProgressMap, achievementEvent, now);
        primogems += advance.primogems;
        nextProgressMap = advance.progressMap;
      }
      achievementProgressMap.value = nextProgressMap;
      setWallet({ ...wallet.value, [Currency.Primogem]: wallet.value[Currency.Primogem] + primogems });
    },
    (error) => {
      console.error(error);
    },
  );
};
// The Primogems a statue pays on its first unlock, from the open world's transport points by its scene point. Only a
// Locked landmark is offered to resonate with, so each is paid once
const payFirstUnlockReward = (landmarkId: string) => {
  const pointId = LandmarkIdStatuePointIdMap[landmarkId];
  if (pointId === undefined) return;
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(readOpenWorldTransPointRewards).match(
    (rewards) => {
      const reward = rewards.find((transPointReward) => transPointReward.pointId === pointId);
      if (reward)
        setWallet({ ...wallet.value, [Currency.Primogem]: wallet.value[Currency.Primogem] + reward.primogems });
    },
    (error) => {
      console.error(error);
    },
  );
};
// A doing the world records is handed to every quest in progress, each advanced by it. The steps and quests it finishes
// Reach the achievements
const doQuestEvent = (questEvent: QuestEvent) => {
  const nextProgressMap = new Map(questProgressMap.value);
  const achievementEvents: AchievementEvent[] = [];
  for (const quest of questsInProgress.value) {
    const progress = nextProgressMap.get(quest.id);
    if (!progress) continue;
    const nextProgress = advanceQuest(quest, progress, questEvent);
    nextProgressMap.set(quest.id, nextProgress);
    achievementEvents.push(...getFinishedQuestEvents(quest, progress, nextProgress));
  }
  questProgressMap.value = startQuests(quests.value, nextProgressMap);
  advanceAchievementsWith(achievementEvents);
  if (achievementEvents.some(({ kind }) => kind === AchievementEventKind.ParentQuestFinished)) openTravelLog();
};
// The Travel Log entries of the main quests finished are opened as each one finishes, read off the Archive's table when
// First needed, since the Archive's own screen may not have been opened
const openTravelLog = () => {
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(readTravelLogEntries).match(
    (entries) => {
      archiveProgressMap.value = openTravelLogEntries(archiveProgressMap.value, entries, finishedMainQuestIds.value);
    },
    (error) => {
      console.error(error);
    },
  );
};
// A talk that ends is a talk-to for the quests in progress, and the world is back under the Traveler
const endTalk = () => {
  if (talk.value) doQuestEvent({ kind: QuestObjectiveKind.TalkTo, targetId: talk.value.id });
  screenKind.value = ScreenKind.World;
};
// A defeated enemy's drops lie where it fell, numbered on from the drops placed before them, and the defeat is a doing
// The quests in progress count
const defeatEnemy = (enemy: Enemy, enemyDrops: EnemyDrops) => {
  const drops = placeEnemyDrops(enemy, enemyDrops, placedDropCount);
  placedDropCount += drops.length;
  worldDrops.value = [...worldDrops.value, ...drops];
  const { archiveEntryId } = getEnemyKind(enemy.enemyKindId);
  archiveProgressMap.value = openArchiveEntry(archiveProgressMap.value, ArchiveSection.LivingBeings, archiveEntryId);
  archiveKillsMap.value = countArchiveDefeat(archiveKillsMap.value, archiveEntryId);
  doQuestEvent({ kind: QuestObjectiveKind.Defeat, targetId: String(enemy.enemyKindId) });
};
// Every change to the bag goes through here, so the Archive opens the entries of what the bag takes in
const setInventory = (nextInventory: Inventory) => {
  inventory.value = nextInventory;
  archiveProgressMap.value = openArchiveEntries(archiveProgressMap.value, nextInventory.items);
  emit("grant");
};
// Every change to the wallet goes through here, as the bag's does, so a grant or a purchase is saved at once
const setWallet = (nextWallet: Wallet) => {
  wallet.value = nextWallet;
  emit("grant");
};
// The game's hint over the world for a pick up the bag had no room for, cleared by the next pick up that fits
const bagFullHint = ref("");
// A pick up takes the drop's Mora or item into the wallet or the bag, and what the bag has no room for stays on the
// Ground as a smaller drop
const pickUpWorldDrop = (worldDrop: WorldDrop) => {
  const pickUp = pickUpDroppedItem(worldDrop, inventory.value, wallet.value, gameText);
  setInventory(pickUp.inventory);
  setWallet(pickUp.wallet);
  bagFullHint.value = pickUp.overflow > 0 ? gameText[GameTextKey.BagFull] : "";
  doQuestEvent({ kind: QuestObjectiveKind.Collect, targetId: String(worldDrop.itemId) });
  worldDrops.value =
    pickUp.overflow > 0
      ? worldDrops.value.map((drop) => (drop === worldDrop ? { ...drop, count: pickUp.overflow } : drop))
      : worldDrops.value.filter((drop) => drop !== worldDrop);
};
// A gathering point is picked into the bag as one of its item, and is kept as picked only once the bag has taken it
const pickUpGatheringPlace = (placeId: string) => {
  const place = gatheringPlaces.value.find(({ id }) => id === placeId);
  if (!place) return;
  const item = idGatheringItemMap.value.get(place.kind);
  if (!item) return;
  const addition = addInventoryItem(inventory.value, toItemDefinition(item, gameText), 1);
  setInventory(addition.inventory);
  bagFullHint.value = addition.overflow > 0 ? gameText[GameTextKey.BagFull] : "";
  doQuestEvent({ kind: QuestObjectiveKind.Collect, targetId: String(item.id) });
  if (addition.overflow === 0)
    gatheringPlaceIdPickedAtMap.value = new Map([...gatheringPlaceIdPickedAtMap.value, [placeId, getWorldNow()]]);
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
// A team that has all fallen revives at the share the game brings it back with, and is jumped to the unlocked landmark
// Nearest the body, or left where it fell when none is unlocked
const respawnParty = () => {
  if (!checkIsPartyDown(party)) return;
  reviveParty(party);
  const nearestLandmark = findNearestLandmark(unlockedLandmarks.value, characterBody.position);
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
              unlockedLandmarkIds = new Set([...unlockedLandmarkIds, interactable.id]);
              payFirstUnlockReward(interactable.id);
              doQuestEvent({ kind: QuestObjectiveKind.Interact, targetId: interactable.id });
            } else if (interactable?.kind === InteractionKind.Talk) {
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
        photo mode or a talk holds it. Photo mode's camera orbits the held character, and under the tuning panel it flies
        free from where the orbit left it -->
        <WorldCharacter
          v-if="!witness && locomotion"
          ref="character"
          :body="characterBody"
          :character-id-combatant-map
          :enemy-map
          :input-state
          :is-held="screenKind !== ScreenKind.World || undefined"
          :is-orbiting="(screenKind === ScreenKind.PhotoMode && !isTuning) || undefined"
          :landmark-collider
          :locomotion
          :origin
          :party
          @drown="respawnParty()"
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
        @strike="(enemy) => strikeParty(enemy)"
      />
    </TresCanvas>
    <WorldEnemyNameTags :elemental-sight :enemy-map :get-camera :name-text :origin />
    <!-- No HUD over a reference's held camera or a witness render, which the game's recordings show bare -->
    <HudScreen
      v-if="!cameraPose && !witness && !isPaused && !isHudHidden && !screenBehaviour.isHudHidden"
      :camera="mapCamera"
      :character-data-map="statTables?.characterDataMap"
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
      :adventure-rank="adventureRankStanding.rank"
      :game-text
      :world-level
      @quit="emit('quit')"
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
        <ArchiveScreen
          :game-text
          :kills-map="archiveKillsMap"
          :progress-map="archiveProgressMap"
          :section-entries-map="archiveData.sectionEntriesMap"
          :text-map="archiveData.textMap"
          @close="screenKind = ScreenKind.World"
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
      <template v-if="statTables && nameText" #[ScreenKind.Character]>
        <CharacterScreen
          :active-character-id="getActiveCharacterId(party)"
          :characters
          :game-text
          :initial-tab="CharacterMenuTab.Attributes"
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
      :talk
      :text-map="questTextMap"
      @end="endTalk"
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
