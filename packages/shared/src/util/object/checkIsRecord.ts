// Any object that is not a list: a row, a drizzle config, or a field map. A drizzle chunk is one too, class instance or
// Not
export const checkIsRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
