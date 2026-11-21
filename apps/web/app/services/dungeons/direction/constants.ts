import type { InteractableDirectionMap } from "#src/models/dungeons/direction/InteractableDirectionMap";

import { Direction } from "grid-engine-headless";

// Most things can be interacted with from any side; a sign is the exception, being readable only from below
export const DEFAULT_INTERACTABLE_DIRECTION_MAP = Object.freeze({
  [Direction.Down]: true,
  [Direction.Left]: true,
  [Direction.Right]: true,
  [Direction.Up]: true,
} satisfies InteractableDirectionMap);
