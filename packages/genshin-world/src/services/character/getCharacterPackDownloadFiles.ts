import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";
import type { HostedAssetDownloadFile } from "hosted-assets";

import { getCharacterPackCacheUrl } from "#src/services/character/getCharacterPackCacheUrl";

// Each file of the index with the url the cache keeps it under and the bytes it comes to, which the preload plans by
export const getCharacterPackDownloadFiles = (
  { avatars }: CharacterPackIndex,
  gameDataBaseUrl: string,
): HostedAssetDownloadFile[] =>
  avatars.flatMap(({ avatarId, files }) =>
    files.map(({ bytes, path, sha256 }) => ({
      bytes,
      path,
      url: getCharacterPackCacheUrl(gameDataBaseUrl, avatarId, path, sha256),
    })),
  );
