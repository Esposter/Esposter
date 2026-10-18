import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { RegionData } from "#src/models/world/RegionData";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";

import { useWorldMap } from "#src/composables/useWorldMap";
import { DomainKind } from "#src/models/domains/DomainKind";
import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { Currency } from "#src/models/inventory/Currency";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { readMondstadtExplorationAreas } from "#src/services/exploration/readMondstadtExplorationAreas";
import { EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";
import { findPointedLandmark } from "#src/services/map/findPointedLandmark";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { readOpenWorldTransPointRewards } from "#src/services/transPoint/readOpenWorldTransPointRewards";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { readRegionData } from "#src/services/world/readRegionData";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { computed, ref, shallowRef } from "vue";

vi.mock(import("#src/services/exploration/readMondstadtExplorationAreas"));
vi.mock(import("#src/services/reputation/readMondstadtReputation"));
vi.mock(import("#src/services/transPoint/readOpenWorldTransPointRewards"));
vi.mock(import("#src/services/world/readRegionData"));

// The reads the composable makes are in the background, so they settle on the next turn of the event loop
const waitForReads = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe(useWorldMap, () => {
  // The composables under test read Vue's API as the build auto-imports it, which the node environment does not, so
  // Its two globals are stubbed in as the build would provide them
  beforeEach(() => {
    vi.stubGlobal("computed", computed);
    vi.stubGlobal("shallowRef", shallowRef);
    vi.mocked(readRegionData).mockResolvedValue(region);
    vi.mocked(readMondstadtExplorationAreas).mockResolvedValue(explorationAreas);
    vi.mocked(readMondstadtReputation).mockResolvedValue(reputationCity);
    vi.mocked(readOpenWorldTransPointRewards).mockResolvedValue([]);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  const REGION_ID = "first-region";
  const AREA_ID = "first-area";
  const WAYPOINT_ID = "40";
  const CHEST_DOING_ID = "41";
  const WAYPOINT_WEIGHT = 40;
  const TOTAL = 100;
  const THRESHOLD = 40;
  const REWARD_EXP = 200;
  const REWARD_MORA = 300;
  const REQUEST_QUEST_ID = 901;
  const REQUEST_EXP = 80;
  const REQUEST_MORA = 500;
  const NEXT_LEVEL_EXP = 1000;
  const TRANS_POINT_ID = 9;
  const TRANS_POINT_ADVENTURE_EXP = 20;
  const TRANS_POINT_PRIMOGEMS = 3;
  // A statue standing within the pointer's reach of the origin, where the character is
  const statue: StatueLandmark = {
    areaId: AREA_ID,
    heightOffset: 0,
    id: "first-statue",
    kind: LandmarkKind.StatueOfTheSeven,
    position: { x: 20, z: 0 },
    rotation: 0,
  };
  // A Teleport Waypoint and a domain's entrance far from the origin, so the statue alone is in the pointer's reach there
  const waypoint: WaypointLandmark = {
    areaId: AREA_ID,
    arrival: { heightOffset: 0, position: { x: 500, z: 0 }, rotation: 0 },
    heightOffset: 0,
    id: `${REGION_ID}-waypoint-${TRANS_POINT_ID}`,
    kind: LandmarkKind.TeleportWaypoint,
    position: { x: 500, z: 0 },
    rotation: 0,
  };
  const domainEntrance: DomainEntranceLandmark = {
    areaId: AREA_ID,
    domainKind: DomainKind.Blessing,
    entryId: 1,
    heightOffset: 0,
    id: "first-domain-entrance",
    kind: LandmarkKind.DomainEntrance,
    position: { x: 600, z: 0 },
    rotation: 0,
  };
  const region: RegionData = {
    enemyCamps: [],
    goToPlaces: [],
    id: REGION_ID,
    landmarks: [statue, waypoint, domainEntrance],
    outcropPlaces: [],
    residents: [],
    waterfalls: [],
  };
  const explorationAreas: ExplorationArea[] = [
    {
      areaId: AREA_ID,
      doings: [{ id: WAYPOINT_ID, kind: ExplorationKind.Waypoint, weight: WAYPOINT_WEIGHT }],
      reputationRatio: 0,
      total: TOTAL,
    },
  ];
  const reputationCity: ReputationCity = {
    bounties: [],
    bountyTargets: [],
    explores: [
      {
        exploreId: 1,
        exploreProgress: THRESHOLD,
        reward: { exp: REWARD_EXP, items: [{ count: REWARD_MORA, id: MORA_ITEM_ID }] },
      },
    ],
    huntingRegions: [],
    levels: [
      {
        functionIds: [],
        goodsIds: [],
        level: 1,
        nextLevelExp: NEXT_LEVEL_EXP,
        requestGroupId: 1,
        reward: { exp: 0, items: [] },
      },
    ],
    requests: [
      {
        groupId: 1,
        questId: REQUEST_QUEST_ID,
        requestId: 1001,
        reward: { exp: REQUEST_EXP, items: [{ count: REQUEST_MORA, id: MORA_ITEM_ID }] },
        weight: 1,
      },
    ],
  };
  // The composable under test, given the landmarks already unlocked, with the Reputation and the wallet it pays into
  const createWorldMap = (
    unlockedLandmarkIds: ReadonlySet<string> = new Set<string>(),
    events = createWorldEvents(),
    openedChestCountMap = shallowRef<ReadonlyMap<string, number>>(new Map()),
  ) => {
    const gainWorldAdventureExp = vi.fn<(amount: number) => void>();
    const reputation = shallowRef({ exp: 0, level: 1 });
    const wallet = ref(EMPTY_WALLET);
    return {
      events,
      gainWorldAdventureExp,
      reputation,
      wallet,
      ...useWorldMap({
        catalogue: { regions: [{ areas: [], id: REGION_ID, name: "First Region" }] },
        events,
        gainWorldAdventureExp,
        gameDataBaseUrl: "game-data",
        isChestPlacesLoaded: shallowRef(true),
        openedChestCountMap,
        regionDataBaseUrl: "region-data",
        reputation,
        setReputation: (nextReputation) => {
          reputation.value = nextReputation;
        },
        setWallet: (nextWallet) => {
          wallet.value = nextWallet;
        },
        unlockedLandmarkIds,
        wallet,
      }),
    };
  };

  test("crossing a threshold pays its reward once", async () => {
    expect.hasAssertions();

    const { activateLandmark, reputation, wallet } = createWorldMap();
    await waitForReads();

    activateLandmark(statue.id);

    expect(reputation.value).toStrictEqual({ exp: REWARD_EXP, level: 1 });
    expect(wallet.value).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: REWARD_MORA });
  });

  // An area whose only doing is one chest, which is the threshold's whole reach
  const CHEST_AREA_EXPLORATION: ExplorationArea[] = [
    {
      areaId: AREA_ID,
      doings: [{ id: CHEST_DOING_ID, kind: ExplorationKind.Chest, weight: WAYPOINT_WEIGHT }],
      reputationRatio: 0,
      total: TOTAL,
    },
  ];

  test("an opened chest pays the exploration threshold it reaches once", async () => {
    expect.hasAssertions();

    vi.mocked(readMondstadtExplorationAreas).mockResolvedValue(CHEST_AREA_EXPLORATION);
    const openedChestCountMap = shallowRef<ReadonlyMap<string, number>>(new Map());
    const { reputation, wallet } = createWorldMap(new Set(), createWorldEvents(), openedChestCountMap);
    await waitForReads();

    openedChestCountMap.value = new Map([[AREA_ID, 1]]);
    await waitForReads();

    expect(reputation.value).toStrictEqual({ exp: REWARD_EXP, level: 1 });
    expect(wallet.value).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: REWARD_MORA });
  });

  test("the chests a save holds pay no exploration threshold on load", async () => {
    expect.hasAssertions();

    vi.mocked(readMondstadtExplorationAreas).mockResolvedValue(CHEST_AREA_EXPLORATION);
    const { reputation } = createWorldMap(
      new Set(),
      createWorldEvents(),
      shallowRef<ReadonlyMap<string, number>>(new Map([[AREA_ID, 1]])),
    );
    await waitForReads();

    expect(reputation.value).toStrictEqual({ exp: 0, level: 1 });
  });

  test("a finished request pays its reward once", async () => {
    expect.hasAssertions();

    const { events, reputation, wallet } = createWorldMap();
    await waitForReads();
    const quest: Quest = {
      descriptionTextId: "description",
      id: String(REQUEST_QUEST_ID),
      kind: QuestKind.World,
      offerTalkIds: [],
      steps: [{ id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.Defeat, targetId: "1" }], textId: "text" }],
      talks: [],
      titleTextId: "title",
    };
    const finishedProgress = { objectiveCounts: [], stepIndex: 1 };

    events.emit("finishQuest", quest, { objectiveCounts: [0], stepIndex: 0 }, finishedProgress);
    events.emit("finishQuest", quest, finishedProgress, finishedProgress);

    expect(reputation.value).toStrictEqual({ exp: REQUEST_EXP, level: 1 });
    expect(wallet.value).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: REQUEST_MORA });
  });

  test("an unlock before the reads settle pays its threshold once", async () => {
    expect.hasAssertions();

    // Every read is still pending when the statue is unlocked, so the unlock lands before the areas, the regions and the
    // Reputation are in
    const regionRead = Promise.withResolvers<RegionData>();
    const explorationAreasRead = Promise.withResolvers<ExplorationArea[]>();
    const reputationRead = Promise.withResolvers<ReputationCity>();
    vi.mocked(readRegionData).mockReturnValue(regionRead.promise);
    vi.mocked(readMondstadtExplorationAreas).mockReturnValue(explorationAreasRead.promise);
    vi.mocked(readMondstadtReputation).mockReturnValue(reputationRead.promise);
    const { activateLandmark, reputation, wallet } = createWorldMap();

    activateLandmark(statue.id);
    regionRead.resolve(region);
    explorationAreasRead.resolve(explorationAreas);
    reputationRead.resolve(reputationCity);
    await waitForReads();

    expect(reputation.value).toStrictEqual({ exp: REWARD_EXP, level: 1 });
    expect(wallet.value).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: REWARD_MORA });
  });

  test("an unlock made before the reads land is paid once they land", async () => {
    expect.hasAssertions();

    // The Reputation is the one read still pending when the statue is unlocked, the areas and the regions already in
    const reputationRead = Promise.withResolvers<ReputationCity>();
    vi.mocked(readMondstadtReputation).mockReturnValue(reputationRead.promise);
    const { activateLandmark, reputation, wallet } = createWorldMap();
    await waitForReads();

    activateLandmark(statue.id);
    expect(reputation.value).toStrictEqual({ exp: 0, level: 1 });

    reputationRead.resolve(reputationCity);
    await waitForReads();

    expect(reputation.value).toStrictEqual({ exp: REWARD_EXP, level: 1 });
    expect(wallet.value).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: REWARD_MORA });
  });

  test("an unlocked waypoint is never pointed to", async () => {
    expect.hasAssertions();

    const { jumpLandmarks, lockedJumpLandmarks } = createWorldMap(new Set([statue.id]));
    await waitForReads();

    // The statue is loaded and in reach of the origin, so the pointer would take it were it still locked
    expect(jumpLandmarks.value).toStrictEqual([statue, waypoint]);
    expect(findPointedLandmark(lockedJumpLandmarks.value, { x: 0, z: 0 }, undefined)).toBeUndefined();
  });

  test("interacting with a locked waypoint unlocks it", async () => {
    expect.hasAssertions();

    const { activateLandmark, unlockedLandmarks } = createWorldMap();
    await waitForReads();

    activateLandmark(waypoint.id);

    expect(unlockedLandmarks.value).toStrictEqual([waypoint]);
  });

  test("a quest step that names a waypoint finishes when it is unlocked", async () => {
    expect.hasAssertions();

    // The step names the waypoint by its transport point, as the quest data does, so the unlock is the Interact it finishes on
    const quest: Quest = {
      descriptionTextId: "",
      id: "quest",
      kind: QuestKind.World,
      offerTalkIds: [],
      steps: [
        {
          id: "step",
          objectives: [{ count: 1, kind: QuestObjectiveKind.Interact, targetId: String(TRANS_POINT_ID) }],
          textId: "step",
        },
      ],
      talks: [],
      titleTextId: "",
    };
    const events = createWorldEvents();
    const questEvents: QuestEvent[] = [];
    events.on("questEvent", (questEvent) => {
      questEvents.push(questEvent);
    });
    const { activateLandmark } = createWorldMap(new Set(), events);
    await waitForReads();

    activateLandmark(waypoint.id);

    const progress = questEvents.reduce<QuestProgress>(
      (questProgress, questEvent) => advanceQuest(quest, questProgress, questEvent),
      { objectiveCounts: [], stepIndex: 0 },
    );
    expect(progress).toStrictEqual({ objectiveCounts: [], stepIndex: 1 });
  });

  test("interacting with a locked domain entrance unlocks it", async () => {
    expect.hasAssertions();

    const { activateLandmark, lockedDomainEntranceLandmarks, unlockedLandmarkIds } = createWorldMap();
    await waitForReads();
    expect(lockedDomainEntranceLandmarks.value).toStrictEqual([domainEntrance]);

    activateLandmark(domainEntrance.id);

    expect(unlockedLandmarkIds.value).toStrictEqual(new Set([domainEntrance.id]));
    expect(lockedDomainEntranceLandmarks.value).toStrictEqual([]);
  });

  test("an unlocked waypoint is offered as a jump", async () => {
    expect.hasAssertions();

    const { unlockedLandmarks } = createWorldMap(new Set([waypoint.id]));
    await waitForReads();

    expect(unlockedLandmarks.value).toStrictEqual([waypoint]);
  });

  test("a locked waypoint is not offered as a place to revive", async () => {
    expect.hasAssertions();

    // The player is defeated beside the locked waypoint, with only the statue unlocked, which the revive takes instead
    const { unlockedLandmarks } = createWorldMap(new Set([statue.id]));
    await waitForReads();

    expect(findNearestLandmark(unlockedLandmarks.value, waypoint.position)).toStrictEqual(statue);
  });

  test("the first unlock pays the waypoint's reward", async () => {
    expect.hasAssertions();

    vi.mocked(readOpenWorldTransPointRewards).mockResolvedValue([
      { adventureExp: TRANS_POINT_ADVENTURE_EXP, pointId: TRANS_POINT_ID, primogems: TRANS_POINT_PRIMOGEMS },
    ]);
    const { activateLandmark, gainWorldAdventureExp, wallet } = createWorldMap();
    await waitForReads();

    activateLandmark(waypoint.id);
    await waitForReads();

    expect(wallet.value).toStrictEqual({ ...EMPTY_WALLET, [Currency.Primogem]: TRANS_POINT_PRIMOGEMS });
    expect(gainWorldAdventureExp).toHaveBeenCalledExactlyOnceWith(TRANS_POINT_ADVENTURE_EXP);
  });

  test("a later unlock pays nothing again", async () => {
    expect.hasAssertions();

    vi.mocked(readOpenWorldTransPointRewards).mockResolvedValue([
      { adventureExp: TRANS_POINT_ADVENTURE_EXP, pointId: TRANS_POINT_ID, primogems: TRANS_POINT_PRIMOGEMS },
    ]);
    const { activateLandmark, gainWorldAdventureExp, wallet } = createWorldMap(new Set([waypoint.id]));
    await waitForReads();

    activateLandmark(waypoint.id);
    await waitForReads();

    expect(wallet.value).toStrictEqual(EMPTY_WALLET);
    expect(gainWorldAdventureExp).not.toHaveBeenCalled();
  });
});
