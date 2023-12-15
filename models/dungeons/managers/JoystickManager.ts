import { phaserEventEmitter } from "@/models/dungeons/events/phaser";
import { getJoystickY } from "@/services/dungeons/joystick";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

export class JoystickManager {
  virtualJoystick: VirtualJoystick;

  constructor(virtualJoystick: VirtualJoystick) {
    this.virtualJoystick = virtualJoystick;
    phaserEventEmitter.on("resize", () => (this.virtualJoystick.y = getJoystickY()));
  }

  public createCursorKeys = () => this.virtualJoystick.createCursorKeys();
}
