import type { ChestPlace } from "#src/models/chest/ChestPlace";

import { ChestKind } from "#src/models/chest/ChestKind";
import { findTreasureCompassTarget } from "#src/services/gadget/findTreasureCompassTarget";
import { describe, expect, test } from "vitest";

const chest = (id: string, x: number, z: number): ChestPlace => ({ id, kind: ChestKind.Common, position: { x, z } });

describe(findTreasureCompassTarget, () => {
  // A city of 100 by 100 units under its one outline
  const cityOutlines = [
    [
      { x: 0, z: 0 },
      { x: 100, z: 0 },
      { x: 100, z: 100 },
      { x: 0, z: 100 },
    ],
  ];
  const inside = chest("inside", 10, 10);
  const farther = chest("farther", 50, 50);
  const outside = chest("outside", 5, -5);
  const opened = chest("opened", 1, 1);
  const chestPlaces = [inside, farther, outside, opened];
  const player = { x: 0, z: 0 };

  test("a compass points to the nearest box in its city", () => {
    expect.hasAssertions();

    expect(findTreasureCompassTarget(chestPlaces, cityOutlines, new Set([opened.id]), player)).toBe(inside);
    expect(findTreasureCompassTarget(chestPlaces, cityOutlines, new Set([opened.id, inside.id]), player)).toBe(farther);
    expect(findTreasureCompassTarget(chestPlaces, cityOutlines, new Set(), player)).toBe(opened);
  });

  test("a compass points to nothing once every box in its city is opened", () => {
    expect.hasAssertions();

    expect(
      findTreasureCompassTarget(chestPlaces, cityOutlines, new Set([inside.id, farther.id, opened.id]), player),
    ).toBeUndefined();
  });
});
