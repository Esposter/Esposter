import { computeComparableName } from "#src/services/oxlint/sorting/names/computeComparableName";

const COLLATOR = new Intl.Collator("en-US", { numeric: true });

// The one name comparator, the engine's own collation: numbers inside a name compare by value (`item2` before
// `item10`), and punctuation sorts before letters, so a type literal's `{` leads a named type
export const compareNames = (left: string, right: string): number =>
  COLLATOR.compare(computeComparableName(left), computeComparableName(right));
