import { CHARACTER_PACK_VERSION_LENGTH, CHARACTER_PACKS_FOLDER } from "#src/services/character/constants";
import { getCharacterPackFileUrl } from "#src/services/character/getCharacterPackFileUrl";

// A published file's url as the cache keeps it: its address under the hosted game data, with the leading characters of
// Its hash as a version, so a republished file with new bytes is a different key and the older copy is no longer read
export const getCharacterPackCacheUrl = (
  gameDataBaseUrl: string,
  avatarId: number,
  path: string,
  sha256: string,
): string => {
  const characterPacksBaseUrl = `${gameDataBaseUrl}/${CHARACTER_PACKS_FOLDER}`;
  const fileUrl = getCharacterPackFileUrl(characterPacksBaseUrl, avatarId, path);
  const version = sha256.slice(0, CHARACTER_PACK_VERSION_LENGTH);
  return `${fileUrl}?v=${version}`;
};
