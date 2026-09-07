// Read-only companion to `deepReplaceStrings`: walks the same JSON-shaped structure and hands every string
// Leaf to `visit` without rebuilding anything, so a caller that only scans — collecting blob urls — pays a
// Traversal instead of a deep clone it would immediately discard
export const deepVisitStrings = (value: unknown, visit: (value: string) => void): void => {
  if (typeof value === "string") visit(value);
  else if (Array.isArray(value)) for (const item of value) deepVisitStrings(item, visit);
  else if (value !== null && typeof value === "object")
    for (const item of Object.values(value)) deepVisitStrings(item, visit);
};
