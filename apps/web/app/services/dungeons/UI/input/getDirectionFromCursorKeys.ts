import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import type { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";

import { Direction } from "grid-engine";
import { Input } from "phaser";

// Four directions and no diagonals, on purpose (/docs/dungeons/rejected/diagonal-movement): one key per direction
const getDirectionCursorKeyMap = (cursorKeys: BaseCursorKeys): Record<InteractableDirection, Input.Keyboard.Key> => ({
  [Direction.DOWN]: cursorKeys.down,
  [Direction.LEFT]: cursorKeys.left,
  [Direction.RIGHT]: cursorKeys.right,
  [Direction.UP]: cursorKeys.up,
});

export const getDirectionFromCursorKeys = (cursorKeys: BaseCursorKeys, isJustDown?: true) => {
  // Object.entries widens its keys to string, and the record it reads is keyed by the directions right above
  const directionCursorKeyEntries = Object.entries(getDirectionCursorKeyMap(cursorKeys)) as [
    InteractableDirection,
    Input.Keyboard.Key,
  ][];

  for (const [direction, cursorKey] of directionCursorKeyEntries)
    if (isJustDown ? Input.Keyboard.JustDown(cursorKey) : cursorKey.isDown) return direction;

  return Direction.NONE;
};
