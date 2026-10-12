// Whether a value is an object its keys can be read from.
// When it is, the type narrows, so a property of an unknown configuration is read only after it is checked.
export const checkIsRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
