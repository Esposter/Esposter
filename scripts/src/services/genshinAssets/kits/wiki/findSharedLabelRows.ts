import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { findCountedRows } from "#src/services/genshinAssets/kits/wiki/findCountedRows";
import { findLabelRows } from "#src/services/genshinAssets/kits/wiki/findLabelRows";
import { readHitNumber } from "#src/services/genshinAssets/kits/wiki/readHitNumber";
import { readHitPlace } from "#src/services/genshinAssets/kits/wiki/readHitPlace";

// The rows each of several hits sharing one label takes, in path order. Where the label finds one row per hit, each
// Numbered one to the count of the hits by its trailing place, else by its `N-Hit` word, a hit takes the row numbered
// As its place, so hits of one name take their own rows. Where the label finds no row and the rows titled with counts
// Add up to the hits, the hits take those rows in order, each row as many hits as its count: Fiery Rain's arrows take
// `5 Main Arrows` for their first five and `13 Sub Arrows` for the rest. Otherwise every hit takes all the rows the
// Label finds
export const findSharedLabelRows = (
  label: string,
  properties: readonly WikiAdvancedProperty[],
  hitPaths: readonly string[],
): Map<string, WikiAdvancedProperty[]> => {
  const rows = findLabelRows(label, properties);
  const sortedHitPaths = hitPaths.toSorted((left, right) => left.localeCompare(right, "en", { numeric: true }));
  const countedRows = rows.length === 0 ? findCountedRows(properties, sortedHitPaths.length) : [];
  if (countedRows.length > 0)
    return new Map(
      sortedHitPaths.map((hitPath, index): [string, WikiAdvancedProperty[]] => [
        hitPath,
        countedRows.slice(index, index + 1),
      ]),
    );
  const numberedRows = new Map(rows.map((row) => [readHitPlace(row.title) ?? readHitNumber(row.title), row] as const));
  const isNumberedPerHit =
    rows.length === sortedHitPaths.length && sortedHitPaths.every((_hitPath, index) => numberedRows.has(index + 1));
  return new Map(
    sortedHitPaths.map((hitPath, index): [string, WikiAdvancedProperty[]] => {
      const row = numberedRows.get(index + 1);
      return [hitPath, isNumberedPerHit && row !== undefined ? [row] : rows];
    }),
  );
};
