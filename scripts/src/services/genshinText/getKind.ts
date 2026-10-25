export const getKind = (value: unknown): string =>
  Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
