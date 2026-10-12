import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

import { readMaterialKeywords } from "#src/services/genshinAssets/shared/readMaterialKeywords";
import { readShaderColorNames } from "#src/services/genshinAssets/shared/readShaderColorNames";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { toMaterialValues } from "#src/services/genshinAssets/shared/toMaterialValues";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// Materials read as their values from their exported JSON, each with the keywords its raw bytes hold when the raw file
// Exists, and its colours read as the shader it draws with declares them, the shaders of them all read at once
export const readMaterialValues = async (
  paths: readonly { jsonPath: string; rawPath: string }[],
): Promise<MaterialValues[]> => {
  const materials = await Promise.all(
    paths.map(async ({ jsonPath, rawPath }) => ({
      keywords: existsSync(rawPath) ? readMaterialKeywords(await readFile(rawPath)) : [],
      material: parseMachineJson<ExportedMaterial>(await readFile(jsonPath, "utf8"), reviveSourcePathId),
    })),
  );
  const shaderColorNamesMap = await readShaderColorNames(
    new Set(materials.map(({ material }) => material.m_Shader.m_PathID)),
  );
  return materials.map(({ keywords, material }) => {
    const shaderColorNames = shaderColorNamesMap.get(material.m_Shader.m_PathID);
    if (!shaderColorNames)
      throw new InvalidOperationError(
        Operation.Read,
        material.m_Name,
        "draws with a shader whose properties were not read",
      );
    return toMaterialValues(material, keywords, shaderColorNames);
  });
};
