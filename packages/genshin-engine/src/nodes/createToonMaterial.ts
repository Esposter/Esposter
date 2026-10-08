import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";

import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { createRimNode } from "#src/nodes/createRimNode";
import { createWetDarkeningNode } from "#src/nodes/createWetDarkeningNode";
import { createWetSheenNode } from "#src/nodes/createWetSheenNode";
import { Color } from "three";
import { uniform } from "three/tsl";

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
  // The colour as a uniform of the material's own, not `materialColor`, which reads the colour of whichever material is
  // drawn: a witness target drawn with its own material read white where the stone's colour stands, so no family's
  // Colour was ever measured. White is the default colour a material without one draws
  const colorUniform = uniform(new Color(color ?? 0xffffff));
  toonMaterial.colorNode = colorUniform.mul(createWetDarkeningNode(lightUniforms));
  toonMaterial.emissiveNode = createRimNode(lightUniforms).add(createWetSheenNode(lightUniforms));
  return toonMaterial;
};
