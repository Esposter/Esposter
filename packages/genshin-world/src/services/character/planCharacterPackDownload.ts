import type { CharacterPackDownloadPlan } from "#src/models/character/CharacterPackDownloadPlan";
import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";

import { getCharacterPackCacheUrl } from "#src/services/character/getCharacterPackCacheUrl";

// The files of the index the cache lacks, each with the url it is kept under, and the bytes they come to. A held url is
// Matched exactly, so a republished file, keyed by its new hash, is planned again. The base is absolute, since the cache
// Lists its keys as absolute urls
export const planCharacterPackDownload = (
  { avatars }: CharacterPackIndex,
  gameDataBaseUrl: string,
  heldUrls: ReadonlySet<string>,
): CharacterPackDownloadPlan => {
  const indexFiles = avatars.flatMap(({ avatarId, files }) =>
    files.map(({ bytes, path, sha256 }) => ({
      avatarId,
      bytes,
      path,
      url: getCharacterPackCacheUrl(gameDataBaseUrl, avatarId, path, sha256),
    })),
  );
  const files = indexFiles.filter(({ url }) => !heldUrls.has(url));
  return { files, pendingBytes: files.reduce((total, { bytes }) => total + bytes, 0) };
};
