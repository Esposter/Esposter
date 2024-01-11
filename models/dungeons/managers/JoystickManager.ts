import { phaserEventEmitter } from "@/models/dungeons/events/phaser";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import { type Scene } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

export class JoystickManager {
  virtualJoystick: VirtualJoystick;

  constructor(virtualJoystick: VirtualJoystick, scene: Scene) {
    this.virtualJoystick = virtualJoystick;
    phaserEventEmitter.on("resize", () => (this.virtualJoystick.y = getJoystickY(scene)));
  }

  createCursorKeys() {
    return this.virtualJoystick.createCursorKeys();
  }
}
