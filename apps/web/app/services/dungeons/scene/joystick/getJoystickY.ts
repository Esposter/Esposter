import type { Scene } from "phaser";

import { JOYSTICK_RADIUS } from "@/services/dungeons/scene/joystick/constants";

export const getJoystickY = (scene: Scene) => scene.scale.height - 1.5 * JOYSTICK_RADIUS;
