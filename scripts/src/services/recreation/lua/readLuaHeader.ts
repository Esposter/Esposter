import type { LuaByteReader } from "#src/models/recreation/lua/LuaByteReader";

import { checkHeaderBytes } from "#src/services/recreation/lua/checkHeaderBytes";
import { checkHeaderField } from "#src/services/recreation/lua/checkHeaderField";
import {
  LUA_SIGNATURE_BYTES,
  LUA_SIZE_FIELD_BYTES,
  LUA_VERSION,
  LUAC_DATA_BYTES,
  LUAC_INTEGER,
  LUAC_NUMBER,
} from "#src/services/recreation/lua/constants";

// Checks the header against the reader's dialect: the signature, the version, the format and the data check bytes
// Then the size fields the dialect records, then the integer and float the header proves. It throws on any header
// It cannot vouch for, rather than reading a chunk the dialect does not describe
export const readLuaHeader = (reader: LuaByteReader): void => {
  const { dialect } = reader;
  checkHeaderBytes(reader.readBytes(LUA_SIGNATURE_BYTES.byteLength), LUA_SIGNATURE_BYTES, "signature");
  checkHeaderField(reader.readByte(), LUA_VERSION, "version");
  checkHeaderField(reader.readByte(), dialect.format, "format");
  checkHeaderBytes(reader.readBytes(LUAC_DATA_BYTES.byteLength), LUAC_DATA_BYTES, "data check bytes");
  for (const sizeField of dialect.sizes)
    checkHeaderField(reader.readByte(), LUA_SIZE_FIELD_BYTES[sizeField], `${sizeField} size`);
  checkHeaderField(reader.readUint64(), LUAC_INTEGER, "integer check");
  checkHeaderField(reader.readFloat64(), LUAC_NUMBER, "float check");
};
