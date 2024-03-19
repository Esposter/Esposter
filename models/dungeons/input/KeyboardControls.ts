import { BaseControls } from "@/models/dungeons/input/BaseControls";
import type { Controls } from "@/models/dungeons/input/Controls";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { Direction } from "grid-engine";
import type { Types } from "phaser";
import { Input } from "phaser";

export class KeyboardControls extends BaseControls implements Controls {
  cursorKeys: Types.Input.Keyboard.CursorKeys;
  enterKey: Input.Keyboard.Key;

  constructor(scene: SceneWithPlugins) {
    super();
    if (!scene.input.keyboard) throw new Error("Keyboard plugin is not enabled");
    this.cursorKeys = scene.input.keyboard.createCursorKeys();
    this.enterKey = scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.ENTER);
  }

  getInput(justDown?: true) {
    const input = super.getInput();
    if (input === -1) return Direction.NONE;
    else if (input) return input;
    else if (Input.Keyboard.JustDown(this.cursorKeys.space)) return PlayerSpecialInput.Confirm;
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) return PlayerSpecialInput.Cancel;
    else if (Input.Keyboard.JustDown(this.enterKey)) return PlayerSpecialInput.Enter;
    else return mapCursorKeysToDirection(this.cursorKeys, justDown);
  }
}
