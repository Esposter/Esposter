import { GameDataChangeKind } from "#src/models/gameData/GameDataChangeKind";

const checkIsJsonObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// The rows of an array keyed by their own id, or undefined when a row has none or two rows share one, so a table read
// In another order compares row to row rather than place to place
const toIdRowMap = (rows: unknown[]): Map<unknown, unknown> | undefined => {
  const idRowMap = new Map<unknown, unknown>();
  for (const row of rows) {
    if (!checkIsJsonObject(row) || (typeof row.id !== "number" && typeof row.id !== "string") || idRowMap.has(row.id))
      return undefined;
    idRowMap.set(row.id, row);
  }
  return idRowMap;
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
    const beforeIdRowMap = toIdRowMap(before);
    const afterIdRowMap = toIdRowMap(after);
    if (beforeIdRowMap && afterIdRowMap) {
      for (const id of new Set([...beforeIdRowMap.keys(), ...afterIdRowMap.keys()]))
        countGameDataPathChanges(countMap, `${path}[]`, beforeIdRowMap.get(id), afterIdRowMap.get(id));
      return;
    }

    const length = Math.max(before.length, after.length);
    for (let index = 0; index < length; index++)
      countGameDataPathChanges(countMap, `${path}[]`, before[index], after[index]);
    return;
  }

  if (checkIsJsonObject(before) && checkIsJsonObject(after)) {
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
