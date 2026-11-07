import type { LuaDialect } from "#src/models/recreation/lua/LuaDialect";

import { SCENE_SCRIPT_PRODUCER_PATHS } from "#src/services/genshinAssets/scene/constants";
import { writeStampedFiles } from "#src/services/provenance/writeStampedFiles";
import { evaluateLuaDataChunk } from "#src/services/recreation/lua/evaluateLuaDataChunk";
import { readLengthPrefixedChunk } from "#src/services/recreation/lua/readLengthPrefixedChunk";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { join, parse } from "node:path";

// The globals a scene script sets are written beside the export as `<name>.json`, stamped with the provenance that made them
export const exportSceneScript = async (file: string, dialect: LuaDialect): Promise<Record<string, unknown>> => {
  const globals = evaluateLuaDataChunk(await readLengthPrefixedChunk(file, dialect), dialect);
  const { dir: directory, name } = parse(file);
  const globalsPath = join(directory, `${name}.json`);
  await writeStampedFiles(
    [globalsPath],
    { command: `scene-scripts ${name}`, producerPaths: SCENE_SCRIPT_PRODUCER_PATHS },
    () => {
      writeJsonFile(globalsPath, globals);
    },
  );
  return globals;
};
