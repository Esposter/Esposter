import type { InteractableDirectionMap } from "@/services/dungeons/world/InteractiveObjectPositionComparator";
import { InteractiveObjectPositionComparator } from "@/services/dungeons/world/InteractiveObjectPositionComparator";
import { usePlayerStore } from "@/store/dungeons/world/player";
import type { Position } from "grid-engine";
import { Direction } from "grid-engine";
// We have to assume that only the unit position is passed in
export const useFindInteractiveObject = <T extends Position>(
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
  return objects.find((o) =>
    InteractiveObjectPositionComparator(position.value, direction.value, o, interactableDirectionMap),
  );
};
