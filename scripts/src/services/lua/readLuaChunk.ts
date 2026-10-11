import type { LuaFunction } from "#src/models/lua/LuaFunction";

import { LuaByteReader } from "#src/models/lua/LuaByteReader";
import { LUA_CHUNK_NAME } from "#src/services/lua/constants";
import { readLuaFunction } from "#src/services/lua/readLuaFunction";
import { readLuaHeader } from "#src/services/lua/readLuaHeader";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Reads a Lua 5.3 binary chunk, from its signature to the end of its main function, the length word already stripped
export const readLuaChunk = (bytes: Uint8Array): LuaFunction => {
  const reader = new LuaByteReader(bytes);
  readLuaHeader(reader);
  // The main closure's upvalue count, which the chunk's own function already describes
  reader.readByte();
  const luaFunction = readLuaFunction(reader, "");
  if (!reader.isAtEnd)
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, "has bytes after its main function");
  return luaFunction;
};
