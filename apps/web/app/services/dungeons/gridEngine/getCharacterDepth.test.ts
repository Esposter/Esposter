import { getCharacterDepth } from "#src/services/dungeons/gridEngine/getCharacterDepth";
import { describe, expect, test } from "vitest";

describe(getCharacterDepth, () => {
  const TILE_LAYER_COUNT = 3;

  test("a character at the top of the map draws over the top tile layer", () => {
    expect.hasAssertions();

    expect(getCharacterDepth(TILE_LAYER_COUNT, 0)).toBe(TILE_LAYER_COUNT - 1);
  });

  test("a character draws over the top tile layer by a share below one", () => {
    expect.hasAssertions();

    const depth = getCharacterDepth(TILE_LAYER_COUNT, 8);

    expect(depth).toBeGreaterThan(TILE_LAYER_COUNT - 1);
    expect(depth).toBeLessThan(TILE_LAYER_COUNT);
  });

  test("a character lower on the map draws in front of one higher up", () => {
    expect.hasAssertions();

    expect(getCharacterDepth(TILE_LAYER_COUNT, 48)).toBeGreaterThan(getCharacterDepth(TILE_LAYER_COUNT, 16));
  });
});
