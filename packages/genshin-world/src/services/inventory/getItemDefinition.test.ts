import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);

describe(getItemDefinition, () => {
  const BILLET_ID = 101_101;

  test("names a billet from the name-text chunks by its text id", () => {
    expect.hasAssertions();
    expect(getItemDefinition(BILLET_ID, englishNameText, materialDataMap)).toStrictEqual({
      category: ItemCategory.Material,
      id: BILLET_ID,
      name: "Northlander Sword Billet",
      rank: 300,
      rarity: 4,
      stackLimit: 1000,
    });
  });
});
