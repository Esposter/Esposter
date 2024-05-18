import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Position } from "grid-engine";

export const getObjectUnitPosition = (pixelPosition: Position): Position => ({
  x: pixelPosition.x / ExternalWorldSceneStore.tilemap.tileWidth,
  // Phaser objects in Tiled have y values set to the bottom of that tile
  // so we need to minus 1 to account for that
  y: pixelPosition.y / ExternalWorldSceneStore.tilemap.tileHeight - 1,
});
