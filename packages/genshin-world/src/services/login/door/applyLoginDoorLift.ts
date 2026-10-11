import type { LoginDoor } from "#src/models/login/LoginDoor";
import type { Object3D } from "three";

import { Quaternion } from "three";

const startTurn = new Quaternion();
const endTurn = new Quaternion();
// A piece of the door stood where its lift has carried it so many milliseconds into its rise, between the samples
// Either side, its place eased along a line and its turn along the arc between, and at rest once the lift is done
export const applyLoginDoorLift = (
  door: LoginDoor,
  { position, quaternion }: Object3D,
  lift: readonly (readonly number[])[],
  riseMs: number,
): void => {
  const last = lift.length - 1;
  const frame = Math.min(Math.max((riseMs / 1000) * door.liftRate, 0), last);
  const index = Math.floor(frame);
  const share = frame - index;
  const [startX = 0, startY = 0, startZ = 0, ...start] = lift[index] ?? [];
  const [endX = 0, endY = 0, endZ = 0, ...end] = lift[Math.min(index + 1, last)] ?? [];
  position.set(startX + (endX - startX) * share, startY + (endY - startY) * share, startZ + (endZ - startZ) * share);
  quaternion.slerpQuaternions(startTurn.fromArray(start), endTurn.fromArray(end), share);
};
