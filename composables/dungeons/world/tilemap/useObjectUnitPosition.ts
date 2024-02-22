import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Position } from "grid-engine";

export const useObjectUnitPosition = (pixelPosition: Position): Position => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);
  return {
    x: pixelPosition.x / tilemap.value.tileWidth,
    // Phaser objects in Tiled have y values set to the bottom of that tile
    // so we need to minus 1 to account for that
    y: pixelPosition.y / tilemap.value.tileHeight - 1,
  };
};
