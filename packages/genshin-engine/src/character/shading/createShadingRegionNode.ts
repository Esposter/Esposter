import type { ShadingRegionToggles } from "#src/models/character/ShadingRegionToggles";
import type { Node } from "three/webgpu";

import { REGION_FLOORS } from "#src/character/shading/constants";
import { float, select } from "three/tsl";

// The region of a pixel from its lightmap's alpha, the TSL form of getShadingRegion: each band enabled by its toggle
// Overrides the region below it, and the bands are disjoint, so the order they are taken in does not matter
export const createShadingRegionNode = (alpha: Node<"float">, toggles: ShadingRegionToggles): Node<"float"> => {
  let region: Node<"float"> = float(1);
  if (toggles.four)
    region = select(
      alpha.greaterThanEqual(REGION_FLOORS.four).and(alpha.lessThan(REGION_FLOORS.three)),
      float(4),
      region,
    );
  if (toggles.three)
    region = select(
      alpha.greaterThanEqual(REGION_FLOORS.three).and(alpha.lessThan(REGION_FLOORS.five)),
      float(3),
      region,
    );
  if (toggles.five)
    region = select(
      alpha.greaterThanEqual(REGION_FLOORS.five).and(alpha.lessThan(REGION_FLOORS.two)),
      float(5),
      region,
    );
  if (toggles.two) region = select(alpha.greaterThanEqual(REGION_FLOORS.two), float(2), region);
  return region;
};
