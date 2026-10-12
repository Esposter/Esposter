import type { LuaDialect } from "#src/models/recreation/lua/LuaDialect";

import { SCENE_SCRIPT_PRODUCER_PATHS } from "#src/services/genshinAssets/scene/constants";
import { writeProducerStamp } from "#src/services/producerStamp/writeProducerStamp";
import { evaluateLuaDataChunk } from "#src/services/recreation/lua/evaluateLuaDataChunk";
import { readLengthPrefixedChunk } from "#src/services/recreation/lua/readLengthPrefixedChunk";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { join, parse } from "node:path";

// The globals a scene script sets are written beside the export as `<name>.json`, stamped with the commit that made them
export const exportSceneScript = async (file: string, dialect: LuaDialect): Promise<Record<string, unknown>> => {
  const globals = evaluateLuaDataChunk(await readLengthPrefixedChunk(file, dialect), dialect);
  const { dir: directory, name } = parse(file);
  writeJsonFile(join(directory, `${name}.json`), globals);
  writeProducerStamp(directory, SCENE_SCRIPT_PRODUCER_PATHS);
  return globals;
};
