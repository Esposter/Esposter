import type { LuaValue } from "#src/models/lua/LuaValue";

import { LuaTable } from "#src/models/lua/LuaTable";

// A table keyed 1..n contiguously is an array, every other table an object keyed by its keys' strings
const readLuaTableValue = (table: LuaTable): Record<string, unknown> | unknown[] => {
  const entryCount = table.entries.size;
  const isSequence =
    entryCount > 0 &&
    Array.from({ length: entryCount }, (_value, index) => table.get(index + 1)).every((value) => value !== undefined);
  if (isSequence) return Array.from({ length: entryCount }, (_value, index) => readLuaValue(table.get(index + 1)));
  return Object.fromEntries(Array.from(table.entries, ([key, value]) => [String(key), readLuaValue(value)]));
};

export const readLuaValue = (value: LuaValue): unknown =>
  value instanceof LuaTable ? readLuaTableValue(value) : value;
