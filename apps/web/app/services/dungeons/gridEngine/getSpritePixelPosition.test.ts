import type { SpritePlacement } from "#src/models/dungeons/scene/world/SpritePlacement";

import { getSpritePixelPosition } from "#src/services/dungeons/gridEngine/getSpritePixelPosition";
import { Direction } from "grid-engine-headless";
import { describe, expect, test } from "vitest";

describe(getSpritePixelPosition, () => {
  const TILE_SIZE = 16;
  const SPRITE_SIZE = 8;
  const NO_OFFSET = { x: 0, y: 0 };
  const placement = (overrides: Partial<SpritePlacement>): SpritePlacement => ({
    customOffset: NO_OFFSET,
    displayHeight: SPRITE_SIZE,
    displayWidth: SPRITE_SIZE,
    facing: Direction.Down,
    position: { x: 0, y: 0 },
    progress: 0,
    tileHeight: TILE_SIZE,
    tileWidth: TILE_SIZE,
    ...overrides,
  });

  test.each([
    [
      "a sprite with no custom offset is placed by the grid alone, centred and bottom aligned (#306)",
      placement({}),
      { x: 4, y: 8 },
    ],
    ["the custom offset is added to the grid placement", placement({ customOffset: { x: 3, y: -2 } }), { x: 7, y: 6 }],
    ["a sprite on a later tile moves by whole tiles", placement({ position: { x: 2, y: 1 } }), { x: 36, y: 24 }],
    [
      "a step covers its share of the tile towards its facing",
      placement({ facing: Direction.Right, progress: 500 }),
      { x: 12, y: 8 },
    ],
    ["an odd sprite width is floored before it is centred", placement({ displayWidth: 9 }), { x: 4, y: 8 }],
  ])("%s", (_title, input, expected) => {
    expect.hasAssertions();

    expect(getSpritePixelPosition(input)).toStrictEqual(expected);
  });
});
