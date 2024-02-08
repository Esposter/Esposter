import { type BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { type SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { type GridEngine } from "grid-engine";

export class MovementManager {
  gridEngine: GridEngine;
  cursorKeys: BaseCursorKeys;

  constructor(gridEngine: GridEngine, cursorKeys: BaseCursorKeys) {
    this.gridEngine = gridEngine;
    this.cursorKeys = cursorKeys;
  }

  moveSprite(spritesheetKey: SpritesheetKey) {
    this.gridEngine.move(spritesheetKey, mapCursorKeysToDirection(this.cursorKeys));
  }
}
