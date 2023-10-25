import { Direction, GridEngine } from "grid-engine";
import { Input } from "phaser";

export class MovementManager {
  gridEngine: GridEngine;

  constructor(gridEngine: GridEngine) {
    this.gridEngine = gridEngine;
  }

  public move(
    characterId: string,
    cursors: {
      up: Input.Keyboard.Key;
      down: Input.Keyboard.Key;
      left: Input.Keyboard.Key;
      right: Input.Keyboard.Key;
    },
  ) {
    if (cursors.left.isDown && cursors.up.isDown) this.gridEngine.move(characterId, Direction.UP_LEFT);
    else if (cursors.left.isDown && cursors.down.isDown) this.gridEngine.move(characterId, Direction.DOWN_LEFT);
    else if (cursors.right.isDown && cursors.up.isDown) this.gridEngine.move(characterId, Direction.UP_RIGHT);
    else if (cursors.right.isDown && cursors.down.isDown) this.gridEngine.move(characterId, Direction.DOWN_RIGHT);
    else if (cursors.left.isDown) this.gridEngine.move(characterId, Direction.LEFT);
    else if (cursors.right.isDown) this.gridEngine.move(characterId, Direction.RIGHT);
    else if (cursors.up.isDown) this.gridEngine.move(characterId, Direction.UP);
    else if (cursors.down.isDown) this.gridEngine.move(characterId, Direction.DOWN);
  }
}
