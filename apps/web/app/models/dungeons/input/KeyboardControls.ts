import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { BaseControls } from "#src/models/dungeons/input/BaseControls";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { getDirectionFromCursorKeys } from "#src/services/dungeons/UI/input/getDirectionFromCursorKeys";
import { NotInitializedError } from "@esposter/shared";
import { Input } from "phaser";

export class KeyboardControls extends BaseControls {
  cursorKeys: Types.Input.Keyboard.CursorKeys;
  enterKey: Input.Keyboard.Key;

  constructor(scene: SceneWithPlugins) {
    super();
    if (!scene.input.keyboard) throw new NotInitializedError("Keyboard plugin");
    this.cursorKeys = scene.input.keyboard.createCursorKeys();
    this.enterKey = scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.ENTER);
  }

  protected override getDeviceInput(isJustDown?: true) {
    if (Input.Keyboard.JustDown(this.cursorKeys.space)) return PlayerSpecialInput.Confirm;
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) return PlayerSpecialInput.Cancel;
    else if (Input.Keyboard.JustDown(this.enterKey)) return PlayerSpecialInput.Enter;
    else return getDirectionFromCursorKeys(this.cursorKeys, isJustDown);
  }
}
