import {
  InteractiveObjectPositionComparator,
  type ValidDirectionMap,
} from "@/services/dungeons/world/InteractiveObjectPositionComparator";
import { TILE_SIZE } from "@/services/dungeons/world/constants";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { type Position } from "grid-engine";
import { type Tilemaps } from "phaser";

export const useReadInteractiveObject = (objectLayer: Tilemaps.ObjectLayer, validDirectionMap: ValidDirectionMap) => {
  const playerStore = usePlayerStore();
  const { position, direction } = storeToRefs(playerStore);
  return objectLayer.objects.find((o) => {
    if (o.x === undefined || o.y === undefined) return;
    // Phaser objects in Tiled have y values set to the bottom of that tile
    // so we need to minus 1 to account for that
    const objectPosition: Position = { x: o.x / TILE_SIZE, y: o.y / TILE_SIZE - 1 };
    return InteractiveObjectPositionComparator(position.value, direction.value, objectPosition, validDirectionMap);
  });
};
