import type { ToonMaterialOptions } from "#src/nodes/ToonMaterialOptions";
import type { ToonNodeMaterial } from "#src/nodes/ToonNodeMaterial";

import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { DoubleSide } from "three";
import { float, step, uv } from "three/tsl";

const LEAF_ALPHA_TEST = 0.5;
// A leaf card cut to a pointed oval in the shader, so a crown is built from plain quads and no leaf texture is
// Authored or loaded. The card's normals are the crown's, bent outward by the generator, so the lighting reads a soft
// Mass rather than each card
export const createLeafMaterial = (toonMaterialOptions: ToonMaterialOptions): ToonNodeMaterial => {
  const leafMaterial = createToonMaterial(toonMaterialOptions);
  const centered = uv().sub(0.5).mul(2);
  // Narrower toward the tip and the stem, so the silhouette is a leaf rather than a disc
  const width = float(1).sub(centered.y.abs().pow(2)).mul(0.8);
  leafMaterial.opacityNode = step(0, width.sub(centered.x.abs()));
  leafMaterial.alphaTest = LEAF_ALPHA_TEST;
  leafMaterial.side = DoubleSide;
  return leafMaterial;
};
