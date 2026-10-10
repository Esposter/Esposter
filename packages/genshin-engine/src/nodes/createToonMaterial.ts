import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";
import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";
import type { ColorRepresentation } from "three";
import type { Node } from "three/webgpu";

import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { computeSurfaceOctaves } from "#src/nodes/computeSurfaceOctaves";
import { createObjectSurfaceNode } from "#src/nodes/createObjectSurfaceNode";
import { createRimNode } from "#src/nodes/createRimNode";
import { createSurfaceDetailNode } from "#src/nodes/createSurfaceDetailNode";
import { createWetDarkeningNode } from "#src/nodes/createWetDarkeningNode";
import { createWetSheenNode } from "#src/nodes/createWetSheenNode";
import { Color } from "three";
import { uniform } from "three/tsl";

// The colour as a uniform of the material's own, not `materialColor`, which reads the colour of whichever material is drawn.
// A witness target drawn with its own material read white where the stone's colour stands, so no family's colour was ever measured.
// White is the default colour a material without one draws. A detail's amplitudes are uniforms too, so every detail draws
// In one program
const createMaterialSurfaceNode = (
  color?: ColorRepresentation,
  detail?: SurfaceDetail,
): Node<"color"> | Node<"vec3"> => {
  const colorUniform = uniform(new Color(color ?? 0xffffff));
  if (detail === undefined) return colorUniform;
  return colorUniform.mul(
    createSurfaceDetailNode(computeSurfaceOctaves(detail).map(({ amplitude }) => uniform(amplitude))),
  );
};

// The environment's one material: three's toon lighting reading the world's ramp, so light steps from shade to lit
// Across a narrow band and shade is whatever the ambient light is, plus the sky's rim on the lit silhouette. Wet ground
// Darkens and takes the sun's glint, both by the one wetness the light uniforms hold, and a dry world draws as it did
export const createToonMaterial = ({
  color,
  detail,
  isObjectSurface = false,
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
  const surfaceNode = isObjectSurface ? createObjectSurfaceNode() : createMaterialSurfaceNode(color, detail);
  toonMaterial.colorNode = surfaceNode.mul(createWetDarkeningNode(lightUniforms));
  toonMaterial.emissiveNode = createRimNode(lightUniforms).add(createWetSheenNode(lightUniforms));
  return toonMaterial;
};
