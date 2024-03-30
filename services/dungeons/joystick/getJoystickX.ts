import { JOYSTICK_BASE_RADIUS } from "@/services/dungeons/joystick/constants";
import type { Scene } from "phaser";

export const getJoystickX = (scene: Scene) => JOYSTICK_BASE_RADIUS * scene.cameras.main.zoom;
