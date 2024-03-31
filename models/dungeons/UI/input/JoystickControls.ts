import { BaseControls } from "@/models/dungeons/UI/input/BaseControls";
import type { BaseCursorKeys } from "@/models/dungeons/UI/input/BaseCursorKeys";
import type { Controls } from "@/models/dungeons/UI/input/Controls";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { Direction } from "grid-engine";

export class JoystickControls extends BaseControls implements Controls {
  cursorKeys: BaseCursorKeys | null = null;

  getInput(justDown?: true) {
    const input = super.getInput();
    if (input === -1) return Direction.NONE;
    // We don't have any cursor keys until the joystick is rendered
    else return input ?? (this.cursorKeys ? mapCursorKeysToDirection(this.cursorKeys, justDown) : Direction.NONE);
  }
}
