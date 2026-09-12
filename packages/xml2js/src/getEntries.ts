// `typeof null === "object"`, so a nullish value that reached `Object.entries` would throw; the guard hands back no
// Entries instead. That matches the original, whose CoffeeScript `for key of obj` compiles to a `for...in` that runs
// Zero times over a nullish value.
export const getEntries = <T>(value: unknown): [string, T][] =>
  value === null || value === undefined ? [] : Object.entries(value as Record<string, T>);
