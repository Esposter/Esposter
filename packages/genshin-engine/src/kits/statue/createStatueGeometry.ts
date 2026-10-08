import type { StatuePart } from "#src/models/kits/statue/StatuePart";
import type { BufferGeometry } from "three";

import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";
import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";

// Each band's outermost radius is what a statue's outline shows, so its lathes are turned at a fixed count of sides
const STATUE_RADIAL_SEGMENTS = 32;
// A statue as lathe stacks, each part standing at its own place in the statue's frame, merged into one geometry for one
// Material. The parts are fitted from the game's own meshes, so the silhouette is theirs and the stacks are ours
export const createStatueGeometry = (parts: readonly StatuePart[]): BufferGeometry =>
  mergeGeometryParts(
    parts.map(({ position: [x = 0, y = 0, z = 0], sections }) =>
      createLatheStackGeometry({ isFaceted: false, radialSegments: STATUE_RADIAL_SEGMENTS, sections }).translate(
        x,
        y,
        z,
      ),
    ),
  );
