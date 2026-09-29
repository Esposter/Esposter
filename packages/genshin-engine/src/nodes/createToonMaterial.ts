import type { ToonMaterialOptions } from "#src/nodes/ToonMaterialOptions";

import { createRimNode } from "#src/nodes/createRimNode";
import { ToonNodeMaterial } from "#src/nodes/ToonNodeMaterial";

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
    { color, gradientMap: rampTexture, vertexColors: isVertexColors },
    isOutlined,
  );
  toonMaterial.emissiveNode = createRimNode(lightUniforms);
  return toonMaterial;
};
