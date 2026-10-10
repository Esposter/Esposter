import type { LoginDoor } from "#src/models/login/LoginDoor";

// The door assembling itself as the door stage begins, each of its pieces rising into place along its own lift, the
// Last settled once this many milliseconds have passed
export const computeLoginDoorLiftMs = ({ liftRate, pieces }: LoginDoor): number =>
  (Math.max(...pieces.map(({ lift }) => lift.length - 1)) / liftRate) * 1000;
