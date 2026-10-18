import type { PmxMaterial } from "genshin-engine";

import { checkIsPmxSphereDrawn } from "genshin-engine";

// The model's textures one material draws as a colour: its own, and its sphere map where its mode multiplies or
// Adds one over it
export const getCharacterColourTextureIndices = ({
  sphereMode,
  sphereTextureIndex,
  textureIndex,
}: PmxMaterial): number[] => [textureIndex, ...(checkIsPmxSphereDrawn(sphereMode) ? [sphereTextureIndex] : [])];
