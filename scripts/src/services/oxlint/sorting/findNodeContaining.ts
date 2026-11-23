import { checkIsRangeContaining } from "#src/services/oxlint/sorting/checkIsRangeContaining";

// The item whose range a source range lies within, the one each identifier is read as belonging to. The range is the one
// `getItemRange` gives the item, so a decorator sitting before an exported class's `export` keyword is inside that class
export const findNodeContaining = <T>(
  itemRanges: { item: T; range: [number, number] }[],
  range: [number, number],
): T | undefined => itemRanges.find((itemRange) => checkIsRangeContaining(itemRange.range, range))?.item;
