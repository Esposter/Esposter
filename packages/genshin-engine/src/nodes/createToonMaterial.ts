import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";
import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";
import type { ColorRepresentation } from "three";
import type { Node } from "three/webgpu";

import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { createObjectSurfaceNode } from "#src/nodes/createObjectSurfaceNode";
import { createMaterialDetailNode } from "#src/nodes/createMaterialDetailNode";
import { createRimNode } from "#src/nodes/createRimNode";
import { createWetDarkeningNode } from "#src/nodes/createWetDarkeningNode";
import { createWetSheenNode } from "#src/nodes/createWetSheenNode";
import { Color } from "three";
import { normalGeometry, positionGeometry, transformNormal, transformNormalToView, uniform, vec4 } from "three/tsl";

// The colour as a uniform of the material's own, not `materialColor`, which reads the colour of whichever material is drawn.
// A witness target drawn with its own material read white where the stone's colour stands, so no family's colour was ever measured.
// White is the default colour a material without one draws. A detail's amplitudes and texel size are uniforms too, so
// Every detail draws in one program
const createMaterialSurfaceNode = (
  color?: ColorRepresentation,
  detail?: SurfaceDetail,
): Node<"color"> | Node<"vec3"> => {
  const colorUniform = uniform(new Color(color ?? 0xffffff));
  if (detail === undefined) return colorUniform;
  return colorUniform.mul(createMaterialDetailNode(detail));
};

// The environment's one material: three's toon lighting reading the world's ramp, so light steps from shade to lit
// Across a narrow band and shade is whatever the ambient light is, plus the sky's rim on the lit silhouette. Wet ground
// Darkens and takes the sun's glint, both by the one wetness the light uniforms hold, and a dry world draws as it did
export const createToonMaterial = ({
  color,
  detail,
  instanceMatrix,
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
  if (instanceMatrix) {
    // The geometry's own place and normal, carried by each instance's matrix, its normal turned by the same matrix
    toonMaterial.positionNode = instanceMatrix.mul(vec4(positionGeometry, 1)).xyz;
    toonMaterial.normalNode = transformNormalToView(transformNormal(normalGeometry, instanceMatrix)).normalize();
  }
  return toonMaterial;
};
