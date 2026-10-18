import type { ChestPlace } from "#src/models/chest/ChestPlace";

import { ChestKind } from "#src/models/chest/ChestKind";
import { findTreasureCompassTarget } from "#src/services/gadget/findTreasureCompassTarget";
import { describe, expect, test } from "vitest";

const chest = (id: string, x: number, z: number): ChestPlace => ({ id, kind: ChestKind.Common, position: { x, z } });

describe(findTreasureCompassTarget, () => {
  // The chests of the region the compass's city joins, one of them opened already
  const inside = chest("inside", 10, 10);
  const farther = chest("farther", 50, 50);
  const opened = chest("opened", 1, 1);
  const chestPlaces = [inside, farther, opened];
  const player = { x: 0, z: 0 };

  test("a compass points to the nearest box in its city", () => {
    expect.hasAssertions();

    expect(findTreasureCompassTarget(chestPlaces, new Set([opened.id]), player)).toBe(inside);
    expect(findTreasureCompassTarget(chestPlaces, new Set([inside.id, opened.id]), player)).toBe(farther);
    expect(findTreasureCompassTarget(chestPlaces, new Set(), player)).toBe(opened);
  });

  test("a compass points to nothing once every box in its city is opened", () => {
    expect.hasAssertions();

    expect(findTreasureCompassTarget(chestPlaces, new Set([farther.id, inside.id, opened.id]), player)).toBeUndefined();
  });
});
