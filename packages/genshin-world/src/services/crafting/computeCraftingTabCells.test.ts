import type { CraftingCell } from "genshin-interface";

import { MYSTIC_OFFERING_TAB_ID } from "#src/services/crafting/constants";
import { computeCraftingTabCells } from "#src/services/crafting/computeCraftingTabCells";
import { describe, expect, test } from "vitest";

describe(computeCraftingTabCells, () => {
  // Made-up recipe tabs, which the bench lists before the offering
  const recipeTabs: CraftingCell[] = [{ id: 1, name: "Enhancement" }];

  test("the bench lists the mystic offering after its recipe tabs from adventure rank 45", () => {
    expect.hasAssertions();

    expect(computeCraftingTabCells(recipeTabs, 45, "Offering")).toStrictEqual([
      { id: 1, name: "Enhancement" },
      { id: MYSTIC_OFFERING_TAB_ID, name: "Offering" },
    ]);
  });

  test("the bench lists no mystic offering below adventure rank 45", () => {
    expect.hasAssertions();

    expect(computeCraftingTabCells(recipeTabs, 44, "Offering")).toStrictEqual(recipeTabs);
  });
});
