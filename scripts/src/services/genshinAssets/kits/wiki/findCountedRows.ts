import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

// A row titled with a count of hits, `5` for `5 Main Arrows`
const COUNT_TITLE_REGEX = /^(?<count>\d+) /u;

// The rows titled with a count, each repeated as many times as its count and in row order, where the counts add up to
// The hits, else none
export const findCountedRows = (
  properties: readonly WikiAdvancedProperty[],
  hitCount: number,
): WikiAdvancedProperty[] => {
  const countedRows = properties.flatMap((row) => {
    const count = COUNT_TITLE_REGEX.exec(row.title)?.groups?.count;
    return count === undefined ? [] : Array.from({ length: Number(count) }, () => row);
  });
  return countedRows.length === hitCount ? countedRows : [];
};
