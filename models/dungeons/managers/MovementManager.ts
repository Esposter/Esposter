import { type BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { type SpriteKey } from "@/models/dungeons/keys/SpriteKey";
import { Direction, type GridEngine } from "grid-engine";

export class MovementManager {
  gridEngine: GridEngine;
  cursorKeys: BaseCursorKeys;

  constructor(gridEngine: GridEngine, cursorKeys: BaseCursorKeys) {
    this.gridEngine = gridEngine;
    this.cursorKeys = cursorKeys;
  }

  moveSprite(spriteKey: SpriteKey) {
    if (this.cursorKeys.left.isDown && this.cursorKeys.up.isDown) this.gridEngine.move(spriteKey, Direction.UP_LEFT);
    else if (this.cursorKeys.left.isDown && this.cursorKeys.down.isDown)
      this.gridEngine.move(spriteKey, Direction.DOWN_LEFT);
    else if (this.cursorKeys.right.isDown && this.cursorKeys.up.isDown)
      this.gridEngine.move(spriteKey, Direction.UP_RIGHT);
    else if (this.cursorKeys.right.isDown && this.cursorKeys.down.isDown)
      this.gridEngine.move(spriteKey, Direction.DOWN_RIGHT);
    else if (this.cursorKeys.left.isDown) this.gridEngine.move(spriteKey, Direction.LEFT);
    else if (this.cursorKeys.right.isDown) this.gridEngine.move(spriteKey, Direction.RIGHT);
    else if (this.cursorKeys.up.isDown) this.gridEngine.move(spriteKey, Direction.UP);
    else if (this.cursorKeys.down.isDown) this.gridEngine.move(spriteKey, Direction.DOWN);
  }
}
