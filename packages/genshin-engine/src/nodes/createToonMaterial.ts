import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";

import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { WET_DARKENING } from "#src/nodes/constants";
import { createRimNode } from "#src/nodes/createRimNode";
import { createWetSheenNode } from "#src/nodes/createWetSheenNode";
import { float, materialColor } from "three/tsl";

// The environment's one material: three's toon lighting reading the world's ramp, so light steps from shade to lit
// Across a narrow band and shade is whatever the ambient light is, plus the sky's rim on the lit silhouette. Wet ground
// Darkens and takes the sun's glint, both by the one wetness the light uniforms hold, and a dry world draws as it did
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
  toonMaterial.colorNode = materialColor.mul(float(1).sub(lightUniforms.wetness.mul(WET_DARKENING)));
  toonMaterial.emissiveNode = createRimNode(lightUniforms).add(createWetSheenNode(lightUniforms));
  return toonMaterial;
};
