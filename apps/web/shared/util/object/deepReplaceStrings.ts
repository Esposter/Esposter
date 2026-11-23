// The walk over unknown: a recursive rebuild of a generic value has no type the compiler can carry through, so the one
// Claim that it keeps the value's shape is stated once, on the export
const replaceStrings = (value: unknown, replace: (value: string) => string): unknown => {
  if (typeof value === "string") return replace(value);
  else if (Array.isArray(value)) return value.map((item) => replaceStrings(item, replace));
  else if (value === null || typeof value !== "object" || value instanceof Date) return value;
  else
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, replaceStrings(item, replace)]),
    );
};

// Walks any JSON-shaped value and maps every string leaf through `replace`, leaving structure and Non-string leaves
// Untouched. Token substitution, id-to-alias rewriting and blob-url re-signing are all String-leaf edits, so they share
// This one walk rather than each re-implementing the recursion. Walking is also what keeps a leaf's text raw: a caller
// That instead serializes the value and rewrites the Serialized form hands its matcher the serializer's escaping on top
// Of the content's own ([content token rewriting](openspec/specs/architecture/content-token-rewriting/design.md)). The
// Traversal reproduces what a `JSON.stringify` -> `jsonDateParse` round trip produced, so it is a drop-in for one: own
// Enumerable entries Only, `undefined` values dropped, and Dates kept as Dates (the round trip revived them from their
// ISO form)
export const deepReplaceStrings = <TValue>(value: TValue, replace: (value: string) => string): TValue =>
  // The walk returns the value's own shape with each string leaf replaced, which TypeScript cannot
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- state for a generic value rebuilt through unknown
  replaceStrings(value, replace) as TValue;
