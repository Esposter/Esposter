import { type BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { type Controls } from "@/models/dungeons/input/Controls";
import { type PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { Direction } from "grid-engine";

export class JoystickControls implements Controls {
  cursorKeys: BaseCursorKeys | null = null;
  input: PlayerInput | null = null;

  getInput() {
    let result: PlayerInput;

    if (this.input) result = this.input;
    // We don't have any cursor keys until the joystick is rendered
    else result = this.cursorKeys ? mapCursorKeysToDirection(this.cursorKeys) : Direction.NONE;

    this.input = null;
    return result;
  }

  setInput(input: PlayerInput) {
    this.input = input;
  }
}
