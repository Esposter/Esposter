import type { LuaByteReader } from "#src/models/lua/LuaByteReader";

import { LUA_LONG_STRING_SIZE_ESCAPE } from "#src/services/lua/constants";

// A string is a size one byte past its length (zero for none, which reads as ""), or the escape and a size_t
export const readLuaString = (reader: LuaByteReader): string => {
  const sizeByte = reader.readByte();
  const size = sizeByte === LUA_LONG_STRING_SIZE_ESCAPE ? Number(reader.readUint64()) : sizeByte;
  if (size === 0) return "";
  return new TextDecoder().decode(reader.readBytes(size - 1));
};
