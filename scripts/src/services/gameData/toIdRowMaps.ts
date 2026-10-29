import { toIdRowMap } from "#src/services/gameData/toIdRowMap";

// The keys a record's rows are known by, the first that every row of both sides holds once taken: a row's own id, or the
// Character or depot a kit's row is of
const ROW_ID_KEYS = ["id", "characterId", "depotId"] as const;

// Both sides' rows keyed by the first id key both hold, so a table read in another order, or with a row put between two
// Others, compares row to row rather than place to place
export const toIdRowMaps = (
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
