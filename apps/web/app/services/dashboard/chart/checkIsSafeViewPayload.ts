// A link is hand-editable, and the vendor's apply merges the decoded payload into its own objects. A key naming a
// prototype would write into one, so a payload carrying one anywhere is refused whole rather than applied in part
const UNSAFE_VIEW_KEYS: ReadonlySet<string> = new Set(["__proto__", "constructor", "prototype"]);

export const checkIsSafeViewPayload = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.every(checkIsSafeViewPayload);
  if (value === null || typeof value !== "object") return true;
  return Object.entries(value).every(([key, child]) => !UNSAFE_VIEW_KEYS.has(key) && checkIsSafeViewPayload(child));
};
