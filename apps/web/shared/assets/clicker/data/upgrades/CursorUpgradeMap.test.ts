import { expectSortedByPrice } from "#shared/assets/clicker/data/expectSortedByPrice.test";
import { CursorUpgradeMap } from "#shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { describe, expect, test } from "vitest";

describe("cursorUpgradeMap", () => {
  test("is sorted by price", () => {
    expect.hasAssertions();

    const prices = Object.values(CursorUpgradeMap).map(({ price }) => price);

    expectSortedByPrice(prices);
  });
});
