import { MovementManager } from "@/models/dungeons/managers/MovementManager";
import { phaserEventEmitter } from "@/services/dungeons/events/phaser";
import { createJoystick } from "@/services/dungeons/joystick/createJoystick";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import type GridEngine from "grid-engine";
import { type Scene } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export class JoystickMovementManager extends MovementManager {
  virtualJoystick: VirtualJoystick;

  constructor(gridEngine: GridEngine, scene: Scene, virtualJoystickPlugin: VirtualJoystickPlugin) {
    const joystick = createJoystick(scene, virtualJoystickPlugin);
    super(gridEngine, joystick.createCursorKeys());
    this.virtualJoystick = joystick;
    phaserEventEmitter.on("resize", () => (this.virtualJoystick.y = getJoystickY(scene)));
  }
}
