import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { type BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { type Controls } from "@/models/dungeons/input/Controls";
import { type PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { createJoystick } from "@/services/dungeons/joystick/createJoystick";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import { type Direction } from "grid-engine";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export class JoystickControls implements Controls {
  virtualJoystick: VirtualJoystick;
  cursorKeys: BaseCursorKeys;
  resizeListener: () => void;

  constructor(scene: SceneWithPlugins, virtualJoystickPlugin: VirtualJoystickPlugin) {
    this.virtualJoystick = createJoystick(scene, virtualJoystickPlugin);
    this.cursorKeys = this.virtualJoystick.createCursorKeys();
    this.resizeListener = () => {
      this.virtualJoystick.y = getJoystickY(scene);
    };
    phaserEventEmitter.on("resize", this.resizeListener);
  }

  getInput(): PlayerSpecialInput | Direction {
    // @TODO: Figure out a way to nicely map confirm/cancel to mobile inputs
    return mapCursorKeysToDirection(this.cursorKeys);
  }

  destroy() {
    phaserEventEmitter.off("resize", this.resizeListener);
    this.virtualJoystick.destroy();
  }
}
