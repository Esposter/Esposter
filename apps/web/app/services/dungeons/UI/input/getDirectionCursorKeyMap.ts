import type { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import type { Input } from "phaser";

import { Direction } from "grid-engine";

// Four directions and no diagonals, on purpose (openspec/rejected/dungeons/diagonal-movement/design.md): one key per direction
export const getDirectionCursorKeyMap = (
  cursorKeys: BaseCursorKeys,
): Record<InteractableDirection, Input.Keyboard.Key> => ({
  [Direction.DOWN]: cursorKeys.down,
  [Direction.LEFT]: cursorKeys.left,
  [Direction.RIGHT]: cursorKeys.right,
  [Direction.UP]: cursorKeys.up,
});
