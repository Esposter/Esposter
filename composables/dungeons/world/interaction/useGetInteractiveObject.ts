import type { InteractableDirectionMap } from "@/models/dungeons/direction/InteractableDirectionMap";
import { InteractiveObjectPositionComparator } from "@/services/dungeons/scene/world/InteractiveObjectPositionComparator";
import { usePlayerStore } from "@/store/dungeons/player";
import type { Position } from "grid-engine";
import { Direction } from "grid-engine";
// We have to assume that only the unit position is passed in
export const useGetInteractiveObject = <T extends Position>(
  objects: T[],
  interactableDirectionMap: InteractableDirectionMap = {
    [Direction.UP]: true,
    [Direction.DOWN]: true,
    [Direction.LEFT]: true,
    [Direction.RIGHT]: true,
  },
) => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  return objects.find((o) =>
    InteractiveObjectPositionComparator(player.value.position, player.value.direction, o, interactableDirectionMap),
  );
};
