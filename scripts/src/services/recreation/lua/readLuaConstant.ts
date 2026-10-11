import type { LuaByteReader } from "#src/models/recreation/lua/LuaByteReader";
import type { LuaConstant } from "#src/models/recreation/lua/LuaConstant";

import { LuaConstantTag } from "#src/models/recreation/lua/LuaConstantTag";
import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { readLuaString } from "#src/services/recreation/lua/readLuaString";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const readLuaConstant = (reader: LuaByteReader): LuaConstant => {
  const tag = reader.readByte();
  switch (tag) {
    case LuaConstantTag.Boolean:
      return reader.readByte() !== 0;
    case LuaConstantTag.Float:
      return reader.readFloat64();
    case LuaConstantTag.Integer:
      return Number(BigInt.asIntN(64, reader.readUint64()));
    case LuaConstantTag.LongString:
    case LuaConstantTag.ShortString:
      return readLuaString(reader);
    case LuaConstantTag.Nil:
      return undefined;
    default:
      throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `constant of tag ${tag} is not a Lua 5.3 type`);
  }
};
