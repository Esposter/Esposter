import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { findLabelRows } from "#src/services/genshinAssets/kits/wiki/findLabelRows";
import { readHitNumber } from "#src/services/genshinAssets/kits/wiki/readHitNumber";

// The rows each of several hits sharing one label takes, in path order. Where the label finds one row per hit, each
// Numbered one to the count of the hits, a hit takes the row numbered as its place, so hits of one name take their own
// Rows. Otherwise every hit takes all the rows the label finds
export const findSharedLabelRows = (
  label: string,
  properties: readonly WikiAdvancedProperty[],
  hitPaths: readonly string[],
): Map<string, WikiAdvancedProperty[]> => {
  const rows = findLabelRows(label, properties);
  const numberedRows = new Map(rows.map((row) => [readHitNumber(row.title), row] as const));
  const sortedHitPaths = hitPaths.toSorted((left, right) => left.localeCompare(right, "en", { numeric: true }));
  const isNumberedPerHit =
    rows.length === sortedHitPaths.length && sortedHitPaths.every((_hitPath, index) => numberedRows.has(index + 1));
  return new Map(
    sortedHitPaths.map((hitPath, index): [string, WikiAdvancedProperty[]] => {
      const row = numberedRows.get(index + 1);
      return [hitPath, isNumberedPerHit && row !== undefined ? [row] : rows];
    }),
  );
};
