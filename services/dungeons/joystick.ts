import { JOYSTICK_RADIUS } from "@/services/dungeons/constants";
import { getGameHeight } from "@/services/dungeons/gameDimensions";
import { type Scene } from "phaser";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export const addJoystick = (scene: Scene, rexVirtualJoystick: VirtualJoystickPlugin) =>
  rexVirtualJoystick.add(scene, {
    x: getJoystickX(),
    y: getJoystickY(),
    radius: JOYSTICK_RADIUS,
    base: scene.add.circle(0, 0, JOYSTICK_RADIUS, 0x888888),
    thumb: scene.add.circle(0, 0, JOYSTICK_RADIUS / 2, 0xcccccc),
  });

export const getJoystickX = () => JOYSTICK_RADIUS * 2;
export const getJoystickY = () => {
  const gameHeight = getGameHeight();
  return gameHeight - JOYSTICK_RADIUS * 2;
};
