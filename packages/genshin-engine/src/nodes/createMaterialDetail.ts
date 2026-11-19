import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";
import type { Node, UniformNode } from "three/webgpu";

import { computeSurfaceOctaves } from "#src/nodes/computeSurfaceOctaves";
import { createSurfaceDetailNode } from "#src/nodes/createSurfaceDetailNode";
import { uniform } from "three/tsl";

// A material's detail as its node, with each octave's amplitude held as a uniform of the material's own, so a tool can
// Set the amplitudes on the live material (`amplitudes`, in the order `computeSurfaceOctaves` gives them)
export interface MaterialDetail {
  amplitudes: UniformNode<"float">[];
  node: Node<"float">;
}

// A material's detail with each octave's amplitude and the texel size held as uniforms of the material's own
export const createMaterialDetail = (detail: SurfaceDetail): MaterialDetail => {
  const amplitudes = computeSurfaceOctaves(detail).map(({ amplitude }) => uniform(amplitude));
  return { amplitudes, node: createSurfaceDetailNode(amplitudes, uniform(1 / detail.metresPerTexel)) };
};
