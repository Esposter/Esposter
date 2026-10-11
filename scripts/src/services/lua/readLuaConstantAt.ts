import type { LuaConstant } from "#src/models/lua/LuaConstant";
import type { LuaFunction } from "#src/models/lua/LuaFunction";

import { LUA_CHUNK_NAME } from "#src/services/lua/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const readLuaConstantAt = (luaFunction: LuaFunction, index: number): LuaConstant => {
  if (index >= luaFunction.constants.length)
    throw new InvalidOperationError(
      Operation.Read,
      LUA_CHUNK_NAME,
      `constant ${index} is past its ${luaFunction.constants.length} constants`,
    );
  return luaFunction.constants[index];
};
