import { LOGIN_FLIGHT_DISTANCE } from "#src/services/login/scene/constants";

// The door at the flight's end, 29 metres beyond the camera's last pose, where the walkway's width in the door's
// Frame puts it, on its dais: 4.8 by 8.5 metres, as wide against the walkway as the frame shows it
export const LOGIN_DOOR_DISTANCE = 29;
export const LOGIN_DOOR_Z = -LOGIN_FLIGHT_DISTANCE - LOGIN_DOOR_DISTANCE;
export const LOGIN_DOOR = {
  archRise: 1.6,
  border: 0.55,
  depth: 1,
  height: 8.5,
  plinthHeight: 0.4,
  recess: 0.3,
  width: 4.8,
};
export const LOGIN_DAIS = { height: 0.9, length: 9, width: 12 };
// The door's panel, a blue slate darker than its frame, and the light it opens with, from the English recording
export const LOGIN_DOOR_COLOR = 0x6f7a96;
export const LOGIN_DOOR_GLOW_COLOR = 0x8fe8ff;
