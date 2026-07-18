// Walks any JSON-shaped value and maps every string leaf through `replace`, leaving structure and
// Non-string leaves untouched. Token substitution and id-to-alias rewriting are both string-leaf edits,
// So they share this one walk rather than each re-implementing the recursion
export const deepReplaceStrings = (value: unknown, replace: (value: string) => string): unknown => {
  if (typeof value === "string") return replace(value);
  else if (Array.isArray(value)) return value.map((item) => deepReplaceStrings(item, replace));
  else if (value !== null && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepReplaceStrings(item, replace)]));
  return value;
};
