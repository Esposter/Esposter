import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { TrialStage } from "#src/models/trial/TrialStage";

import { Currency } from "#src/models/inventory/Currency";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { claimTrialStageReward } from "#src/services/trial/claimTrialStageReward";
import { describe, expect, test } from "vitest";

describe(claimTrialStageReward, () => {
  const STAGE_ID = 51_001;
  const REWARD_ID = 480_001;
  const PRIMOGEM_COUNT = 20;
  const PRIMOGEM_ITEM_ID = CurrencyItemIdMap[Currency.Primogem];
  const stage: TrialStage = {
    dungeonId: 6131,
    id: STAGE_ID,
    rewardId: REWARD_ID,
    trialAvatarId: 1022,
    trialAvatarIndexId: 1,
  };
  const tables = {
    rewards: { [REWARD_ID]: [{ count: PRIMOGEM_COUNT, itemId: PRIMOGEM_ITEM_ID }] },
    stages: { [STAGE_ID]: stage },
  };
  const materialDataMap = new Map<number, MaterialData>();
  const names = {};

  test("a trial's first clear gives its reward once", () => {
    expect.hasAssertions();

    const firstClear = claimTrialStageReward(
      STAGE_ID,
      tables,
      new Set(),
      EMPTY_INVENTORY,
      EMPTY_WALLET,
      names,
      materialDataMap,
    );
    expect(firstClear).toStrictEqual({
      claimedStageIds: new Set([STAGE_ID]),
      inventory: EMPTY_INVENTORY,
      wallet: { ...EMPTY_WALLET, [Currency.Primogem]: PRIMOGEM_COUNT },
    });

    // The second clear, from the state the first left, pays nothing more
    expect(
      firstClear &&
        claimTrialStageReward(
          STAGE_ID,
          tables,
          firstClear.claimedStageIds,
          firstClear.inventory,
          firstClear.wallet,
          names,
          materialDataMap,
        ),
    ).toStrictEqual(firstClear);
  });

  test("a trial's later clear gives no reward", () => {
    expect.hasAssertions();

    expect(
      claimTrialStageReward(
        STAGE_ID,
        tables,
        new Set([STAGE_ID]),
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        names,
        materialDataMap,
      ),
    ).toStrictEqual({ claimedStageIds: new Set([STAGE_ID]), inventory: EMPTY_INVENTORY, wallet: EMPTY_WALLET });
  });
});
