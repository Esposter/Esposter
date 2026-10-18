import { createTileHolders } from "#src/services/world/createTileHolders";
import { describe, expect, test } from "vitest";

describe(createTileHolders, () => {
  test("a worker's error fails only the tiles it holds", () => {
    expect.hasAssertions();

    const tileHolders = createTileHolders(2);
    for (const key of [1, 2, 3, 4]) tileHolders.assign(key);

    expect(tileHolders.takeHeldKeys(0)).toStrictEqual([1, 3]);
    expect(tileHolders.checkIsHeldBy(2, 1)).toBe(true);
  });

  test("an answer from a worker that no longer holds the tile is refused", () => {
    expect.hasAssertions();

    const tileHolders = createTileHolders(2);
    tileHolders.assign(1);
    tileHolders.takeHeldKeys(0);
    tileHolders.assign(1);

    expect(tileHolders.checkIsHeldBy(1, 0)).toBe(false);
    expect(tileHolders.checkIsHeldBy(1, 1)).toBe(true);
  });
});
