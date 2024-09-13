import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";

import { Direction } from "grid-engine";
import { Input } from "phaser";

const getDirectionToCursorKeysMap = (
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

export const mapCursorKeysToDirection = (cursorKeys: BaseCursorKeys, justDown?: true) => {
  const cursorKeyMap = getDirectionToCursorKeysMap(cursorKeys);

  for (const [direction, cursorKeys] of Object.entries(cursorKeyMap)) {
    if (justDown) {
      // JustDown doesn't support multiple different key presses
      if (cursorKeys.length > 1) continue;
      if (cursorKeys.every((cursorKey) => Input.Keyboard.JustDown(cursorKey))) return direction as Direction;
      else continue;
    }

    if (cursorKeys.every((cursorKey) => cursorKey.isDown)) return direction as Direction;
  }

  return Direction.NONE;
};
