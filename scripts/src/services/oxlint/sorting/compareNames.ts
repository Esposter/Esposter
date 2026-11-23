const COLLATOR = new Intl.Collator("en-US", { numeric: true });

// A name as it compares: lowercased, with every whitespace character dropped
const formatName = (name: string): string => name.toLowerCase().replaceAll(/\s/gu, "");

// The one name comparator, the engine's own collation: numbers inside a name compare by value (`item2` before
// `item10`), and punctuation sorts before letters, so a type literal's `{` leads a named type
export const compareNames = (left: string, right: string): number =>
  COLLATOR.compare(formatName(left), formatName(right));
