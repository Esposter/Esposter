import { PmxSphereMode } from "#src/models/character/PmxSphereMode";

// Whether a PMX material's sphere map is laid over its diffuse: only multiplied or added. A disabled one has none, and an
// Additional-UV one reads the mesh's second UV set, which is not drawn, so neither's texture is read or kept
export const checkIsPmxSphereDrawn = (
  sphereMode: PmxSphereMode,
): sphereMode is PmxSphereMode.Add | PmxSphereMode.Multiply =>
  sphereMode === PmxSphereMode.Multiply || sphereMode === PmxSphereMode.Add;
