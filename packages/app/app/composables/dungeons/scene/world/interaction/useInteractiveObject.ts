import type { InteractableDirectionMap } from "@/models/dungeons/direction/InteractableDirectionMap";
import type { Position } from "grid-engine";

import { DEFAULT_INTERACTABLE_DIRECTION_MAP } from "@/services/dungeons/direction/constants";
import { checkIsInteractiveObjectPosition } from "@/services/dungeons/scene/world/interaction/checkIsInteractiveObjectPosition";
import { usePlayerStore } from "@/store/dungeons/player";
// Positions are assumed to be unit positions, which nothing in the type can state
export const useInteractiveObject = <T extends Position>(
  objects: T[],
  interactableDirectionMap: InteractableDirectionMap = DEFAULT_INTERACTABLE_DIRECTION_MAP,
) => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  return objects.find((object) =>
    checkIsInteractiveObjectPosition(player.value.position, player.value.direction, object, interactableDirectionMap),
  );
};
