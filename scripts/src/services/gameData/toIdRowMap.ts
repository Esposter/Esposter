import { checkIsPlainObject } from "@esposter/shared";

// The rows of an array keyed by `key`, or undefined when a row has none or two rows share one
export const toIdRowMap = (rows: unknown[], key: string): Map<unknown, unknown> | undefined => {
  const idRowMap = new Map<unknown, unknown>();
  for (const row of rows) {
    if (!checkIsPlainObject(row)) return undefined;
    const id = row[key];
    if ((typeof id !== "number" && typeof id !== "string") || idRowMap.has(id)) return undefined;
    idRowMap.set(id, row);
  }
  return idRowMap;
};
