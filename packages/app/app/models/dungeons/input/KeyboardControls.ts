import type { Controls } from "@/models/dungeons/input/Controls";
import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { BaseControls } from "@/models/dungeons/input/BaseControls";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { mapCursorKeysToDirection } from "@/services/dungeons/UI/input/mapCursorKeysToDirection";
import { NotInitializedError } from "@esposter/shared";
import { Direction } from "grid-engine";
import { Input } from "phaser";

export class KeyboardControls extends BaseControls implements Controls {
  cursorKeys: Types.Input.Keyboard.CursorKeys;
  enterKey: Input.Keyboard.Key;

  constructor(scene: SceneWithPlugins) {
    super();
    if (!scene.input.keyboard) throw new NotInitializedError("Keyboard plugin");
    this.cursorKeys = scene.input.keyboard.createCursorKeys();
    this.enterKey = scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.ENTER);
  }

  override getInput(justDown?: true) {
    const input = super.getInput();
    if (input === -1) return Direction.NONE;
    else if (input) return input;
    else if (Input.Keyboard.JustDown(this.cursorKeys.space)) return PlayerSpecialInput.Confirm;
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) return PlayerSpecialInput.Cancel;
    else if (Input.Keyboard.JustDown(this.enterKey)) return PlayerSpecialInput.Enter;
    else return mapCursorKeysToDirection(this.cursorKeys, justDown);
  }
}
