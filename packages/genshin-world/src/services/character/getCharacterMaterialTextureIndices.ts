import type { PmxMaterial } from "genshin-engine";

import { checkIsPmxSphereDrawn } from "genshin-engine";

// The model's textures one material draws with: its own, its sphere map where its mode multiplies or adds one over it,
// And its toon ramp where the file names one in the model's list rather than a shared ramp
export const getCharacterMaterialTextureIndices = ({
  isToonShared,
  sphereMode,
  sphereTextureIndex,
  textureIndex,
  toonIndex,
}: PmxMaterial): number[] => [
  textureIndex,
  ...(checkIsPmxSphereDrawn(sphereMode) ? [sphereTextureIndex] : []),
  ...(isToonShared ? [] : [toonIndex]),
];
