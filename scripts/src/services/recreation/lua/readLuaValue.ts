import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

import { LuaTable } from "#src/models/recreation/lua/LuaTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A key that is a table has no string an object could take it as, so the table is refused rather than keyed `[object Object]`
const readLuaKey = (key: LuaValue): string => {
  if (key instanceof LuaTable)
    throw new InvalidOperationError(Operation.Read, "lua table", "has a table as a key, which no object can take");
  return String(key);
};

// A table keyed 1..n contiguously is an array, every other table an object keyed by its keys' strings
const readLuaTableValue = (table: LuaTable): Record<string, unknown> | unknown[] => {
  const entryCount = table.entries.size;
  const isSequence =
    entryCount > 0 &&
    Array.from({ length: entryCount }, (_value, index) => table.get(index + 1)).every((value) => value !== undefined);
  if (isSequence) return Array.from({ length: entryCount }, (_value, index) => readLuaValue(table.get(index + 1)));
  return Object.fromEntries(Array.from(table.entries, ([key, value]) => [readLuaKey(key), readLuaValue(value)]));
};

export const readLuaValue = (value: LuaValue): unknown =>
  value instanceof LuaTable ? readLuaTableValue(value) : value;
