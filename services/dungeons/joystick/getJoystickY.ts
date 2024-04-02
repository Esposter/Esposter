import { JOYSTICK_RADIUS } from "@/services/dungeons/joystick/constants";
import type { Scene } from "phaser";

export const getJoystickY = (scene: Scene) => scene.scale.height - 1.5 * JOYSTICK_RADIUS;
