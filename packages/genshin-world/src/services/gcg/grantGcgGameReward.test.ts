import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { GcgRewardState } from "#src/models/gcg/GcgRewardState";

import { MaterialType } from "#src/models/inventory/MaterialType";
import { GCG_LUCKY_COIN_ITEM_ID, GCG_PLAYER_EXP_ITEM_ID } from "#src/services/gcg/constants";
import { grantGcgGameReward } from "#src/services/gcg/grantGcgGameReward";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { describe, expect, test } from "vitest";

describe(grantGcgGameReward, () => {
  const LUCKY_COIN_NAME_TEXT_ID = "1";
  const LUCKY_COIN_NAME = "Lucky Coin";
  const GAME_ID = 1103;
  const PLAYER_EXP = 200;
  const LUCKY_COINS = 900;
  const NAMES = { [LUCKY_COIN_NAME_TEXT_ID]: LUCKY_COIN_NAME };
  const luckyCoinMaterial: MaterialData = {
    id: GCG_LUCKY_COIN_ITEM_ID,
    materialType: MaterialType.Consume,
    nameTextId: LUCKY_COIN_NAME_TEXT_ID,
    rank: 1,
    rarity: 1,
    stackLimit: 9999,
  };
  const MATERIAL_DATA_MAP = new Map([[GCG_LUCKY_COIN_ITEM_ID, luckyCoinMaterial]]);
  const EMPTY_STATE: GcgRewardState = {
    cardGameExp: 0,
    inventory: EMPTY_INVENTORY,
    rewardedGameIds: [],
    wallet: EMPTY_WALLET,
  };
  const REWARDS = [
    { count: PLAYER_EXP, id: GCG_PLAYER_EXP_ITEM_ID },
    { count: LUCKY_COINS, id: GCG_LUCKY_COIN_ITEM_ID },
  ];

  test("a won game pays its Player EXP into the card game and its Lucky Coins into the bag", () => {
    expect.hasAssertions();

    expect(grantGcgGameReward(EMPTY_STATE, GAME_ID, REWARDS, NAMES, MATERIAL_DATA_MAP)).toStrictEqual({
      cardGameExp: PLAYER_EXP,
      inventory: {
        items: [
          {
            definition: getItemDefinition(GCG_LUCKY_COIN_ITEM_ID, NAMES, MATERIAL_DATA_MAP),
            id: 0,
            quantity: LUCKY_COINS,
          },
        ],
        nextId: 1,
        quickSwapItemIds: [],
      },
      rewardedGameIds: [GAME_ID],
      wallet: EMPTY_WALLET,
    });
  });

  test("a game's reward is paid once, so a second win pays nothing", () => {
    expect.hasAssertions();

    const paid = grantGcgGameReward(EMPTY_STATE, GAME_ID, REWARDS, NAMES, MATERIAL_DATA_MAP);

    expect(grantGcgGameReward(paid, GAME_ID, REWARDS, NAMES, MATERIAL_DATA_MAP)).toStrictEqual(paid);
  });
});
