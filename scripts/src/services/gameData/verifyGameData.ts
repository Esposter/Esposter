import type { GameDataLock } from "genshin-world";

import { MAX_CONCURRENT_VERIFY_FETCHES } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { getGameDataHash } from "#src/services/gameData/getGameDataHash";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { fetchJson, gameDataIndexSchema } from "genshin-world";

// Fetches one object anonymously from an account's base and checks that its content hashes to the name the lock gave it
const verifyGameDataObject = async (baseUrl: string, hash: string): Promise<unknown> => {
  const url = `${baseUrl}/${getGameDataBlobName(hash)}`;
  const json = await fetchJson(url);
  if (getGameDataHash(JSON.stringify(json)) !== hash)
    throw new InvalidOperationError(Operation.Read, url, "does not hash to its name");
  return json;
};

// Every object the lock reaches, as one account serves it: the lock's objects, and each index and the entries it names.
// Resolves to how many distinct objects were checked
export const verifyGameData = async (baseUrl: string, lock: GameDataLock): Promise<number> => {
  const indexHashes = new Set(Object.values(lock.indexes));
  const entryHashes = (
    await settleAll(
      Array.from(
        indexHashes,
        (hash) => async () => Object.values(gameDataIndexSchema.parse(await verifyGameDataObject(baseUrl, hash))),
      ),
      MAX_CONCURRENT_VERIFY_FETCHES,
    )
  ).flat();
  // Each object is fetched once however many names reach it, and an index is not fetched again as an object
  const objectHashes = new Set([...Object.values(lock.objects), ...entryHashes]);
  await settleAll(
    Array.from(objectHashes, (hash) => () => verifyGameDataObject(baseUrl, hash)),
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  return indexHashes.size + objectHashes.size;
};
