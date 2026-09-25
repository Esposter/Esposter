import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";

import { BaseControls } from "@/models/dungeons/input/BaseControls";
import { getDirectionFromCursorKeys } from "@/services/dungeons/UI/input/getDirectionFromCursorKeys";
import { Direction } from "grid-engine";

export class JoystickControls extends BaseControls {
  cursorKeys?: BaseCursorKeys;

  // We don't have any cursor keys until the joystick is rendered
  protected override getDeviceInput(isJustDown?: true) {
    return this.cursorKeys ? getDirectionFromCursorKeys(this.cursorKeys, isJustDown) : Direction.NONE;
  }
}
