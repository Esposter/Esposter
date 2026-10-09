import type { Node } from "three/webgpu";

import { LEAF_SHAPE_WIDTH } from "#src/nodes/constants";
import { float, step, uv } from "three/tsl";

// A leaf card's cut, one inside a pointed oval and none outside: narrower toward the tip and the stem, so a crown built
// From plain quads has a leaf's silhouette rather than a disc's, with no leaf texture authored or loaded
export const createLeafShapeNode = (): Node<"float"> => {
  const centered = uv().sub(0.5).mul(2);
  const width = float(1).sub(centered.y.abs().pow(2)).mul(LEAF_SHAPE_WIDTH);
  return step(0, width.sub(centered.x.abs()));
};
