// `typeof null === "object"`, so every nullish value that reaches `Object.entries` throws. The original iterates with
// `for key of obj`, which runs zero times for one, so a nullish value contributes no entries here either.
export const getEntries = <T>(value: unknown): [string, T][] =>
  value === null || value === undefined ? [] : Object.entries(value as Record<string, T>);
