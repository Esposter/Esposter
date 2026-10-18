import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { RegionData } from "#src/models/world/RegionData";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";

import { useWorldMap } from "#src/composables/useWorldMap";
import { DomainKind } from "#src/models/domains/DomainKind";
import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { Currency } from "#src/models/inventory/Currency";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { readMondstadtExplorationAreas } from "#src/services/exploration/readMondstadtExplorationAreas";
import { EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";
import { findPointedLandmark } from "#src/services/map/findPointedLandmark";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { readRegionData } from "#src/services/world/readRegionData";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { computed, ref, shallowRef } from "vue";

vi.mock(import("#src/services/exploration/readMondstadtExplorationAreas"));
vi.mock(import("#src/services/reputation/readMondstadtReputation"));
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
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  const REGION_ID = "first-region";
  const AREA_ID = "first-area";
  const WAYPOINT_ID = "40";
  const WAYPOINT_WEIGHT = 40;
  const TOTAL = 100;
  const THRESHOLD = 40;
  const REWARD_EXP = 200;
  const REWARD_MORA = 300;
  const NEXT_LEVEL_EXP = 1000;
  const TRANS_POINT_ID = 9;
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
    arrival: { heightOffset: 0, position: { x: 500, z: 0 }, rotation: 0 },
    areaId: AREA_ID,
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
    explores: [
      {
        exploreId: 1,
        exploreProgress: THRESHOLD,
        reward: { exp: REWARD_EXP, items: [{ count: REWARD_MORA, id: MORA_ITEM_ID }] },
      },
    ],
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
    requests: [],
  };
  // The composable under test, given the landmarks already unlocked, with the Reputation and the wallet it pays into
  const createWorldMap = (unlockedLandmarkIds: ReadonlySet<string> = new Set<string>()) => {
    const gainWorldAdventureExp = vi.fn<(amount: number) => void>();
    const reputation = shallowRef({ exp: 0, level: 1 });
    const wallet = ref(EMPTY_WALLET);
    return {
      gainWorldAdventureExp,
      reputation,
      wallet,
      ...useWorldMap({
        catalogue: { regions: [{ areas: [], id: REGION_ID, name: "First Region" }] },
        events: createWorldEvents(),
        gainWorldAdventureExp,
        gameDataBaseUrl: "game-data",
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
});
