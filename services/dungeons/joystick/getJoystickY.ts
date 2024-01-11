import { JOYSTICK_RADIUS } from "@/services/dungeons/constants";
import { type Scene } from "phaser";

export const getJoystickY = (scene: Scene) => scene.scale.height - JOYSTICK_RADIUS * 2;
