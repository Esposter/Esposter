import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { GroundPoint } from "genshin-engine";

// The Oculi not yet found within a distance of a point on the ground: the ones the minimap marks, and the ones a touch
// From that point finds
export const getNearOculusPlaces = (
  oculusPlaces: readonly OculusPlace[],
  foundOculusIds: ReadonlySet<string>,
  point: GroundPoint,
  distance: number,
): OculusPlace[] =>
  oculusPlaces.filter(
    ({ id, position }) => !foundOculusIds.has(id) && Math.hypot(position.x - point.x, position.z - point.z) <= distance,
  );
