import type { WindUniforms } from "#src/wind/WindUniforms";

import { Vector2 } from "three";
import { uniform } from "three/tsl";

// One set per world: a region sets its base wind, and weather will raise it
export const createWindUniforms = (): WindUniforms => ({
  direction: uniform(new Vector2(1, 0)),
  gustSpeed: uniform(0),
  gustStrength: uniform(0),
  gustWidth: uniform(1),
  strength: uniform(0),
});
