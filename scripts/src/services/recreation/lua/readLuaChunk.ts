import type { LuaDialect } from "#src/models/recreation/lua/LuaDialect";
import type { LuaFunction } from "#src/models/recreation/lua/LuaFunction";

import { LuaByteReader } from "#src/models/recreation/lua/LuaByteReader";
import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { readLuaFunction } from "#src/services/recreation/lua/readLuaFunction";
import { readLuaHeader } from "#src/services/recreation/lua/readLuaHeader";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Reads a binary chunk in a dialect, from its signature to the end of its main function, the length word already stripped
export const readLuaChunk = (bytes: Uint8Array, dialect: LuaDialect): LuaFunction => {
  const reader = new LuaByteReader(bytes, dialect);
  readLuaHeader(reader);
  // The main closure's upvalue count, which the chunk's own function already describes
  reader.readByte();
  const luaFunction = readLuaFunction(reader, "");
  if (!reader.isAtEnd)
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, "has bytes after its main function");
  return luaFunction;
};
