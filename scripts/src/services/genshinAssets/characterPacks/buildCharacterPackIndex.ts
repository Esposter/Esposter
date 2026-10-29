import type { CharacterPackFile } from "#src/models/genshinAssets/characterPacks/CharacterPackFile";
import type { CharacterPackIndex } from "genshin-world";

import { toCharacterPackAvatar } from "#src/services/genshinAssets/characterPacks/toCharacterPackAvatar";

// The index of every published pack, read from the same listing the upload publishes: each avatar's folder through its
// Manifest, in avatar id order, so the index and the files it names come from one listing and cannot drift apart
export const buildCharacterPackIndex = async (files: CharacterPackFile[]): Promise<CharacterPackIndex> => {
  const avatars = await Promise.all(
    Array.from(
      Map.groupBy(files, ({ avatarId }) => avatarId),
      ([avatarId, avatarFiles]) => toCharacterPackAvatar(avatarId, avatarFiles),
    ),
  );
  return { avatars: avatars.toSorted((first, second) => first.avatarId - second.avatarId) };
};
