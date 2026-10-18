import { GameDataChangeKind } from "#src/models/gameData/GameDataChangeKind";
import { checkIsPlainObject } from "@esposter/shared";

// The keys a record's rows are known by, the first that every row of both sides holds once taken: a row's own id, or the
// Character or depot a kit's row is of
const ROW_ID_KEYS = ["id", "characterId", "depotId"] as const;

// The rows of an array keyed by `key`, or undefined when a row has none or two rows share one
const toIdRowMap = (rows: unknown[], key: string): Map<unknown, unknown> | undefined => {
  const idRowMap = new Map<unknown, unknown>();
  for (const row of rows) {
    if (!checkIsPlainObject(row)) return undefined;
    const id = row[key];
    if ((typeof id !== "number" && typeof id !== "string") || idRowMap.has(id)) return undefined;
    idRowMap.set(id, row);
  }
  return idRowMap;
};

// Both sides' rows keyed by the first id key both hold, so a table read in another order, or with a row put between two
// Others, compares row to row rather than place to place
const toIdRowMaps = (
  before: unknown[],
  after: unknown[],
): [Map<unknown, unknown>, Map<unknown, unknown>] | undefined => {
  for (const key of ROW_ID_KEYS) {
    const beforeIdRowMap = toIdRowMap(before, key);
    const afterIdRowMap = beforeIdRowMap && toIdRowMap(after, key);
    if (beforeIdRowMap && afterIdRowMap) return [beforeIdRowMap, afterIdRowMap];
  }
  return undefined;
};

// Counts each leaf where `before` and `after` differ into `countMap`, keyed by its path and kind with every array index
// Written as [] and every numeric key as #, so a field a source stopped writing reads as one line with the count of rows
// It left rather than a line a row. Rows that carry ids are matched by id. A subtree present on one side only counts
// Once, at its root
export const countGameDataPathChanges = (
  countMap: Map<string, number>,
  path: string,
  before: unknown,
  after: unknown,
): void => {
  if (Array.isArray(before) && Array.isArray(after)) {
    const idRowMaps = toIdRowMaps(before, after);
    if (idRowMaps) {
      const [beforeIdRowMap, afterIdRowMap] = idRowMaps;
      for (const id of new Set([...beforeIdRowMap.keys(), ...afterIdRowMap.keys()]))
        countGameDataPathChanges(countMap, `${path}[]`, beforeIdRowMap.get(id), afterIdRowMap.get(id));
      return;
    }

    const length = Math.max(before.length, after.length);
    for (let index = 0; index < length; index++)
      countGameDataPathChanges(countMap, `${path}[]`, before[index], after[index]);
    return;
  }

  if (checkIsPlainObject(before) && checkIsPlainObject(after)) {
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
      // A record keyed by id, such as a text map or a scene's groups, reads as one path for all its ids
      const segment = /^\d+$/u.test(key) ? "#" : key;
      countGameDataPathChanges(countMap, path === "" ? segment : `${path}.${segment}`, before[key], after[key]);
    }
    return;
  }

  if (before === after) return;
  const kind =
    before === undefined
      ? GameDataChangeKind.Added
      : after === undefined
        ? GameDataChangeKind.Removed
        : GameDataChangeKind.Changed;
  const label = `${path || "(root)"} ${kind}`;
  countMap.set(label, (countMap.get(label) ?? 0) + 1);
};
