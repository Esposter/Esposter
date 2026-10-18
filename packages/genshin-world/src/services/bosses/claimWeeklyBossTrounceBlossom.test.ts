import type { MaterialData } from "#src/models/inventory/MaterialData";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { claimWeeklyBossTrounceBlossom } from "#src/services/bosses/claimWeeklyBossTrounceBlossom";
import {
  WEEKLY_BOSS_BILLET_ITEM_IDS,
  WEEKLY_BOSS_DREAM_SOLVENT_ITEM_ID,
  WEEKLY_BOSS_GEM_ITEM_IDS,
  WEEKLY_BOSS_MORA,
  WEEKLY_BOSS_TALENT_DROPS,
  WEEKLY_BOSS_TALENT_ITEM_IDS,
} from "#src/services/bosses/constants";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { computeBlossomClaimOffers } from "#src/services/originalResin/computeBlossomClaimOffers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(claimWeeklyBossTrounceBlossom, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const noQuest = new Set<string>();
  // The row a World Level reads, Domain Level VI, is the one of the constants that pays both a talent count and a chance
  const WORLD_LEVEL = 6;
  const ROW = 5;
  const TALENT_ITEM_ID = takeOne(WEEKLY_BOSS_TALENT_ITEM_IDS, 0);
  // Every item a draw can pay, since a zero draw hits each chance, so each one needs its material row to be granted
  const itemIds = [
    ...WEEKLY_BOSS_TALENT_ITEM_IDS,
    ...WEEKLY_BOSS_BILLET_ITEM_IDS,
    ...WEEKLY_BOSS_GEM_ITEM_IDS.flat(),
    WEEKLY_BOSS_DREAM_SOLVENT_ITEM_ID,
  ];
  const names: Readonly<Record<string, string>> = Object.fromEntries(
    itemIds.map((id) => [String(id), `Test Item ${id}`]),
  );
  const materialDataMap = new Map<number, MaterialData>(
    itemIds.map((id) => [
      id,
      { id, materialType: MaterialType.Exchange, nameTextId: String(id), rank: 0, rarity: 0, stackLimit: 99 },
    ]),
  );
  const claimOffer = takeOne(computeBlossomClaimOffers(BlossomKind.WeeklyBoss, 0), 0);

  test("a weekly boss's claim pays its talent materials and Mora", () => {
    expect.hasAssertions();

    const claim = claimWeeklyBossTrounceBlossom(
      adventureRankTables,
      { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 },
      EMPTY_INVENTORY,
      claimOffer,
      WORLD_LEVEL,
      0,
      noQuest,
      epoch,
      names,
      materialDataMap,
      () => 0,
    );

    expect(claim?.wallet[Currency.OriginalResin]).toBe(100 - claimOffer.resin);
    expect(claim?.wallet[Currency.Mora]).toBe(takeOne(WEEKLY_BOSS_MORA, ROW));
    expect(countInventoryItem(claim?.inventory.items ?? [], TALENT_ITEM_ID)).toBe(
      takeOne(WEEKLY_BOSS_TALENT_DROPS, ROW).count + 1,
    );
  });

  test("a weekly boss's claim the resin cannot pay is refused", () => {
    expect.hasAssertions();

    expect(
      claimWeeklyBossTrounceBlossom(
        adventureRankTables,
        { ...EMPTY_WALLET, [Currency.OriginalResin]: claimOffer.resin - 1 },
        EMPTY_INVENTORY,
        claimOffer,
        WORLD_LEVEL,
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
