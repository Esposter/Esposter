import { CRAFTING_KEEPER_BENCH_OFFSET_METRES } from "#src/services/genshinAssets/crafting/constants";
import { toCraftingKeeperPlace } from "#src/services/genshinAssets/crafting/toCraftingKeeperPlace";
import { SceneGroupSource } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toCraftingKeeperPlace, () => {
  test("the keeper stands beside the bench, turned as the bench is", () => {
    expect.hasAssertions();

    const benchX = 10;
    const benchZ = 20;
    const rotationY = 90;

    expect(
      toCraftingKeeperPlace({ position: { x: benchX, z: benchZ }, rotationY, source: SceneGroupSource.NpcBirths }),
    ).toStrictEqual({
      position: { x: benchX + CRAFTING_KEEPER_BENCH_OFFSET_METRES, z: benchZ },
      rotationY,
      source: SceneGroupSource.NpcBirths,
    });
  });
});
