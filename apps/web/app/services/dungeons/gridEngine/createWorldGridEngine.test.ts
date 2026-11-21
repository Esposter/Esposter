import type { Tilemaps } from "phaser";

import { LayerName } from "#shared/generated/tiled/layers/Home/LayerName";
import { TileProperty } from "#src/models/dungeons/tilemap/TileProperty";
import { createWorldGridEngine } from "#src/services/dungeons/gridEngine/createWorldGridEngine";
import { takeOne } from "@esposter/shared";
import { GridEngineErrorKind } from "grid-engine-headless";
import { err, ok } from "neverthrow";
import { describe, expect, test } from "vitest";

// A one-cell tilemap whose layers each hold one tile, or nothing where the layer has no tile at that cell
const createTilemap = (layers: { isDrawn: boolean; name: string; tile: boolean | null }[]) =>
  ({
    getTileAt: (_x: number, _y: number, _nonNull: boolean, layerIndex: number) => {
      const { tile } = takeOne(layers, layerIndex);
      if (tile === null) return null;
      return { properties: { [TileProperty.Collision]: tile } };
    },
    height: 1,
    layers: layers.map(({ isDrawn, name }) => ({ name, tilemapLayer: isDrawn ? {} : undefined })),
    width: 1,
  }) as unknown as Tilemaps.Tilemap;

describe(createWorldGridEngine, () => {
  const POSITION = { x: 0, y: 0 };

  test("a blocking tile on any layer blocks its position", () => {
    expect.hasAssertions();

    const tilemap = createTilemap([
      { isDrawn: true, name: LayerName.Ground, tile: false },
      { isDrawn: true, name: LayerName.Collision, tile: true },
    ]);

    expect(createWorldGridEngine(tilemap).map((gridEngine) => gridEngine.checkIsBlocked(POSITION))).toStrictEqual(
      ok(true),
    );
  });

  test("a position whose tiles are all open is open", () => {
    expect.hasAssertions();

    const tilemap = createTilemap([
      { isDrawn: true, name: LayerName.Ground, tile: false },
      { isDrawn: true, name: LayerName.Collision, tile: false },
    ]);

    expect(createWorldGridEngine(tilemap).map((gridEngine) => gridEngine.checkIsBlocked(POSITION))).toStrictEqual(
      ok(false),
    );
  });

  test("a layer that was never drawn is refused by its name", () => {
    expect.hasAssertions();

    const tilemap = createTilemap([{ isDrawn: false, name: LayerName.Ground, tile: false }]);

    expect(createWorldGridEngine(tilemap).map((gridEngine) => gridEngine.checkIsBlocked(POSITION))).toStrictEqual(
      err({ kind: GridEngineErrorKind.InvalidGrid, layer: LayerName.Ground }),
    );
  });
});
