import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { ItemCategory } from "genshin-interface";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

const englishNameText = await NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL);

describe(getItemDefinition, () => {
  const BILLET_ID = 101_101;

  test("names a billet from the name-text chunks by its text id", () => {
    expect.hasAssertions();
    expect(getItemDefinition(BILLET_ID, englishNameText)).toStrictEqual({
      category: ItemCategory.Material,
      id: BILLET_ID,
      name: "Northlander Sword Billet",
      rank: 300,
      rarity: 4,
      stackLimit: 1000,
    });
  });
});
