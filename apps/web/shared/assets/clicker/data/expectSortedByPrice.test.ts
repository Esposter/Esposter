import { describe, expect } from "vitest";

// A category's upgrades and buildings are declared in unlock order, which runs in ascending price. The merged upgrade
// map is not one of these: it lists two categories, each on its own price scale, so it is never passed here
export const expectSortedByPrice = (prices: number[]): void => {
  expect(prices).toStrictEqual(prices.toSorted((firstPrice, secondPrice) => firstPrice - secondPrice));
};

describe.todo("expectSortedByPrice");
