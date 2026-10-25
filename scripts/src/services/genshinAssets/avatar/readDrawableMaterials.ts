import type { DrawableMaterial } from "#src/models/genshinAssets/avatar/DrawableMaterial";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readName } from "#src/services/genshinAssets/avatar/readName";
import { resolveTextures } from "#src/services/genshinAssets/avatar/resolveTextures";
import { exportBlockBySource } from "#src/services/genshinAssets/shared/exportBlockBySource";
import { readMaterialValues } from "#src/services/genshinAssets/shared/readMaterialValues";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { takeOne } from "@esposter/shared";
import { basename, join } from "node:path";

export const readDrawableMaterials = async (
  materials: readonly ResolvedObject[],
  names: ReadonlyMap<string, string>,
  cabMap: ReadonlyMap<string, CabEntry>,
  exportDirectory: string,
): Promise<Map<string, DrawableMaterial>> => {
  // A type's export moves its files into place by name, so the JSON and the raw bytes each take a folder of their own
  const jsonDirectory = join(exportDirectory, "json");
  const rawDirectory = join(exportDirectory, "raw");
  const blocks = new Set(materials.map(({ block }) => block));
  for (const block of blocks)
    // oxlint-disable-next-line no-await-in-loop -- AnimeStudio exports one block at a time
    await exportBlockBySource(block, [AssetType.Material], AnimeStudioExportType.Json, jsonDirectory);
  for (const block of blocks)
    // oxlint-disable-next-line no-await-in-loop -- AnimeStudio exports one block at a time
    await exportBlockBySource(block, [AssetType.Material], AnimeStudioExportType.Raw, rawDirectory);
  const materialValues = await readMaterialValues(
    materials.map((material) => {
      const folderName = join(basename(material.block, ".blk"), AssetType.Material, material.file);
      const name = readName(names, material);
      return {
        jsonPath: join(jsonDirectory, folderName, `${name}.json`),
        rawPath: join(rawDirectory, folderName, `${name}.dat`),
      };
    }),
  );
  return new Map(
    materials.map(({ file, pathId }, index): [string, DrawableMaterial] => {
      const { colors, floats, keywords, textures } = takeOne(materialValues, index);
      return [
        toObjectKey(file, pathId),
        { colors, floats, keywords, textures: resolveTextures(textures, file, cabMap) },
      ];
    }),
  );
};
