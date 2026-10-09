import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";
import type { Node } from "three/webgpu";

import { computeSurfaceOctaves } from "#src/nodes/computeSurfaceOctaves";
import { createSurfaceDetailNode } from "#src/nodes/createSurfaceDetailNode";
import { uniform } from "three/tsl";

// A material's detail with each octave's amplitude and the texel size held as uniforms of the material's own
export const createMaterialDetailNode = (detail: SurfaceDetail): Node<"float"> =>
  createSurfaceDetailNode(
    computeSurfaceOctaves(detail).map(({ amplitude }) => uniform(amplitude)),
    uniform(1 / detail.metresPerTexel),
  );
