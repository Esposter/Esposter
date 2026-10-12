import type { PmxMaterial } from "genshin-engine";

import { PmxSphereMode } from "genshin-engine";

// The model's textures one material draws with: its own, its sphere map where a sphere mode lays one over it, and its
// Toon ramp where the file names one in the model's list rather than a shared ramp
export const getCharacterMaterialTextureIndices = ({
  isToonShared,
  sphereMode,
  sphereTextureIndex,
  textureIndex,
  toonIndex,
}: PmxMaterial): number[] => [
  textureIndex,
  ...(sphereMode === PmxSphereMode.Disabled ? [] : [sphereTextureIndex]),
  ...(isToonShared ? [] : [toonIndex]),
];
