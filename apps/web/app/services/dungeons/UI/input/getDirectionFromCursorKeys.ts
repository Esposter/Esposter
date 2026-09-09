import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";

import { Direction } from "grid-engine";
import { Input } from "phaser";

const getDirectionCursorKeysMap = (
  cursorKeys: BaseCursorKeys,
): Record<Exclude<Direction, Direction.NONE>, Input.Keyboard.Key[]> => ({
  [Direction.DOWN]: [cursorKeys.down],
  [Direction.DOWN_LEFT]: [cursorKeys.down, cursorKeys.left],
  [Direction.DOWN_RIGHT]: [cursorKeys.down, cursorKeys.right],
  [Direction.LEFT]: [cursorKeys.left],
  [Direction.RIGHT]: [cursorKeys.right],
  [Direction.UP]: [cursorKeys.up],
  [Direction.UP_LEFT]: [cursorKeys.up, cursorKeys.left],
  [Direction.UP_RIGHT]: [cursorKeys.up, cursorKeys.right],
});

export const getDirectionFromCursorKeys = (cursorKeys: BaseCursorKeys, isJustDown?: true) => {
  // Object.entries widens its keys to string, and the record it reads is keyed by the enum right above
  const directionCursorKeysEntries = Object.entries(getDirectionCursorKeysMap(cursorKeys)) as [
    Direction,
    Input.Keyboard.Key[],
  ][];

  for (const [direction, directionKeys] of directionCursorKeysEntries) {
    // JustDown doesn't support multiple different key presses
    if (isJustDown && directionKeys.length > 1) continue;
    if (directionKeys.every((cursorKey) => (isJustDown ? Input.Keyboard.JustDown(cursorKey) : cursorKey.isDown)))
      return direction;
  }

  return Direction.NONE;
};
