import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";
import type { GameDataLock } from "genshin-world";

import { MAX_CONCURRENT_VERIFY_FETCHES } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { getGameDataHash } from "#src/services/gameData/getGameDataHash";
import { toGameDataObjectRefs } from "#src/services/gameData/toGameDataObjectRefs";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { gameDataIndexSchema, readJson } from "genshin-world";

// Fetches one object anonymously from an account's base and checks that its content hashes to the name the lock gave it
const verifyGameDataObject = async (baseUrl: string, { dataset, hash }: GameDataObjectRef): Promise<unknown> => {
  const url = `${baseUrl}/${getGameDataBlobName(dataset, hash)}`;
  const json = await readJson(url);
  if (getGameDataHash(JSON.stringify(json)) !== hash)
    throw new InvalidOperationError(Operation.Read, url, "does not hash to its name");
  return json;
};

// Every object the lock reaches, as one account serves it: the lock's objects, and each index and the entries it names,
// which are stored under the index's key. Resolves to how many distinct objects were checked
export const verifyGameData = async (baseUrl: string, lock: GameDataLock): Promise<number> => {
  const indexRefs = toGameDataObjectRefs(lock.indexes);
  const entryRefs = (
    await settleAll(
      indexRefs.map(
        (indexRef) => async () =>
          Object.values(gameDataIndexSchema.parse(await verifyGameDataObject(baseUrl, indexRef))).map((hash) => ({
            dataset: indexRef.dataset,
            hash,
          })),
      ),
      MAX_CONCURRENT_VERIFY_FETCHES,
    )
  ).flat();
  // Each object is fetched once however many names reach it, and an index is not fetched again as an object
  const objectRefMap = new Map(
    [...toGameDataObjectRefs(lock.objects), ...entryRefs].map(
      (ref) => [getGameDataBlobName(ref.dataset, ref.hash), ref] as const,
    ),
  );
  await settleAll(
    Array.from(objectRefMap.values(), (ref) => () => verifyGameDataObject(baseUrl, ref)),
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  return indexRefs.length + objectRefMap.size;
};
