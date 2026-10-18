import { computeShopTabs } from "#src/services/shop/computeShopTabs";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

// The depot's sub tabs, by the table's sub tab ids the goods carry, and made-up names for them, which the test reads back
const TREASURE_TAB_ID = 1;
const FURNISHING_TAB_ID = 2;
const gameText = {
  ...ENGLISH_GAME_TEXT,
  [GameTextKey.RealmDepotTreasures]: "made up treasures",
  [GameTextKey.InventoryFurnishings]: "made up furnishings",
};

describe(computeShopTabs, () => {
  test("a shop's tabs are its goods' tabs in the order the goods list them, each named by its text", () => {
    expect.hasAssertions();

    expect(
      computeShopTabs(
        [{ tabId: FURNISHING_TAB_ID }, { tabId: TREASURE_TAB_ID }, { tabId: FURNISHING_TAB_ID }],
        gameText,
      ),
    ).toStrictEqual([
      { id: FURNISHING_TAB_ID, name: gameText[GameTextKey.InventoryFurnishings] },
      { id: TREASURE_TAB_ID, name: gameText[GameTextKey.RealmDepotTreasures] },
    ]);
  });

  test("a shop whose goods carry no tab has none", () => {
    expect.hasAssertions();

    expect(computeShopTabs([{}, {}], gameText)).toStrictEqual([]);
  });
});
