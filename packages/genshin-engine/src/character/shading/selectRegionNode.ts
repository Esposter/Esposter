import type { ShadingRegionColours } from "#src/models/character/ShadingRegionColours";
import type { Node } from "three/webgpu";

import { float, select } from "three/tsl";

const LATER_REGIONS = [
  [2, "two"],
  [3, "three"],
  [4, "four"],
  [5, "five"],
] as const;

// A value by the region a pixel is in: the first region's, unless a later region's is selected
export const selectRegionNode = <TNodeType>(
  region: Node<"float">,
  toRegionNode: (regionName: keyof ShadingRegionColours) => Node<TNodeType>,
): Node<TNodeType> =>
  LATER_REGIONS.reduce<Node<TNodeType>>(
    (current, [regionNumber, regionName]) =>
      select(region.equal(float(regionNumber)), toRegionNode(regionName), current),
    toRegionNode("one"),
  );
