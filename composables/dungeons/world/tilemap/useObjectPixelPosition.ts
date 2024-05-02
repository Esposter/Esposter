import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Position } from "grid-engine";

export const useObjectPixelPosition = (pixelPosition: Position): Position => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);
  return {
    x: pixelPosition.x,
    // Phaser objects in Tiled have y values set to the bottom of that tile
    // so we need to minus 1 unit of tile height to account for that
    y: pixelPosition.y - tilemap.value.tileHeight,
  };
};
