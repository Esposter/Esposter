import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { useWorldMap } from "#src/composables/useWorldMap";
import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { Currency } from "#src/models/inventory/Currency";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { readMondstadtExplorationAreas } from "#src/services/exploration/readMondstadtExplorationAreas";
import { EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { readRegionData } from "#src/services/world/readRegionData";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { computed, ref, shallowRef } from "vue";

vi.mock(import("#src/services/exploration/readMondstadtExplorationAreas"));
vi.mock(import("#src/services/reputation/readMondstadtReputation"));
vi.mock(import("#src/services/world/readRegionData"));

describe(useWorldMap, () => {
  // The composables under test read Vue's API as the build auto-imports it, which the node environment does not, so
  // Its two globals are stubbed in as the build would provide them
  beforeEach(() => {
    vi.stubGlobal("computed", computed);
    vi.stubGlobal("shallowRef", shallowRef);
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

  test("crossing a threshold pays its reward once", async () => {
    expect.hasAssertions();

    const statue: StatueLandmark = {
      areaId: AREA_ID,
      heightOffset: 0,
      id: "first-statue",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 0, z: 0 },
      rotation: 0,
    };
    vi.mocked(readRegionData).mockResolvedValue({
      enemyCamps: [],
      id: REGION_ID,
      landmarks: [statue],
      residents: [],
      waterfalls: [],
    });
    vi.mocked(readMondstadtExplorationAreas).mockResolvedValue([
      {
        areaId: AREA_ID,
        doings: [{ id: WAYPOINT_ID, kind: ExplorationKind.Waypoint, weight: WAYPOINT_WEIGHT }],
        total: TOTAL,
      },
    ]);
    vi.mocked(readMondstadtReputation).mockResolvedValue({
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
    });
    const reputation = shallowRef({ exp: 0, level: 1 });
    const wallet = ref(EMPTY_WALLET);
    const { activateLandmark } = useWorldMap({
      catalogue: { regions: [{ areas: [], id: REGION_ID, name: "First Region" }] },
      events: createWorldEvents(),
      gainWorldAdventureExp: vi.fn<(amount: number) => void>(),
      gameDataBaseUrl: "game-data",
      regionDataBaseUrl: "region-data",
      reputation,
      setReputation: (nextReputation) => {
        reputation.value = nextReputation;
      },
      setWallet: (nextWallet) => {
        wallet.value = nextWallet;
      },
      unlockedLandmarkIds: new Set<string>(),
      wallet,
    });
    // The areas, the regions and the Reputation are read in the background, so the reads settle before the unlock
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    activateLandmark(statue.id);

    expect(reputation.value).toStrictEqual({ exp: REWARD_EXP, level: 1 });
    expect(wallet.value).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: REWARD_MORA });
  });
});
