export const getRecordDifferenceDescription = <T extends object, U extends object>(original: T, updated: U): string => {
  const keys = new Set([...Object.keys(original), ...Object.keys(updated)]);
  const rows: string[] = [];
  for (const key of keys) {
    const originalValue = (original as Record<string, unknown>)[key];
    const updatedValue = (updated as Record<string, unknown>)[key];
    if (originalValue !== updatedValue) rows.push(`${key} | ${String(originalValue)} | ${String(updatedValue)}`);
  }
  if (rows.length === 0) return "";
  return ["key | original | updated", "--- | --- | ---", ...rows].join("\n");
};
