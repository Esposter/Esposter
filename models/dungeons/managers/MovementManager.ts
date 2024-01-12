import { type BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { type SpriteKey } from "@/models/dungeons/keys/SpriteKey";
import { mapCursorKeysToDirection } from "@/services/dungeons/mapCursorKeysToDirection";
import { type GridEngine } from "grid-engine";

export class MovementManager {
  gridEngine: GridEngine;
  cursorKeys: BaseCursorKeys;

  constructor(gridEngine: GridEngine, cursorKeys: BaseCursorKeys) {
    this.gridEngine = gridEngine;
    this.cursorKeys = cursorKeys;
  }

  moveSprite(spriteKey: SpriteKey) {
    this.gridEngine.move(spriteKey, mapCursorKeysToDirection(this.cursorKeys));
  }
}
