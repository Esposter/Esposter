import type { LuaDialect } from "#src/models/lua/LuaDialect";
import type { LuaFunction } from "#src/models/lua/LuaFunction";

import { readLuaChunk } from "#src/services/lua/readLuaChunk";
import { readFile } from "node:fs/promises";

// A raw export opens with its chunk's length as a four-byte word, then the chunk, read in the dialect given
export const readSceneScriptChunk = async (file: string, dialect: LuaDialect): Promise<LuaFunction> => {
  const bytes = await readFile(file);
  const chunkLength = bytes.readUInt32LE(0);
  return readLuaChunk(bytes.subarray(4, 4 + chunkLength), dialect);
};
