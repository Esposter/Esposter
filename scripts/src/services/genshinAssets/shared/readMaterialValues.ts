import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

import { readMaterialKeywords } from "#src/services/genshinAssets/shared/readMaterialKeywords";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { toMaterialValues } from "#src/services/genshinAssets/shared/toMaterialValues";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// A material read as its values from its exported JSON, with the keywords its raw bytes hold when the raw file exists
export const readMaterialValues = async (jsonPath: string, rawPath: string): Promise<MaterialValues> =>
  toMaterialValues(
    parseMachineJson<ExportedMaterial>(await readFile(jsonPath, "utf8"), reviveSourcePathId),
    existsSync(rawPath) ? readMaterialKeywords(await readFile(rawPath)) : [],
  );
