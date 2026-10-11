import type { LuaByteReader } from "#src/models/lua/LuaByteReader";

import {
  LUA_CHUNK_NAME,
  LUA_FORMAT,
  LUA_INSTRUCTION_BYTES,
  LUA_INTEGER_BYTES,
  LUA_NUMBER_BYTES,
  LUA_SIGNATURE_BYTES,
  LUA_VERSION,
  LUAC_DATA_BYTES,
  LUAC_INTEGER,
  LUAC_NUMBER,
} from "#src/services/lua/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

const checkHeaderField = (actual: bigint | number, expected: bigint | number, field: string): void => {
  if (actual !== expected)
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `${field} is ${actual}, not ${expected}`);
};

const checkHeaderBytes = (actual: Uint8Array, expected: Uint8Array, field: string): void => {
  if (!actual.every((byte, index) => byte === expected[index]))
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `${field} do not match Lua 5.3's`);
};

// Checks the header of Lua 5.3's own format, and throws on any other rather than reading a chunk it cannot vouch for
export const readLuaHeader = (reader: LuaByteReader): void => {
  checkHeaderBytes(reader.readBytes(LUA_SIGNATURE_BYTES.byteLength), LUA_SIGNATURE_BYTES, "signature");
  checkHeaderField(reader.readByte(), LUA_VERSION, "version");
  checkHeaderField(reader.readByte(), LUA_FORMAT, "format");
  checkHeaderBytes(reader.readBytes(LUAC_DATA_BYTES.byteLength), LUAC_DATA_BYTES, "data check bytes");
  checkHeaderField(reader.readByte(), LUA_INSTRUCTION_BYTES, "instruction size");
  checkHeaderField(reader.readByte(), LUA_INTEGER_BYTES, "lua_Integer size");
  checkHeaderField(reader.readByte(), LUA_NUMBER_BYTES, "lua_Number size");
  checkHeaderField(reader.readUint64(), LUAC_INTEGER, "integer check");
  checkHeaderField(reader.readFloat64(), LUAC_NUMBER, "float check");
};
