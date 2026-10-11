// A global's element count: an array's length, an object's keys, or one for a value that is neither
export const countSceneScriptElements = (value: unknown): number => {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "object" && value !== null) return Object.keys(value).length;
  return 1;
};
