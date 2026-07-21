// Walks any JSON-shaped value and maps every string leaf through `replace`, leaving structure and
// Non-string leaves untouched. Token substitution, id-to-alias rewriting and blob-url re-signing are all
// String-leaf edits, so they share this one walk rather than each re-implementing the recursion.
//
// Walking is also what keeps a leaf's text raw: a caller that instead serializes the value and rewrites the
// Serialized form hands its matcher the serializer's escaping on top of the content's own
// ([content token rewriting](/docs/architecture/content-token-rewriting)). The traversal reproduces what a
// `JSON.stringify` -> `jsonDateParse` round trip produced, so it is a drop-in for one: own enumerable entries
// Only, `undefined` values dropped, and Dates kept as Dates (the round trip revived them from their ISO form)
export const deepReplaceStrings = <TValue>(value: TValue, replace: (value: string) => string): TValue => {
  if (typeof value === "string") return replace(value) as TValue;
  else if (Array.isArray(value)) return value.map((item) => deepReplaceStrings(item, replace)) as TValue;
  else if (value === null || typeof value !== "object" || value instanceof Date) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, deepReplaceStrings(item, replace)]),
  ) as TValue;
};
