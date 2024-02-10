import { type Controls } from "@/models/dungeons/input/Controls";
import { type PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { Input, type Types } from "phaser";

export class KeyboardControls implements Controls {
  keyboard: Input.Keyboard.KeyboardPlugin;
  cursorKeys: Types.Input.Keyboard.CursorKeys;
  input: PlayerInput | null = null;

  constructor(scene: SceneWithPlugins) {
    if (!scene.input.keyboard) throw new Error("Keyboard plugin is not enabled");
    this.keyboard = scene.input.keyboard;
    this.cursorKeys = this.keyboard.createCursorKeys();
  }

  getInput() {
    let result: PlayerInput;

    if (this.input) result = this.input;
    else if (Input.Keyboard.JustDown(this.cursorKeys.space)) result = PlayerSpecialInput.Confirm;
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) result = PlayerSpecialInput.Cancel;
    else result = mapCursorKeysToDirection(this.cursorKeys);
    // We've retrieved an input so the old saved input is invalid now
    this.input = null;
    return result;
  }

  setInput(input: PlayerInput) {
    this.input = input;
  }

  destroy() {
    this.keyboard.destroy();
  }
}
