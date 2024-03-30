import { JOYSTICK_BASE_RADIUS } from "@/services/dungeons/joystick/constants";
import type { Scene } from "phaser";

/*
Let R be the new joystick radius we are trying to find
and r be the JOYSTICK_BASE_RADIUS which is a known constant
such that R with the camera zoom results in the same perceived r
with no zoom i.e. the circle joystick area stays the same after zoom
πR² * zoom = πr²
=> R = Math.sqrt(r² / zoom)
*/
export const getJoystickRadius = (scene: Scene) =>
  Math.sqrt(Math.pow(JOYSTICK_BASE_RADIUS, 2) / scene.cameras.main.zoom);
