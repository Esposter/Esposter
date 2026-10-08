import type { Vector3 } from "three";

import { SUN_REDRAW_COSINE } from "#src/atmosphere/constants";

// Whether the sun has turned far enough from the direction a shadow map was last drawn at for it to be drawn again.
// Both are unit directions, and a direction with no length (a light still standing on its target) has turned
export const checkSunTurned = (drawnDirection: Vector3, direction: Vector3): boolean =>
  drawnDirection.dot(direction) < SUN_REDRAW_COSINE;
