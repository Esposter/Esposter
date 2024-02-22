import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { Direction } from "grid-engine";

export const mapCursorKeysToDirection = (cursorKeys: BaseCursorKeys) => {
  if (cursorKeys.left.isDown && cursorKeys.up.isDown) return Direction.UP_LEFT;
  else if (cursorKeys.left.isDown && cursorKeys.down.isDown) return Direction.DOWN_LEFT;
  else if (cursorKeys.right.isDown && cursorKeys.up.isDown) return Direction.UP_RIGHT;
  else if (cursorKeys.right.isDown && cursorKeys.down.isDown) return Direction.DOWN_RIGHT;
  else if (cursorKeys.left.isDown) return Direction.LEFT;
  else if (cursorKeys.right.isDown) return Direction.RIGHT;
  else if (cursorKeys.up.isDown) return Direction.UP;
  else if (cursorKeys.down.isDown) return Direction.DOWN;
  else return Direction.NONE;
};
