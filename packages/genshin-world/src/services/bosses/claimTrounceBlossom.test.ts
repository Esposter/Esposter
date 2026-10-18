import type { MaterialData } from "#src/models/inventory/MaterialData";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { claimTrounceBlossom } from "#src/services/bosses/claimTrounceBlossom";
import { NORMAL_BOSS_MORA, NORMAL_BOSS_UNIQUE_DROPS } from "#src/services/bosses/constants";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(claimTrounceBlossom, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const noQuest = new Set<string>();
  const UNIQUE_DROP_ID = 9003;
  const UNIQUE_DROP_NAME_TEXT_ID = "9003";
  const names: Readonly<Record<string, string>> = { [UNIQUE_DROP_NAME_TEXT_ID]: "Test Boss Drop" };
  const RESIN_CLAIM = 40;
  const materialDataMap = new Map<number, MaterialData>([
    [
      UNIQUE_DROP_ID,
      {
        id: UNIQUE_DROP_ID,
        materialType: MaterialType.Exchange,
        nameTextId: UNIQUE_DROP_NAME_TEXT_ID,
        rank: 0,
        rarity: 0,
        stackLimit: 99,
      },
    ],
  ]);

  test("a Trounce Blossom claim spends 40 Original Resin and pays its World Level's Mora and drop", () => {
    expect.hasAssertions();

    const claim = claimTrounceBlossom(
      adventureRankTables,
      { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 },
      EMPTY_INVENTORY,
      0,
      UNIQUE_DROP_ID,
      0,
      noQuest,
      epoch,
      names,
      materialDataMap,
      () => 0,
    );

    expect(claim?.wallet[Currency.OriginalResin]).toBe(100 - RESIN_CLAIM);
    expect(claim?.wallet[Currency.Mora]).toBe(takeOne(NORMAL_BOSS_MORA, 0));
    expect(countInventoryItem(claim?.inventory.items ?? [], UNIQUE_DROP_ID)).toBe(
      takeOne(NORMAL_BOSS_UNIQUE_DROPS, 0).count + 1,
    );
  });

  test("a claim with less than 40 Original Resin is refused", () => {
    expect.hasAssertions();

    expect(
      claimTrounceBlossom(
        adventureRankTables,
        { ...EMPTY_WALLET, [Currency.OriginalResin]: RESIN_CLAIM - 1 },
        EMPTY_INVENTORY,
        0,
        UNIQUE_DROP_ID,
        0,
        noQuest,
        epoch,
        names,
        materialDataMap,
        () => 0,
      ),
    ).toBeUndefined();
  });
});
