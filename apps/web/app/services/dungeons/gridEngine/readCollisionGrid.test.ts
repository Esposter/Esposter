import type { CollisionLayer } from "#src/models/dungeons/tilemap/CollisionLayer";

import { readCollisionGrid } from "#src/services/dungeons/gridEngine/readCollisionGrid";
import { GridEngineErrorKind } from "grid-engine-headless";
import { err, ok } from "neverthrow";
import { describe, expect, test } from "vitest";

describe(readCollisionGrid, () => {
  const COLLISION_LAYER_NAME = "Collision";
  const GROUND_LAYER_NAME = "Ground";

  test("a blocking tile blocks, an open tile is open, and no tile is absent", () => {
    expect.hasAssertions();

    const layers: CollisionLayer[] = [
      { hasTilemapLayer: true, name: GROUND_LAYER_NAME, tiles: [[true, false, undefined]] },
    ];

    expect(readCollisionGrid(layers)).toStrictEqual(ok([[true, false, undefined]]));
  });

  test("a tile on any layer blocks, and a position with no tile on any layer is absent", () => {
    expect.hasAssertions();

    const layers: CollisionLayer[] = [
      { hasTilemapLayer: true, name: GROUND_LAYER_NAME, tiles: [[false, undefined, undefined]] },
      { hasTilemapLayer: true, name: COLLISION_LAYER_NAME, tiles: [[undefined, true, undefined]] },
    ];

    expect(readCollisionGrid(layers)).toStrictEqual(ok([[false, true, undefined]]));
  });

  test("a tilemap with no layers reads no collision (#352)", () => {
    expect.hasAssertions();

    expect(readCollisionGrid([])).toStrictEqual(ok([]));
  });

  test("a layer that was never drawn is refused by its name (#428)", () => {
    expect.hasAssertions();

    const layers: CollisionLayer[] = [
      { hasTilemapLayer: true, name: GROUND_LAYER_NAME, tiles: [[false]] },
      { hasTilemapLayer: false, name: COLLISION_LAYER_NAME, tiles: [[true]] },
    ];

    expect(readCollisionGrid(layers)).toStrictEqual(
      err({ kind: GridEngineErrorKind.InvalidGrid, layer: COLLISION_LAYER_NAME }),
    );
  });
});
