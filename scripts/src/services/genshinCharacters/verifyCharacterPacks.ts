import type { GameDataLock } from "genshin-world";

import { characterPackManifestSchema } from "#src/models/genshinCharacters/CharacterPackManifest";
import { MAX_CONCURRENT_VERIFY_FETCHES } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { fetchOk } from "#src/services/shared/fetchOk";
import { settleAll } from "@esposter/shared";
import { CHARACTER_PACK_BLOB_PATH, fetchJson, GameDataset, getCharacterPackFileUrl } from "genshin-world";

// Every pack the lock names, as one account serves it: each file its record lists, asked for anonymously at the URL the
// World reads it from, so a pack whose folder lacks a file is found before a reader is. Resolves to how many files
// Were checked
export const verifyCharacterPacks = async (baseUrl: string, lock: GameDataLock): Promise<number> => {
  const keyPrefix = `${GameDataset.CharacterPacks}/`;
  const urls = (
    await Promise.all(
      Object.entries(lock.objects)
        .filter(([key]) => key.startsWith(keyPrefix))
        .map(async ([key, packHash]) => {
          const { files } = characterPackManifestSchema.parse(
            await fetchJson(`${baseUrl}/${getGameDataBlobName(packHash)}`),
          );
          return Object.keys(files).map((path) =>
            getCharacterPackFileUrl(
              `${baseUrl}/${CHARACTER_PACK_BLOB_PATH}`,
              Number(key.slice(keyPrefix.length)),
              packHash,
              path,
            ),
          );
        }),
    )
  ).flat();
  await settleAll(
    urls.map((url) => () => fetchOk(url, { method: "HEAD" })),
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  return urls.length;
};
