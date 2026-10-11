import { takeOne } from "@esposter/shared";

// A value's shape with its values removed: its leaves as type names, and an object's keys each shown once. An object
// Of more keys than the few a reader scans shows its first key's shape and the count, never its values
const MAX_SHOWN_KEYS = 8;

export const formatSceneScriptShape = (value: unknown): string => {
  if (Array.isArray(value)) return value.length === 0 ? "[]" : `[${formatSceneScriptShape(value[0])}]`;
  if (typeof value !== "object" || value === null) return typeof value;
  const entries = Object.entries(value);
  if (entries.length > MAX_SHOWN_KEYS) {
    const [firstKey, firstValue] = takeOne(entries, 0);
    return `{ ${firstKey}: ${formatSceneScriptShape(firstValue)} } (${entries.length} keys)`;
  }
  return `{ ${entries.map(([key, entry]) => `${key}: ${formatSceneScriptShape(entry)}`).join(", ")} }`;
};
