import type { Expedition } from "#src/models/expedition/Expedition";
import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { claimExpedition } from "#src/services/expedition/claimExpedition";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { ItemCategory } from "genshin-interface";
import { ENGLISH_GAME_TEXT, GameLanguage, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

const englishNameText = await NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL);

const random = (): number => 0;

describe(claimExpedition, () => {
  const CHARACTER_ID = 10_000_001;
  const PLACE_ID = 106;
  const HOURS = 4;
  const MORA_COUNT = 625;
  const IRON_CHUNK_ITEM_ID = 101_001;
  const place: ExpeditionPlace = {
    durations: [{ hours: HOURS, items: [{ itemId: MORA_ITEM_ID, maxCount: MORA_COUNT, minCount: MORA_COUNT }] }],
    id: PLACE_ID,
    nameTextId: GameTextKey.StormterrorsLair,
    questId: "",
    rankLevel: 20,
    statuePointId: 0,
  };
  const leftAt = Temporal.Instant.fromEpochMilliseconds(0);
  const expeditions: Expedition[] = [{ characterId: CHARACTER_ID, hours: HOURS, leftAt, placeId: PLACE_ID }];
  const returnedAt = leftAt.add({ hours: HOURS });

  test("should refuse a claim before the expedition's time is out", () => {
    expect.hasAssertions();

    expect(
      claimExpedition(
        expeditions,
        CHARACTER_ID,
        place,
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        englishNameText,
        returnedAt.subtract({ nanoseconds: 1 }),
        random,
      ),
    ).toBeUndefined();
  });

  test("should take an item into the bag at a count drawn from its range, named by the game text", () => {
    expect.hasAssertions();

    const ironChunkPlace: ExpeditionPlace = {
      ...place,
      durations: [{ hours: HOURS, items: [{ itemId: IRON_CHUNK_ITEM_ID, maxCount: 5, minCount: 4 }] }],
    };

    expect(
      claimExpedition(
        expeditions,
        CHARACTER_ID,
        ironChunkPlace,
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        englishNameText,
        returnedAt,
        random,
      )?.inventory.items,
    ).toStrictEqual([
      {
        definition: {
          category: ItemCategory.Material,
          id: IRON_CHUNK_ITEM_ID,
          name: ENGLISH_GAME_TEXT[GameTextKey.IronChunk],
          rank: 301,
          rarity: 0,
          stackLimit: 99_999,
        },
        id: 0,
        quantity: 4,
      },
    ]);
  });

  test("should give a returned expedition's Mora and take the expedition off the list", () => {
    expect.hasAssertions();

    expect(
      claimExpedition(
        expeditions,
        CHARACTER_ID,
        place,
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        englishNameText,
        returnedAt,
        random,
      ),
    ).toStrictEqual({
      expeditions: [],
      inventory: EMPTY_INVENTORY,
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: MORA_COUNT },
    });
  });
});
