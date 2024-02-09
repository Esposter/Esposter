import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { type Direction } from "grid-engine";
import { Input, type Types } from "phaser";

export class Controls {
  cursorKeys: Types.Input.Keyboard.CursorKeys;

  constructor(cursorKeys: Types.Input.Keyboard.CursorKeys) {
    this.cursorKeys = cursorKeys;
  }

  get input(): PlayerSpecialInput | Direction {
    if (Input.Keyboard.JustDown(this.cursorKeys.space)) return PlayerSpecialInput.Confirm;
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) return PlayerSpecialInput.Cancel;
    else return mapCursorKeysToDirection(this.cursorKeys);
  }
}
