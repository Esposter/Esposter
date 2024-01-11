import { JOYSTICK_RADIUS } from "@/services/dungeons/constants";
import { getJoystickX } from "@/services/dungeons/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import { type Scene } from "phaser";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export const addJoystick = (scene: Scene, rexVirtualJoystick: VirtualJoystickPlugin) =>
  rexVirtualJoystick.add(scene, {
    x: getJoystickX(),
    y: getJoystickY(scene),
    radius: JOYSTICK_RADIUS,
    base: scene.add.circle(0, 0, JOYSTICK_RADIUS, 0x888888),
    thumb: scene.add.circle(0, 0, JOYSTICK_RADIUS / 2, 0xcccccc),
  });
