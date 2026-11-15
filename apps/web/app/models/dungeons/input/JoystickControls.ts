import type { BaseCursorKeys } from "#src/models/dungeons/input/BaseCursorKeys";

import { BaseControls } from "#src/models/dungeons/input/BaseControls";
import { getDirectionFromCursorKeys } from "#src/services/dungeons/UI/input/getDirectionFromCursorKeys";
import { Direction } from "grid-engine";

export class JoystickControls extends BaseControls {
  cursorKeys?: BaseCursorKeys;

  // We don't have any cursor keys until the joystick is rendered
  protected override getDeviceInput(isJustDown?: true) {
    return this.cursorKeys ? getDirectionFromCursorKeys(this.cursorKeys, isJustDown) : Direction.NONE;
  }
}
