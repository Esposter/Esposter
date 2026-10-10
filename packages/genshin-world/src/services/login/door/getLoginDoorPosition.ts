import type { LoginDoor } from "#src/models/login/LoginDoor";

// Where the scene stands the door: the foot of its middle, sunk under the walkway's surface as its plinth is
export const getLoginDoorPosition = ({ position: [x = 0, y = 0, z = 0] }: LoginDoor): [number, number, number] => [
  x,
  y,
  z,
];
