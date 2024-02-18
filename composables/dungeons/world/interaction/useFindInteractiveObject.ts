import { getObjectUnitPosition } from "@/services/dungeons/tilemap/getObjectUnitPosition";
import {
  InteractiveObjectPositionComparator,
  type InteractableDirectionMap,
} from "@/services/dungeons/world/InteractiveObjectPositionComparator";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { Direction, type Position } from "grid-engine";
// It's a little annoying but we have to assume that only the pixel position
// is passed in to make life easier and we will convert it to the unit position automatically
export const useFindInteractiveObject = <T extends Partial<Position>>(
  objects: T[],
  interactableDirectionMap: InteractableDirectionMap = {
    [Direction.UP]: true,
    [Direction.DOWN]: true,
    [Direction.LEFT]: true,
    [Direction.RIGHT]: true,
  },
) => {
  const playerStore = usePlayerStore();
  const { position, direction } = storeToRefs(playerStore);
  return objects.find((o) => {
    if (o.x === undefined || o.y === undefined) return;
    return InteractiveObjectPositionComparator(
      position.value,
      direction.value,
      getObjectUnitPosition({ x: o.x, y: o.y }),
      interactableDirectionMap,
    );
  });
};
