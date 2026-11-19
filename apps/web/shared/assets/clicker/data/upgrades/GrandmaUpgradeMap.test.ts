import { expectSortedByPrice } from "#shared/assets/clicker/data/expectSortedByPrice.test";
import { GrandmaUpgradeMap } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { describe, expect, test } from "vitest";

describe("grandmaUpgradeMap", () => {
  test("is sorted by price", () => {
    expect.hasAssertions();

    const prices = Object.values(GrandmaUpgradeMap).map(({ price }) => price);

    expectSortedByPrice(prices);
  });
});
