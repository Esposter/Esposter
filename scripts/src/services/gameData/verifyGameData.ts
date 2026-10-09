import type { GameDataLock } from "genshin-world";

import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { getGameDataHash } from "#src/services/gameData/getGameDataHash";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { fetchGameDataObject, gameDataIndexSchema } from "genshin-world";

// Fetches in flight at once against one account, which keeps the script's memory bounded by one wave of objects
const MAX_CONCURRENT_VERIFY_FETCHES = 16;

// Fetches one object anonymously from an account's base and checks that its content hashes to the name the lock gave it
const verifyGameDataObject = async (baseUrl: string, hash: string): Promise<unknown> => {
  const url = `${baseUrl}/${getGameDataBlobName(hash)}`;
  const json = await fetchGameDataObject(url);
  if (getGameDataHash(JSON.stringify(json)) !== hash)
    throw new InvalidOperationError(Operation.Read, url, "does not hash to its name");
  return json;
};

// Every object the lock reaches, as one account serves it: the lock's objects, and each index and the entries it names.
// Resolves to how many distinct objects were checked
export const verifyGameData = async (baseUrl: string, lock: GameDataLock): Promise<number> => {
  const indexHashes = Object.values(lock.indexes);
  const entryHashes = (
    await settleAll(
      indexHashes.map(
        (hash) => async () => Object.values(gameDataIndexSchema.parse(await verifyGameDataObject(baseUrl, hash))),
      ),
      MAX_CONCURRENT_VERIFY_FETCHES,
    )
  ).flat();
  const hashes = [...Object.values(lock.objects), ...indexHashes, ...entryHashes];
  await settleAll(
    hashes.map((hash) => () => verifyGameDataObject(baseUrl, hash)),
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  return new Set(hashes).size;
};
