import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssFloorReward } from "#src/models/spiralAbyss/AbyssFloorReward";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { AbyssStarConditionKind } from "#src/models/spiralAbyss/AbyssStarConditionKind";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { settleAbyssClear } from "#src/services/spiralAbyss/settleAbyssClear";
import { describe, expect, test } from "vitest";

describe(settleAbyssClear, () => {
  const CHAMBER_ID = 1;
  const REWARD_ID = 101;
  const MATERIAL_ID = 3;
  const MATERIAL_NAME_TEXT_ID = "4";
  const MATERIAL_STACK_LIMIT = 2;
  const PRIMOGEM_COUNT = 5;
  const PRIMOGEM_ITEM_ID = CurrencyItemIdMap[Currency.Primogem];
  const names = { [MATERIAL_NAME_TEXT_ID]: "Made-up Ore" };
  const materialDataMap = new Map<number, MaterialData>([
    [
      MATERIAL_ID,
      {
        id: MATERIAL_ID,
        materialType: MaterialType.Exchange,
        nameTextId: MATERIAL_NAME_TEXT_ID,
        rank: 1,
        rarity: 1,
        stackLimit: MATERIAL_STACK_LIMIT,
      },
    ],
  ]);
  const definition = getItemDefinition(MATERIAL_ID, names, materialDataMap);
  const chamber: AbyssChamber = {
    conditions: [{ kind: AbyssStarConditionKind.LeftTime, threshold: 90 }],
    id: CHAMBER_ID,
    index: 1,
  };
  const floor: AbyssFloor = { chambers: [chamber], id: 1, index: 1, teamCount: 1, unlockStarCount: 6 };
  const reward: AbyssFloorReward = {
    chamberRewardIds: [REWARD_ID],
    floorIndex: 1,
    nineStarRewardId: 203,
    rewardGroup: 1,
    sixStarRewardId: 202,
    threeStarRewardId: 201,
  };
  const challenge: AbyssChallenge = { defeatedHalfCount: 1, halfCount: 1, monolithPercent: undefined, secondsLeft: 0 };
  const emptyProgress: AbyssProgress = { chamberIdProgressMap: new Map(), claimedRewardIds: new Set() };

  test("a clear pays the rewards it gives for the first time and records the chamber's progress", () => {
    expect.hasAssertions();

    expect(
      settleAbyssClear({
        challenge,
        chamber,
        characterIdMemberMap: new Map(),
        floor,
        inventory: EMPTY_INVENTORY,
        materialDataMap,
        names,
        progress: emptyProgress,
        reward,
        rewardItems: { [REWARD_ID]: [{ count: PRIMOGEM_COUNT, itemId: PRIMOGEM_ITEM_ID }] },
        wallet: EMPTY_WALLET,
      }),
    ).toStrictEqual({
      carry: [],
      inventory: EMPTY_INVENTORY,
      progress: {
        chamberIdProgressMap: new Map([[CHAMBER_ID, { isCleared: true, stars: 0 }]]),
        claimedRewardIds: new Set([REWARD_ID]),
      },
      wallet: { ...EMPTY_WALLET, [Currency.Primogem]: PRIMOGEM_COUNT },
    });
  });

  test("a clear whose rewards the bag has no room for is refused, and its progress is not recorded", () => {
    expect.hasAssertions();

    const { inventory: fullInventory } = addInventoryItem(EMPTY_INVENTORY, definition, MATERIAL_STACK_LIMIT);

    expect(
      settleAbyssClear({
        challenge,
        chamber,
        characterIdMemberMap: new Map(),
        floor,
        inventory: fullInventory,
        materialDataMap,
        names,
        progress: emptyProgress,
        reward,
        rewardItems: { [REWARD_ID]: [{ count: 1, itemId: MATERIAL_ID }] },
        wallet: EMPTY_WALLET,
      }),
    ).toBeUndefined();
  });
});
