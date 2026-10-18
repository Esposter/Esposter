import type { Landmark } from "#src/models/world/Landmark";

// The jump landmarks the player has unlocked, which the map, the minimap and the jump list offer as jump targets. A domain
// Entrance is one of them once unlocked, as a statue or a waypoint is
export const computeUnlockedJumpLandmarks = (
  jumpLandmarks: readonly Landmark[],
  unlockedLandmarkIds: ReadonlySet<string>,
): Landmark[] => jumpLandmarks.filter(({ id }) => unlockedLandmarkIds.has(id));
