import type { Position } from "grid-engine";

import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";

export const getObjectUnitPosition = (pixelPosition: Position): Position => ({
  x: pixelPosition.x / ExternalWorldSceneStore.tilemap.tileWidth,
  // Phaser objects in Tiled have y values set to the bottom of that tile
  // so we need to minus 1 to account for that
  y: pixelPosition.y / ExternalWorldSceneStore.tilemap.tileHeight - 1,
});
