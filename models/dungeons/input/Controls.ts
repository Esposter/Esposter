import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { Direction, type Position } from "grid-engine";
import { type Types } from "phaser";

export class Controls {
  cursorKeys: Types.Input.Keyboard.CursorKeys;

  constructor(cursorKeys: Types.Input.Keyboard.CursorKeys) {
    this.cursorKeys = cursorKeys;
  }

  move(position: Position): Position {
    const newPosition = { ...position };
    const direction = mapCursorKeysToDirection(this.cursorKeys);

    switch (direction) {
      case Direction.UP:
        newPosition.y -= 1;
        break;
      case Direction.DOWN:
        newPosition.y += 1;
        break;
      case Direction.LEFT:
        newPosition.x -= 1;
        break;
      case Direction.RIGHT:
        newPosition.x += 1;
        break;
      default:
        break;
    }

    return newPosition;
  }
}
