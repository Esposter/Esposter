import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";

const ENTRY_CONCURRENCY = 8;

// The named entries of an index another step published, read through the lock on disk as `readPublishedGameData` reads
// A record: the index object once, then each entry's record, a few at a time so a long list never floods the account.
// Unchecked, as that read is: the caller names what an entry holds, or parses it oxlint-disable-next-line
// Typescript/no-unnecessary-type-parameters -- the caller names the type an entry holds
export const readPublishedGameDataEntries = async <T>(
  indexKey: string,
  ids: readonly string[],
): Promise<Map<string, T>> => {
  const { indexes } = await readGameDataLock();
  const indexHash = indexes[indexKey];
  if (indexHash === undefined)
    throw new InvalidOperationError(Operation.Read, indexKey, "is not in the game data lock");
  const entryHashMap = await readPublishedGameDataObject<Record<string, string>>(indexHash);
  const entryMap = new Map<string, T>();
  for (let start = 0; start < ids.length; start += ENTRY_CONCURRENCY)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: each batch starts once the last settles
    await Promise.all(
      ids.slice(start, start + ENTRY_CONCURRENCY).map(async (id) => {
        const entryHash = entryHashMap[id];
        if (entryHash === undefined)
          throw new InvalidOperationError(Operation.Read, `${indexKey}/${id}`, "has no entry");
        entryMap.set(id, await readPublishedGameDataObject<T>(entryHash));
      }),
    );
  return entryMap;
};
