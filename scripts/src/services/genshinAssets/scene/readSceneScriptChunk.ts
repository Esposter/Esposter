import type { LuaDialect } from "#src/models/lua/LuaDialect";
import type { LuaFunction } from "#src/models/lua/LuaFunction";

import { readLuaChunk } from "#src/services/lua/readLuaChunk";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";

// A raw export opens with its chunk's length as a four-byte word, then the chunk, read in the dialect given
export const readSceneScriptChunk = async (file: string, dialect: LuaDialect): Promise<LuaFunction> => {
  const bytes = await readFile(file);
  if (bytes.byteLength < 4 || bytes.readUInt32LE(0) !== bytes.byteLength - 4)
    throw new InvalidOperationError(Operation.Read, file, "has a length word that does not match its size");
  return readLuaChunk(bytes.subarray(4), dialect);
};
