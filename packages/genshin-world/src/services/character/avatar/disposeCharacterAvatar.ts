import type { CharacterAvatar } from "#src/models/avatar/CharacterAvatar";

import { disposeCharacterMesh } from "#src/services/character/disposeCharacterMesh";

// Releases an avatar's meshes, each with its geometry, skeleton, materials and decoded textures as a pack's model is
export const disposeCharacterAvatar = ({ skinnedMeshes }: CharacterAvatar): void => {
  for (const skinnedMesh of skinnedMeshes) disposeCharacterMesh(skinnedMesh);
};
