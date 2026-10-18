import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssFloorReward } from "#src/models/spiralAbyss/AbyssFloorReward";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { Currency } from "#src/models/inventory/Currency";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import { useWorldSpiralAbyss } from "#src/composables/useWorldSpiralAbyss";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { createParty } from "#src/services/party/createParty";
import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

vi.mock(import("#src/services/spiralAbyss/readAbyssPeriods"), () => ({
  readAbyssPeriods: () => Promise.resolve([period]),
}));
vi.mock(import("#src/services/spiralAbyss/readAbyssFloors"), () => ({
  readAbyssFloors: () => Promise.resolve([floor]),
}));
vi.mock(import("#src/services/spiralAbyss/readAbyssEnemyKinds"), () => ({
  readAbyssEnemyKinds: () => Promise.resolve({ [DESCRIBE_ID]: EnemyKindId.HilichurlFighter }),
}));
vi.mock(import("#src/services/spiralAbyss/readAbyssBenedictionChoices"), () => ({
  readAbyssBenedictionChoices: () => Promise.resolve({}),
}));
vi.mock(import("#src/services/spiralAbyss/readAbyssFloorRewards"), () => ({
  readAbyssFloorRewards: () =>
    Promise.resolve({
      floorRewards: [reward],
      rewardItems: { [REWARD_ID]: [{ count: PRIMOGEM_COUNT, itemId: PRIMOGEM_ITEM_ID }] },
    }),
}));

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const AREA_ID = "area";
const CHAMBER_ID = 1;
const DESCRIBE_ID = 10_101;
const FLOOR_ID = 1001;
const FLOOR_INDEX = 9;
const MONSTER_LEVEL = 24;
const PERIOD_ID = 1;
const PRIMOGEM_COUNT = 5;
const PRIMOGEM_ITEM_ID = 201;
const REWARD_ID = 101;
const NOW = Temporal.Instant.fromEpochMilliseconds(0);
const gameWallClock = (instant: Temporal.Instant) =>
  instant.toZonedDateTimeISO(GAME_TIME_ZONE).toPlainDateTime().toString();
const chamber: AbyssChamber = {
  conditions: [],
  halfMonsterDescribeIds: [[DESCRIBE_ID]],
  id: CHAMBER_ID,
  index: 1,
  monsterLevel: MONSTER_LEVEL,
};
const floor: AbyssFloor = { chambers: [chamber], id: FLOOR_ID, index: FLOOR_INDEX, teamCount: 1, unlockStarCount: 0 };
// A Moon Spire period covering the instant the test runs at, with the floor in it
const period: AbyssPeriod = {
  blessing: { descriptionTextHash: 0, icon: "", nameTextHash: 0 },
  closesAt: gameWallClock(NOW.add({ hours: 24 })),
  floorIds: [FLOOR_ID],
  id: PERIOD_ID,
  rewardGroup: 1,
  startsAt: gameWallClock(NOW.subtract({ hours: 24 })),
};
const reward: AbyssFloorReward = {
  chamberRewardIds: [REWARD_ID],
  floorIndex: FLOOR_INDEX,
  nineStarRewardId: 203,
  rewardGroup: 1,
  sixStarRewardId: 202,
  threeStarRewardId: 201,
};
// The reads resolve in microtasks, so one macrotask after the composable is made, every read has landed in its refs
const flushReads = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe(useWorldSpiralAbyss, () => {
  test("a Moon Spire chamber's clear is recorded in its period's cycle, and its rewards are paid", async () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const setInventory = vi.fn<(inventory: Inventory) => void>();
    const setWallet = vi.fn<(wallet: Wallet) => void>();
    const abyss = useWorldSpiralAbyss({
      areaId: AREA_ID,
      bonusLines: shallowRef([]),
      events,
      gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
      getWorldNow: () => NOW,
      inventory: shallowRef(EMPTY_INVENTORY),
      materialDataMap: new Map(),
      nameText: {},
      party: createParty([TRAVELER_CHARACTER_ID]),
      savedProgressMap: new Map(),
      setInventory,
      setWallet,
      wallet: shallowRef(EMPTY_WALLET),
    });
    await flushReads();

    abyss.openAbyssEntrance();
    abyss.enterAbyssChamber(FLOOR_ID, CHAMBER_ID);
    const [camp] = abyss.abyssCamps.value;
    events.emit("defeatEnemy", createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, camp.id));

    expect(abyss.abyssProgressMap.value.get(String(PERIOD_ID))).toStrictEqual({
      chamberIdProgressMap: new Map([[CHAMBER_ID, { isCleared: true, stars: 0 }]]),
      claimedRewardIds: new Set([REWARD_ID]),
    });
    expect(setWallet).toHaveBeenCalledWith({ ...EMPTY_WALLET, [Currency.Primogem]: PRIMOGEM_COUNT });
    expect(setInventory).toHaveBeenCalledWith(EMPTY_INVENTORY);
    expect(abyss.abyssCamps.value).toStrictEqual([]);
  });
});
