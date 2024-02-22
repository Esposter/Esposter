import { getJoystickRadius } from "@/services/dungeons/joystick/getJoystickRadius";
import type { Scene } from "phaser";

export const getJoystickX = (scene: Scene) => 1.5 * getJoystickRadius(scene) * Math.pow(scene.cameras.main.zoom, 3);
