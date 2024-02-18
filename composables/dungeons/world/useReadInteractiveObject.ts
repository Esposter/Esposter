import { getUnitPosition } from "@/services/dungeons/tilemap/getUnitPosition";
import {
  InteractiveObjectPositionComparator,
  type InteractableDirectionMap,
} from "@/services/dungeons/world/InteractiveObjectPositionComparator";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { type Tilemaps } from "phaser";

export const useReadInteractiveObject = (
  objectLayer: Tilemaps.ObjectLayer,
  interactableDirectionMap: InteractableDirectionMap,
) => {
  const playerStore = usePlayerStore();
  const { position, direction } = storeToRefs(playerStore);
  return objectLayer.objects.find((o) => {
    if (o.x === undefined || o.y === undefined) return;

    return InteractiveObjectPositionComparator(
      position.value,
      direction.value,
      getUnitPosition({ x: o.x, y: o.y }),
      interactableDirectionMap,
    );
  });
};
