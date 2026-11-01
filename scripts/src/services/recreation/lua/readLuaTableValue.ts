import type { LuaTable } from "#src/models/recreation/lua/LuaTable";
import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

import { readLuaKey } from "#src/services/recreation/lua/readLuaKey";

// A table keyed 1..n contiguously is an array, every other table an object keyed by its keys' strings. Its values are read
// through the reader it is handed, the one that calls it, so this file never imports that reader back
export const readLuaTableValue = (
  table: LuaTable,
  readValue: (value: LuaValue) => unknown,
): Record<string, unknown> | unknown[] => {
  const entryCount = table.entries.size;
  const isSequence =
    entryCount > 0 &&
    Array.from({ length: entryCount }, (_value, index) => table.get(index + 1)).every((value) => value !== undefined);
  if (isSequence) return Array.from({ length: entryCount }, (_value, index) => readValue(table.get(index + 1)));
  return Object.fromEntries(Array.from(table.entries, ([key, value]) => [readLuaKey(key), readValue(value)]));
};
