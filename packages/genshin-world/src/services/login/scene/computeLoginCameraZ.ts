import type { LoginDoor } from "#src/models/login/LoginDoor";

import { getLoginDoorPosition } from "#src/services/login/door/getLoginDoorPosition";
import { LOGIN_DOOR_REST_DISTANCE } from "#src/services/login/scene/constants";

// Where along the walkway the camera holds its pose: the door's rest short of the door
export const computeLoginCameraZ = (door: LoginDoor): number =>
  getLoginDoorPosition(door)[2] - LOGIN_DOOR_REST_DISTANCE;
