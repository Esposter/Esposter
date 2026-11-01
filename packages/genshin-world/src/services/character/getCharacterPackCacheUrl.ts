import { CHARACTER_PACKS_FOLDER } from "#src/services/character/constants";
import { getCharacterPackFileUrl } from "#src/services/character/getCharacterPackFileUrl";

// A published file's url as the cache keeps it: its address under the hosted game data, with its sha256 as a query. A
// Republished file with new bytes is a different key, so the older copy is no longer read, and the mirror reads the
// Same query as the hash its bytes are kept under
export const getCharacterPackCacheUrl = (
  gameDataBaseUrl: string,
  avatarId: number,
  path: string,
  sha256: string,
): string => {
  const characterPacksBaseUrl = `${gameDataBaseUrl}/${CHARACTER_PACKS_FOLDER}`;
  const fileUrl = getCharacterPackFileUrl(characterPacksBaseUrl, avatarId, path);
  return `${fileUrl}?sha256=${sha256}`;
};
