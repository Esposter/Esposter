import type { InteractableDirectionMap } from "@/models/dungeons/direction/InteractableDirectionMap";

import { Direction } from "grid-engine";

// Most things can be interacted with from any side; a sign is the exception, being readable only from below
export const DEFAULT_INTERACTABLE_DIRECTION_MAP = Object.freeze({
  [Direction.DOWN]: true,
  [Direction.LEFT]: true,
  [Direction.RIGHT]: true,
  [Direction.UP]: true,
} satisfies InteractableDirectionMap);
