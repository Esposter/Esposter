import { type Controls } from "@/models/dungeons/input/Controls";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { type Direction } from "grid-engine";
import { Input, type Types } from "phaser";

export class KeyboardControls implements Controls {
  keyboard: Input.Keyboard.KeyboardPlugin;
  cursorKeys: Types.Input.Keyboard.CursorKeys;

  constructor(scene: SceneWithPlugins) {
    if (!scene.input.keyboard) throw new Error("Keyboard plugin is not enabled");
    this.keyboard = scene.input.keyboard;
    this.cursorKeys = this.keyboard.createCursorKeys();
  }

  getInput(): PlayerSpecialInput | Direction {
    if (Input.Keyboard.JustDown(this.cursorKeys.space)) return PlayerSpecialInput.Confirm;
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) return PlayerSpecialInput.Cancel;
    else return mapCursorKeysToDirection(this.cursorKeys);
  }

  destroy() {
    this.keyboard.destroy();
  }
}
