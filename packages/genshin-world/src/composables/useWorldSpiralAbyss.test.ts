import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssFloorReward } from "#src/models/spiralAbyss/AbyssFloorReward";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";
import type { readAbyssBenedictionChoices as readAbyssBenedictionChoicesFn } from "#src/services/spiralAbyss/readAbyssBenedictionChoices";
import type { readAbyssEnemyKinds as readAbyssEnemyKindsFn } from "#src/services/spiralAbyss/readAbyssEnemyKinds";
import type { readAbyssFloorRewards as readAbyssFloorRewardsFn } from "#src/services/spiralAbyss/readAbyssFloorRewards";
import type { readAbyssFloors as readAbyssFloorsFn } from "#src/services/spiralAbyss/readAbyssFloors";
import type { readAbyssPeriods as readAbyssPeriodsFn } from "#src/services/spiralAbyss/readAbyssPeriods";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldSpiralAbyss } from "#src/composables/useWorldSpiralAbyss";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { Currency } from "#src/models/inventory/Currency";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readAbyssFloorRewards } from "#src/services/spiralAbyss/readAbyssFloorRewards";
import { readAbyssPeriods } from "#src/services/spiralAbyss/readAbyssPeriods";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { createParty } from "#src/services/party/createParty";
import { flushReads } from "#src/services/shared/flushReads.test";
import { GAME_TIME_ZONE } from "#src/services/time/constants";
import { startTestWorldParty } from "#src/store/party.fixture";
import { startTestWorldSession } from "#src/store/session.fixture";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

vi.mock(import("#src/services/spiralAbyss/readAbyssPeriods"), () => ({
  readAbyssPeriods: vi.fn<typeof readAbyssPeriodsFn>(() => Promise.resolve([period])),
}));
vi.mock(import("#src/services/spiralAbyss/readAbyssFloors"), () => ({
  readAbyssFloors: vi.fn<typeof readAbyssFloorsFn>(() => Promise.resolve([floor])),
}));
vi.mock(import("#src/services/spiralAbyss/readAbyssEnemyKinds"), () => ({
  readAbyssEnemyKinds: vi.fn<typeof readAbyssEnemyKindsFn>(() =>
    Promise.resolve({ [DESCRIBE_ID]: EnemyKindId.HilichurlFighter }),
  ),
}));
vi.mock(import("#src/services/spiralAbyss/readAbyssBenedictionChoices"), () => ({
  readAbyssBenedictionChoices: vi.fn<typeof readAbyssBenedictionChoicesFn>(() => Promise.resolve({})),
}));
vi.mock(import("#src/services/spiralAbyss/readAbyssFloorRewards"), () => ({
  readAbyssFloorRewards: vi.fn<typeof readAbyssFloorRewardsFn>(() =>
    Promise.resolve({
      floorRewards: [otherGroupReward, reward],
      rewardItems: {
        [OTHER_REWARD_ID]: [{ count: OTHER_PRIMOGEM_COUNT, itemId: PRIMOGEM_ITEM_ID }],
        [REWARD_ID]: [{ count: PRIMOGEM_COUNT, itemId: PRIMOGEM_ITEM_ID }],
      },
    }),
  ),
}));

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const CHAMBER_ID = 1;
const DESCRIBE_ID = 10_101;
const FLOOR_ID = 1001;
const FLOOR_INDEX = 9;
const MONSTER_LEVEL = 24;
const OTHER_PRIMOGEM_COUNT = 3;
const OTHER_REWARD_ID = 102;
const PERIOD_ID = 1;
const PERIOD_REWARD_GROUP = 2;
const PRIMOGEM_COUNT = 5;
const PRIMOGEM_ITEM_ID = CurrencyItemIdMap[Currency.Primogem];
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
  rewardGroup: PERIOD_REWARD_GROUP,
  startsAt: gameWallClock(NOW.subtract({ hours: 24 })),
};
// The period's reward group pays, not the first group the record holds for the floor, which sorts before it
const reward: AbyssFloorReward = {
  chamberRewardIds: [REWARD_ID],
  floorIndex: FLOOR_INDEX,
  nineStarRewardId: 203,
  rewardGroup: PERIOD_REWARD_GROUP,
  sixStarRewardId: 202,
  threeStarRewardId: 201,
};
const otherGroupReward: AbyssFloorReward = { ...reward, chamberRewardIds: [OTHER_REWARD_ID], rewardGroup: 1 };

describe(useWorldSpiralAbyss, () => {
  const AREA_ID = "area";

  test("reads the tables as the entrance first opens, once, and holds them after", async () => {
    expect.hasAssertions();
    const worldSessionStore = startTestWorldSession(
      { gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL, getWorldNow: () => NOW },
      { inventory: { ...EMPTY_INVENTORY }, wallet: { ...EMPTY_WALLET } },
    );
    startTestWorldParty({ party: createParty([TRAVELER_CHARACTER_ID]) });
    const abyss = useWorldSpiralAbyss({ areaId: AREA_ID, bonusLines: shallowRef([]), savedProgressMap: new Map() });
    await flushReads();

    expect(readAbyssPeriods).not.toHaveBeenCalled();

    abyss.openAbyssEntrance();
    await flushReads();
    abyss.openAbyssEntrance();
    await flushReads();

    expect(readAbyssPeriods).toHaveBeenCalledExactlyOnceWith(worldSessionStore.gameDataBaseUrl);
    expect(readAbyssFloorRewards).toHaveBeenCalledExactlyOnceWith(worldSessionStore.gameDataBaseUrl);
  });

  test("a Moon Spire chamber's clear is recorded in its period's cycle, and its period's group pays", async () => {
    expect.hasAssertions();
    const worldSessionStore = startTestWorldSession(
      { gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL, getWorldNow: () => NOW },
      { inventory: { ...EMPTY_INVENTORY }, wallet: { ...EMPTY_WALLET } },
    );
    const { events } = worldSessionStore;
    startTestWorldParty({ party: createParty([TRAVELER_CHARACTER_ID]) });
    const abyss = useWorldSpiralAbyss({ areaId: AREA_ID, bonusLines: shallowRef([]), savedProgressMap: new Map() });
    await flushReads();

    abyss.openAbyssEntrance();
    await flushReads();
    abyss.enterAbyssChamber(FLOOR_ID, CHAMBER_ID);
    const camp = takeOne(abyss.abyssCamps.value);
    events.emit("defeatEnemy", createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, camp.id));

    expect(abyss.abyssProgressMap.value.get(String(PERIOD_ID))).toStrictEqual({
      chamberIdProgressMap: new Map([[CHAMBER_ID, { isCleared: true, stars: 0 }]]),
      claimedRewardIds: new Set([REWARD_ID]),
    });
    expect(worldSessionStore.wallet).toStrictEqual({ ...EMPTY_WALLET, [Currency.Primogem]: PRIMOGEM_COUNT });
    expect(worldSessionStore.inventory).toStrictEqual(EMPTY_INVENTORY);
    expect(abyss.abyssCamps.value).toStrictEqual([]);
  });
});
