import type { CollisionLayer } from "#src/models/dungeons/tilemap/CollisionLayer";
import type { MissingTilemapLayerError } from "#src/models/dungeons/tilemap/MissingTilemapLayerError";
import type { GridEngineConfig } from "grid-engine-headless";
import type { Result } from "neverthrow";

import { readCollisionCell } from "#src/services/dungeons/gridEngine/readCollisionCell";
import { GridEngineErrorKind } from "grid-engine-headless";
import { err, ok } from "neverthrow";

// The collision grid of a tilemap's layers, read position by position across every layer. A tilemap with no layer reads
// No collision, and a layer that was never drawn is refused by its name, since its tiles cannot be read
export const readCollisionGrid = (
  layers: readonly CollisionLayer[],
): Result<GridEngineConfig["tiles"], MissingTilemapLayerError> => {
  const undrawnLayer = layers.find((layer) => !layer.hasTilemapLayer);
  if (undrawnLayer) return err({ kind: GridEngineErrorKind.InvalidGrid, layer: undrawnLayer.name });
  const [firstLayer] = layers;
  if (firstLayer === undefined) return ok([]);
  return ok(
    firstLayer.tiles.map((row, y) =>
      row.map((_cell, x) => readCollisionCell(layers.map((layer) => layer.tiles[y]?.[x]))),
    ),
  );
};
