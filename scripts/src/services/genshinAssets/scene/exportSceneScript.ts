import { evaluateLuaDataChunk } from "#src/services/lua/evaluateLuaDataChunk";
import { readLuaChunk } from "#src/services/lua/readLuaChunk";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { readFile } from "node:fs/promises";
import { join, parse } from "node:path";

// A raw export opens with its chunk's length as a four-byte word, then the chunk; the globals it sets are written beside
// the export as `<name>.json`
export const exportSceneScript = async (file: string): Promise<Record<string, unknown>> => {
  const bytes = await readFile(file);
  const chunkLength = bytes.readUInt32LE(0);
  const globals = evaluateLuaDataChunk(readLuaChunk(bytes.subarray(4, 4 + chunkLength)));
  const { dir, name } = parse(file);
  writeJsonFile(join(dir, `${name}.json`), globals);
  return globals;
};
