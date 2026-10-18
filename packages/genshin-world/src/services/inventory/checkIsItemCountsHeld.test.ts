import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { checkIsItemCountsHeld } from "#src/services/inventory/checkIsItemCountsHeld";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createDefinition = (id: number): ItemDefinition => ({
  category: ItemCategory.Material,
  id,
  name: "",
  rank: 0,
  rarity: 0,
  stackLimit: 99,
});

describe(checkIsItemCountsHeld, () => {
  const ITEM_ID = 104_323;
  const createBag = (quantity: number) => [{ definition: createDefinition(ITEM_ID), id: 1, quantity }];

  test("should hold a set that names one item twice when the bag covers their sum", () => {
    expect.hasAssertions();

    expect(
      checkIsItemCountsHeld(
        createBag(6),
        [
          { count: 3, id: ITEM_ID },
          { count: 3, id: ITEM_ID },
        ],
        1,
      ),
    ).toBe(true);
  });

  test("should be refused where the bag covers each count alone but not their sum", () => {
    expect.hasAssertions();

    expect(
      checkIsItemCountsHeld(
        createBag(5),
        [
          { count: 3, id: ITEM_ID },
          { count: 3, id: ITEM_ID },
        ],
        1,
      ),
    ).toBe(false);
  });

  test("should be refused where the bag holds too few for every time the set is taken", () => {
    expect.hasAssertions();

    expect(checkIsItemCountsHeld(createBag(5), [{ count: 2, id: ITEM_ID }], 3)).toBe(false);
  });
});
