import type { Tilemaps } from "phaser";

import { readCollisionGrid } from "#src/services/dungeons/gridEngine/readCollisionGrid";
import { readCollisionLayers } from "#src/services/dungeons/gridEngine/readCollisionLayers";
import { createGridEngine } from "grid-engine-headless";

// A tilemap's engine: its layers' collision read as one grid, so a blocking tile on any layer blocks the position it covers
export const createWorldGridEngine = (tilemap: Tilemaps.Tilemap) =>
  readCollisionGrid(readCollisionLayers(tilemap)).andThen((tiles) => createGridEngine({ tiles }));
