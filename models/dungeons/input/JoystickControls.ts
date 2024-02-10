import { type BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { type Controls } from "@/models/dungeons/input/Controls";
import { type PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { Direction } from "grid-engine";

export class JoystickControls implements Controls {
  cursorKeys: BaseCursorKeys | null = null;
  input: PlayerInput | null = null;

  getInput() {
    // We don't have any cursor keys until the joystick is rendered
    if (!this.cursorKeys) return Direction.NONE;

    let result: PlayerInput;

    if (this.input) result = this.input;
    else result = mapCursorKeysToDirection(this.cursorKeys);

    this.input = null;
    return result;
  }

  setInput(input: PlayerInput) {
    this.input = input;
  }
}
