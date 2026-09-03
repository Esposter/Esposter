import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import type { Controls } from "@/models/dungeons/input/Controls";

import { BaseControls } from "@/models/dungeons/input/BaseControls";
import { getDirectionFromCursorKeys } from "@/services/dungeons/UI/input/getDirectionFromCursorKeys";
import { Direction } from "grid-engine";

export class JoystickControls extends BaseControls implements Controls {
  cursorKeys?: BaseCursorKeys;

  override getInput(justDown?: true) {
    const input = super.getInput();
    if (input === -1) return Direction.NONE;
    // We don't have any cursor keys until the joystick is rendered
    else return input ?? (this.cursorKeys ? getDirectionFromCursorKeys(this.cursorKeys, justDown) : Direction.NONE);
  }
}
