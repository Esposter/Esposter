import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A global's name is a string or a number constant, the only keys a global assignment sets
export const readGlobalName = (name: LuaValue): string => {
  if (typeof name === "string" || typeof name === "number") return String(name);
  throw new InvalidOperationError(
    Operation.Read,
    LUA_CHUNK_NAME,
    "sets a global with a key that is neither a string nor a number",
  );
};
