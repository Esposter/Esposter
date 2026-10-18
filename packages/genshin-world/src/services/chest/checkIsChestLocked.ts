import type { ChestLockSource } from "#src/models/chest/ChestLockSource";
import type { GroundPoint } from "genshin-engine";

// Whether a chest stands locked: within reach of a camp or a puzzle that is not yet done, a source being within reach when
// Any of its points is. The reach is passed in, since the wiki gives no distance and the recording that measures one is
// Still owed
export const checkIsChestLocked = (
  { x, z }: GroundPoint,
  lockSources: readonly ChestLockSource[],
  reach: number,
): boolean =>
  lockSources.some(
    ({ isDone, positions }) =>
      !isDone && positions.some((position) => Math.hypot(position.x - x, position.z - z) <= reach),
  );
