import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import type { Controls } from "@/models/dungeons/input/Controls";

import { BaseControls } from "@/models/dungeons/input/BaseControls";
import { mapCursorKeysToDirection } from "@/services/dungeons/UI/input/mapCursorKeysToDirection";
import { Direction } from "grid-engine";

export class JoystickControls extends BaseControls implements Controls {
  cursorKeys?: BaseCursorKeys;

  getInput(justDown?: true) {
    const input = super.getInput();
    if (input === -1) return Direction.NONE;
    // We don't have any cursor keys until the joystick is rendered
    else return input ?? (this.cursorKeys ? mapCursorKeysToDirection(this.cursorKeys, justDown) : Direction.NONE);
  }
}
