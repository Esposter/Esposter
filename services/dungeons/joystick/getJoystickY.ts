import { JOYSTICK_BASE_RADIUS } from "@/services/dungeons/joystick/constants";
import type { Scene } from "phaser";

export const getJoystickY = (scene: Scene) => scene.scale.height - JOYSTICK_BASE_RADIUS * scene.cameras.main.zoom;
