import { Buildings } from "#shared/assets/clicker/data/BuildingMap";
import { expectSortedByPrice } from "#shared/assets/clicker/data/expectSortedByPrice.test";
import { describe, expect, test } from "vitest";

describe("buildingMap", () => {
  test("is sorted by price", () => {
    expect.hasAssertions();

    const prices = Buildings.map(({ basePrice }) => basePrice);

    expectSortedByPrice(prices);
  });
});
