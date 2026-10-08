import type { SightUniforms } from "#src/models/post/SightUniforms";

import { Vector2 } from "three";
import { uniform } from "three/tsl";

// Off, spreading from nowhere, until a scene turns it on
export const createSightUniforms = (): SightUniforms => ({
  origin: uniform(new Vector2()),
  radius: uniform(0),
  strength: uniform(0),
});
