import type { InteractableDirectionMap } from "@/models/dungeons/direction/InteractableDirectionMap";
import type { Position } from "grid-engine";

import { DEFAULT_INTERACTABLE_DIRECTION_MAP } from "@/services/dungeons/direction/constants";
import { InteractiveObjectPositionComparator } from "@/services/dungeons/scene/world/interaction/InteractiveObjectPositionComparator";
import { usePlayerStore } from "@/store/dungeons/player";
// We have to assume that only the unit position is passed in
export const useGetInteractiveObject = <T extends Position>(
  objects: T[],
  interactableDirectionMap: InteractableDirectionMap = DEFAULT_INTERACTABLE_DIRECTION_MAP,
) => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  return objects.find((o) =>
    InteractiveObjectPositionComparator(player.value.position, player.value.direction, o, interactableDirectionMap),
  );
};
