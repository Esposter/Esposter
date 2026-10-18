import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { GameDataLock } from "genshin-world";

import { countGameDataPathChanges } from "#src/services/gameData/countGameDataPathChanges";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

const COMPARISON_CONCURRENCY = 16;
const SHOWN_PATH_COUNT = 20;

interface EntryChange {
  afterHash: string;
  beforeHash: string;
  name: string;
}

interface EntryDiff {
  addedCount: number;
  changes: EntryChange[];
  removedCount: number;
}

// What a dry run would change in what readers fetch: the keys and index entries it adds, removes or changes against the
// Published lock, then the paths its changed records differ at, most often first, each prefixed with its key or index.
// The published side is read from the dev account, so a field a source stopped writing shows before anything publishes
export const summarizeGameDataChanges = async (
  currentLock: GameDataLock,
  nextLock: GameDataLock,
  records: GameDataRecord[],
): Promise<string[]> => {
  const recordJsonMap = new Map(records.map(({ hash, json }) => [hash, json]));
  // A hash the next lock names is one this publication planned, or one the current lock already published
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names the type the record holds
  const readNext = <T>(hash: string): Promise<T> => {
    const json = recordJsonMap.get(hash);
    return json === undefined ? readPublishedGameDataObject<T>(hash) : Promise.resolve(parseMachineJson<T>(json));
  };
  const objectDiff = diffEntries(currentLock.objects, nextLock.objects);
  const indexDiff = diffEntries(currentLock.indexes, nextLock.indexes);
  const entryDiffs = await Promise.all(
    indexDiff.changes.map(async ({ afterHash, beforeHash, name }) => {
      const [beforeEntries, afterEntries] = await Promise.all([
        readPublishedGameDataObject<Record<string, string>>(beforeHash),
        readNext<Record<string, string>>(afterHash),
      ]);
      return { entryDiff: diffEntries(beforeEntries, afterEntries), prefix: `${name}/*` };
    }),
  );
  const comparisons = [
    ...objectDiff.changes.map((change) => ({ change, prefix: change.name })),
    ...entryDiffs.flatMap(({ entryDiff, prefix }) => entryDiff.changes.map((change) => ({ change, prefix }))),
  ];
  const countMap = new Map<string, number>();
  // An index can hold thousands of changed entries, so the published side is fetched a few objects at a time
  await forEachConcurrently(comparisons, COMPARISON_CONCURRENCY, async ({ change, prefix }) => {
    const [before, after] = await Promise.all([
      readPublishedGameDataObject<unknown>(change.beforeHash),
      readNext<unknown>(change.afterHash),
    ]);
    const pathCountMap = new Map<string, number>();
    countGameDataPathChanges(pathCountMap, "", before, after);
    for (const [label, count] of pathCountMap)
      countMap.set(`${prefix} › ${label}`, (countMap.get(`${prefix} › ${label}`) ?? 0) + count);
  });

  const entryCounts = entryDiffs.reduce(
    (counts, { entryDiff: { addedCount, changes, removedCount } }) => ({
      added: counts.added + addedCount,
      changed: counts.changed + changes.length,
      removed: counts.removed + removedCount,
    }),
    { added: 0, changed: 0, removed: 0 },
  );
  const sortedPaths = [...countMap].toSorted(([, a], [, b]) => b - a);
  return [
    `  objects ${formatDiff(objectDiff)}, indexes ${formatDiff(indexDiff)}, index entries +${entryCounts.added} -${entryCounts.removed} ~${entryCounts.changed}`,
    ...sortedPaths.slice(0, SHOWN_PATH_COUNT).map(([label, count]) => `  ${label} ×${count}`),
    ...(sortedPaths.length > SHOWN_PATH_COUNT ? [`  … ${sortedPaths.length - SHOWN_PATH_COUNT} more paths`] : []),
  ];
};

// The names one side holds and the other lacks, counted, and each name both hold under another hash
const diffEntries = (before: Record<string, string>, after: Record<string, string>): EntryDiff => {
  const diff: EntryDiff = { addedCount: 0, changes: [], removedCount: 0 };
  for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const beforeHash = before[name];
    const afterHash = after[name];
    if (beforeHash === afterHash) continue;
    else if (beforeHash === undefined) diff.addedCount++;
    else if (afterHash === undefined) diff.removedCount++;
    else diff.changes.push({ afterHash, beforeHash, name });
  }
  return diff;
};

const formatDiff = ({ addedCount, changes, removedCount }: EntryDiff) =>
  `+${addedCount} -${removedCount} ~${changes.length}`;
