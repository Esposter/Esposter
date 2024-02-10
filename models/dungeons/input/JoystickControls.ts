import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { type BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { type Controls } from "@/models/dungeons/input/Controls";
import { type PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { createJoystick } from "@/services/dungeons/joystick/createJoystick";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export class JoystickControls implements Controls {
  virtualJoystick: VirtualJoystick;
  cursorKeys: BaseCursorKeys;
  input: PlayerInput | null = null;
  resizeListener: () => void;

  constructor(scene: SceneWithPlugins, virtualJoystickPlugin: VirtualJoystickPlugin) {
    this.virtualJoystick = createJoystick(scene, virtualJoystickPlugin);
    this.cursorKeys = this.virtualJoystick.createCursorKeys();
    this.resizeListener = () => {
      this.virtualJoystick.y = getJoystickY(scene);
    };
    phaserEventEmitter.on("resize", this.resizeListener);
  }

  getInput() {
    let result: PlayerInput;

    if (this.input) result = this.input;
    else result = mapCursorKeysToDirection(this.cursorKeys);

    this.input = null;
    return result;
  }

  setInput(input: PlayerInput) {
    this.input = input;
  }

  destroy() {
    phaserEventEmitter.off("resize", this.resizeListener);
    this.virtualJoystick.destroy();
  }
}
