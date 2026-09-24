import { Buildings } from "#shared/assets/clicker/data/BuildingMap";
import { describe, expect, test } from "vitest";

describe("buildingMap", () => {
  test("is sorted by price", () => {
    expect.hasAssertions();

    const prices = Buildings.map(({ basePrice }) => basePrice);

    expect(prices).toStrictEqual(prices.toSorted((firstPrice, secondPrice) => firstPrice - secondPrice));
  });
});
