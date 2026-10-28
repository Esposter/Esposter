import { readPublishedGameDataIndex } from "#src/services/gameData/readPublishedGameDataIndex";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";

const ENTRY_CONCURRENCY = 8;

// The named entries of an index another step published, or every entry it holds, read through the lock on disk as
// `readPublishedGameData` reads a record: the index object once, then each entry's record, a few at a time so a long
// List never floods the account. Unchecked, as that read is: the caller names what an entry holds, or parses it
export const readPublishedGameDataEntries = async <T>(
  indexKey: string,
  ids?: readonly string[],
): Promise<Map<string, T>> => {
  const entryHashMap = await readPublishedGameDataIndex(indexKey);
  const entryIds = ids ?? Object.keys(entryHashMap);
  const entryMap = new Map<string, T>();
  for (let start = 0; start < entryIds.length; start += ENTRY_CONCURRENCY)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: each batch starts once the last settles
    await Promise.all(
      entryIds.slice(start, start + ENTRY_CONCURRENCY).map(async (id) => {
        const entryHash = entryHashMap[id];
        if (entryHash === undefined)
          throw new InvalidOperationError(Operation.Read, `${indexKey}/${id}`, "has no entry");
        entryMap.set(id, await readPublishedGameDataObject<T>(indexKey, entryHash));
      }),
    );
  return entryMap;
};
