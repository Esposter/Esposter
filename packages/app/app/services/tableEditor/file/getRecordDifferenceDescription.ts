export const getRecordDifferenceDescription = <T extends object, U extends object>(original: T, updated: U): string[] => {
  const keys = new Set([...Object.keys(original), ...Object.keys(updated)]);
  const changes: string[] = [];
  for (const key of keys) {
    const originalValue = (original as Record<string, unknown>)[key];
    const updatedValue = (updated as Record<string, unknown>)[key];
    if (originalValue !== updatedValue) changes.push(`${key}: ${String(originalValue)} → ${String(updatedValue)}`);
  }
  return changes;
};
