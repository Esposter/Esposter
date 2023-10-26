import { SpriteKey } from "@/models/dungeons/keys/SpriteKey";
import { Direction, GridEngine } from "grid-engine";
import { Input } from "phaser";

export class MovementManager {
  gridEngine: GridEngine;

  constructor(gridEngine: GridEngine) {
    this.gridEngine = gridEngine;
  }

  public move(
    spriteKey: SpriteKey,
    cursors: {
      up: Input.Keyboard.Key;
      down: Input.Keyboard.Key;
      left: Input.Keyboard.Key;
      right: Input.Keyboard.Key;
    },
  ) {
    if (cursors.left.isDown && cursors.up.isDown) this.gridEngine.move(spriteKey, Direction.UP_LEFT);
    else if (cursors.left.isDown && cursors.down.isDown) this.gridEngine.move(spriteKey, Direction.DOWN_LEFT);
    else if (cursors.right.isDown && cursors.up.isDown) this.gridEngine.move(spriteKey, Direction.UP_RIGHT);
    else if (cursors.right.isDown && cursors.down.isDown) this.gridEngine.move(spriteKey, Direction.DOWN_RIGHT);
    else if (cursors.left.isDown) this.gridEngine.move(spriteKey, Direction.LEFT);
    else if (cursors.right.isDown) this.gridEngine.move(spriteKey, Direction.RIGHT);
    else if (cursors.up.isDown) this.gridEngine.move(spriteKey, Direction.UP);
    else if (cursors.down.isDown) this.gridEngine.move(spriteKey, Direction.DOWN);
  }
}
