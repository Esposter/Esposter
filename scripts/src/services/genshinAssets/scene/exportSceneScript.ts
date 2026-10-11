import type { LuaDialect } from "#src/models/lua/LuaDialect";

import { SCENE_SCRIPT_PRODUCER_PATHS } from "#src/services/genshinAssets/scene/constants";
import { readSceneScriptChunk } from "#src/services/genshinAssets/scene/readSceneScriptChunk";
import { evaluateLuaDataChunk } from "#src/services/lua/evaluateLuaDataChunk";
import { writeProducerStamp } from "#src/services/producerStamp/writeProducerStamp";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { join, parse } from "node:path";

// The globals a scene script sets are written beside the export as `<name>.json`, stamped with the commit that made them
export const exportSceneScript = async (file: string, dialect: LuaDialect): Promise<Record<string, unknown>> => {
  const globals = evaluateLuaDataChunk(await readSceneScriptChunk(file, dialect), dialect);
  const { dir: directory, name } = parse(file);
  writeJsonFile(join(directory, `${name}.json`), globals);
  writeProducerStamp(directory, SCENE_SCRIPT_PRODUCER_PATHS);
  return globals;
};
