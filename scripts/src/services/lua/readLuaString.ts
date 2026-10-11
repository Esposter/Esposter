import type { LuaByteReader } from "#src/models/lua/LuaByteReader";

import { LuaSizeField } from "#src/models/lua/LuaSizeField";
import { LUA_CHUNK_NAME, LUA_LONG_STRING_SIZE_ESCAPE } from "#src/services/lua/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A string is a size one byte past its length (zero for none, which reads as ""), or the escape and a size_t
export const readLuaString = (reader: LuaByteReader): string => {
  const sizeByte = reader.readByte();
  if (sizeByte === LUA_LONG_STRING_SIZE_ESCAPE && !reader.dialect.sizes.includes(LuaSizeField.SizeT))
    throw new InvalidOperationError(
      Operation.Read,
      LUA_CHUNK_NAME,
      `has a long string, but ${reader.dialect.name} records no size_t to read its size`,
    );
  const size = sizeByte === LUA_LONG_STRING_SIZE_ESCAPE ? Number(reader.readUint64()) : sizeByte;
  if (size === 0) return "";
  return new TextDecoder().decode(reader.readBytes(size - 1));
};
