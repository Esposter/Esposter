import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { getCharacterPackCacheUrl } from "#src/services/character/getCharacterPackCacheUrl";
import { getCharacterPackFilePath } from "#src/services/character/getCharacterPackFilePath";
import { ID_SEPARATOR } from "@esposter/shared";

// One avatar's pack read from the cache its files were downloaded into: a path the pack lists is read from the copy kept
// Under that file's current hash, and a path it does not list, or a file not yet kept, is none
export const createCharacterPackReader = (
  cache: Pick<Cache, "match">,
  gameDataBaseUrl: string,
  { avatarId, files }: CharacterPackIndex["avatars"][number],
): CharacterPackReader => ({
  key: [avatarId, ...files.map(({ sha256 }) => sha256)].join(ID_SEPARATOR),
  readFile: async (path) => {
    const filePath = getCharacterPackFilePath(path);
    const file = files.find((indexFile) => indexFile.path === filePath);
    if (file === undefined) return undefined;
    const cacheUrl = getCharacterPackCacheUrl(gameDataBaseUrl, avatarId, file.path, file.sha256);
    const response = await cache.match(cacheUrl);
    return response?.blob();
  },
});
