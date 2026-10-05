import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";

import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { createRimNode } from "#src/nodes/createRimNode";

// The environment's one material: three's toon lighting reading the world's ramp, so light steps from shade to lit
// Across a narrow band and shade is whatever the ambient light is, plus the sky's rim on the lit silhouette
export const createToonMaterial = ({
  color,
  isOutlined = true,
  isVertexColors = false,
  lightUniforms,
  rampTexture,
}: ToonMaterialOptions): ToonNodeMaterial => {
  const toonMaterial = new ToonNodeMaterial(
    // A material with vertex colours takes none of its own, and three warns of a parameter handed as undefined
    { ...(color === undefined ? {} : { color }), gradientMap: rampTexture, vertexColors: isVertexColors },
    isOutlined,
  );
  toonMaterial.emissiveNode = createRimNode(lightUniforms);
  return toonMaterial;
};
