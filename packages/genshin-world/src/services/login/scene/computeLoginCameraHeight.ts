import type { LoginWalkway } from "#src/models/login/LoginWalkway";

import { LOGIN_EYE_HEIGHT } from "#src/services/login/scene/constants";

// The camera's height in the scene: its eye over the top of the walkway risen under it
export const computeLoginCameraHeight = ({ top }: LoginWalkway): number => top + LOGIN_EYE_HEIGHT;
