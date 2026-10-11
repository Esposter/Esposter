// A JSON object, as opposed to an array, a string or a null, for a manifest field typed `unknown`
export const checkIsRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
