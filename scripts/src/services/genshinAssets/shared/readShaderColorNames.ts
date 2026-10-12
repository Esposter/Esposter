import type { ShaderColorNames } from "#src/models/genshinAssets/shared/ShaderColorNames";

import { ShaderPropertyType } from "#src/models/genshinAssets/materials/ShaderPropertyType";
import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { parseShaderProperties } from "#src/services/genshinAssets/materials/parseShaderProperties";
import { CAB_MAP_PATH, GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { createBlockOffsetFileFinder } from "#src/services/genshinAssets/shared/createBlockOffsetFileFinder";
import { exportBlockBySource } from "#src/services/genshinAssets/shared/exportBlockBySource";
import { parseCabMap } from "#src/services/recreation/animeStudio/parseCabMap";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

// Unity's ShaderPropertyFlags.Gamma: a colour the shader reads as saved
const GAMMA_FLAG = 32;

// Each shader's colour and vector names by its path ID, read from the property table of every copy of it: a shader is
// Found by its path ID in the asset index, its file by the offset the index gives it, and its block exported raw a
// Folder per file into a folder removed once read. A file holds one shader or two, read together, and a name two copies
// Declare differently is held as both, which a material holding it cannot be read by
export const readShaderColorNames = async (
  shaderPathIds: ReadonlySet<string>,
): Promise<Map<string, ShaderColorNames>> => {
  const pathIdNamesMap = new Map<string, { [Key in keyof ShaderColorNames]: Set<string> }>();
  if (shaderPathIds.size === 0) return pathIdNamesMap;
  const [cabMapBytes, shaders] = await Promise.all([
    readFile(CAB_MAP_PATH),
    readIndexedAssets(
      ({ pathId, type }) => type === AssetType.Shader && shaderPathIds.has(pathId),
      GENSHIN_ANIMESTUDIO_OPTIONS,
    ),
  ]);
  const findFile = createBlockOffsetFileFinder(parseCabMap(cabMapBytes));
  const directory = await mkdtemp(join(tmpdir(), "shader-properties-"));
  return withFinalizerAsync(
    async () => {
      for (const shaderBlock of new Set(shaders.map(({ block }) => block)))
        // oxlint-disable-next-line no-await-in-loop -- AnimeStudio exports one block at a time
        await exportBlockBySource(shaderBlock, [AssetType.Shader], AnimeStudioExportType.Raw, directory, {
          isUnparsed: true,
        });
      for (const { block, offset, pathId } of shaders) {
        const file = findFile(block, offset);
        if (file === undefined)
          throw new InvalidOperationError(
            Operation.Read,
            pathId,
            `lies at an offset the CAB map does not know in ${block}`,
          );
        const fileDirectory = join(directory, basename(block, ".blk"), AssetType.Shader, file);
        const names = pathIdNamesMap.get(pathId) ?? { colorNames: new Set<string>(), vectorNames: new Set<string>() };
        // oxlint-disable-next-line no-await-in-loop -- a file's shaders are read one at a time, each up to megabytes
        for (const shaderFile of await readdir(fileDirectory))
          // oxlint-disable-next-line no-await-in-loop -- as above
          for (const { flags, name, type } of parseShaderProperties(await readFile(join(fileDirectory, shaderFile))))
            if (type === ShaderPropertyType.Color && (flags & GAMMA_FLAG) === 0) names.colorNames.add(name);
            else if (type === ShaderPropertyType.Color || type === ShaderPropertyType.Vector)
              names.vectorNames.add(name);
        pathIdNamesMap.set(pathId, names);
      }
      const missingPathId = [...shaderPathIds].find((pathId) => !pathIdNamesMap.has(pathId));
      if (missingPathId !== undefined)
        throw new InvalidOperationError(
          Operation.Read,
          missingPathId,
          "is a material's shader the asset index does not hold",
        );
      return pathIdNamesMap;
    },
    () => rm(directory, { force: true, recursive: true }),
  );
};
