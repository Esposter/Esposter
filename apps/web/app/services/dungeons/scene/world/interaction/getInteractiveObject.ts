import type { InteractableDirectionMap } from "#src/models/dungeons/direction/InteractableDirectionMap";
import type { Position } from "grid-engine";

import { DEFAULT_INTERACTABLE_DIRECTION_MAP } from "#src/services/dungeons/direction/constants";
import { DirectionToGridDirectionMap } from "#src/services/dungeons/direction/DirectionToGridDirectionMap";
import { checkIsInteractiveObjectPosition } from "#src/services/dungeons/scene/world/interaction/checkIsInteractiveObjectPosition";
import { usePlayerStore } from "#src/store/dungeons/player";

// Positions are assumed to be unit positions, which nothing in the type can state
export const getInteractiveObject = <T extends Position>(
  objects: T[],
  interactableDirectionMap: InteractableDirectionMap = DEFAULT_INTERACTABLE_DIRECTION_MAP,
) => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  return objects.find((object) =>
    checkIsInteractiveObjectPosition(
      player.value.position,
      DirectionToGridDirectionMap[player.value.direction],
      object,
      interactableDirectionMap,
    ),
  );
};
