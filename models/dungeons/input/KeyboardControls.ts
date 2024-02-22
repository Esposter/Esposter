import type { Controls } from "@/models/dungeons/input/Controls";
import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import type { Types } from "phaser";
import { Input } from "phaser";

export class KeyboardControls implements Controls {
  cursorKeys: Types.Input.Keyboard.CursorKeys;
  input: PlayerInput | null = null;

  constructor(scene: SceneWithPlugins) {
    if (!scene.input.keyboard) throw new Error("Keyboard plugin is not enabled");
    this.cursorKeys = scene.input.keyboard.createCursorKeys();
  }

  getInput(justDown?: true) {
    let result: PlayerInput;

    if (this.input) result = this.input;
    else if (Input.Keyboard.JustDown(this.cursorKeys.space)) result = PlayerSpecialInput.Confirm;
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) result = PlayerSpecialInput.Cancel;
    else result = mapCursorKeysToDirection(this.cursorKeys, justDown);
    // We've retrieved an input so the old saved input is invalid now
    this.input = null;
    return result;
  }

  setInput(input: PlayerInput) {
    this.input = input;
  }
}
