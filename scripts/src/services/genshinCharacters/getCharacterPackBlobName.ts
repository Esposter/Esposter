import { CHARACTER_PACK_BLOB_PATH } from "genshin-world";

// Where a file of a pack is stored: under its character's id and its pack's hash, so a changed pack is a new folder and
// Nothing a browser cached is ever stale. An empty path names the folder itself, which an account is listed by
export const getCharacterPackBlobName = (characterId: number, packHash: string, path: string): string =>
  `${CHARACTER_PACK_BLOB_PATH}/${characterId}/${packHash}/${path}`;
