// The name an entry of a docs map is keyed by, whether the entry is a quoted string in a list or a key of an object
export const getEntryKey = (line: string): string => line.trim().replaceAll(/["',]/gu, "").split(":")[0] ?? "";
