import type { Node } from "three/webgpu";

import { clamp, float } from "three/tsl";

// The TSL form of getRampColumn: how far the threshold falls short of the light area, in band widths, clamped to the ramp
// And mirrored, so a lit pixel reads the ramp's right end
export const createRampColumnNode = (
  threshold: Node<"float">,
  lightArea: number,
  rampWidth: Node<"float">,
): Node<"float"> => {
  const shortfall = float(lightArea).sub(threshold).div(lightArea).div(rampWidth);
  return float(1).sub(clamp(shortfall, 0, 1));
};
