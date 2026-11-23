import type { InteractableDirection } from "#src/models/dungeons/direction/InteractableDirection";
import type { BaseCursorKeys } from "#src/models/dungeons/input/BaseCursorKeys";
import type { Input } from "phaser";

import { Direction } from "grid-engine-headless";

// Four directions and no diagonals, on purpose (openspec/rejected/dungeons/diagonal-movement/design.md): one key per
// Direction
export const getDirectionCursorKeyMap = (
  cursorKeys: BaseCursorKeys,
): Record<InteractableDirection, Input.Keyboard.Key> => ({
  [Direction.Down]: cursorKeys.down,
  [Direction.Left]: cursorKeys.left,
  [Direction.Right]: cursorKeys.right,
  [Direction.Up]: cursorKeys.up,
});
