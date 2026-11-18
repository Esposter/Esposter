import type { ExportedShader } from "#src/models/genshinAssets/effects/ExportedShader";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { parseSerializedShader } from "#src/services/genshinAssets/materials/parseSerializedShader";
import { readNames } from "#src/services/genshinAssets/materials/readNames";
import { readShaderBlockNames } from "#src/services/genshinAssets/materials/readShaderBlockNames";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { getResult } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Every shader the `shaders` step exported for a component, each folder of each block with its raw export beside the
// Blocks in `raw/<block>/Shader/`. A raw export that is missing, or whose serialized form does not read, is kept with no
// Shader, so the listing says it is not read
export const readExportedShaders = async (component: DerivedAssetComponent): Promise<ExportedShader[]> => {
  const { shaders: directory } = getComponentDirectory(component);
  const exported: ExportedShader[] = [];
  for (const block of await readShaderBlockNames(directory))
    for (const folder of await readNames(join(directory, block))) {
      const rawPath = join(directory, "raw", block, AssetType.Shader, `${folder}.dat`);
      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one raw export, up to hundreds of megabytes, is read at a time
      const data = existsSync(rawPath) ? await readFile(rawPath) : undefined;
      exported.push({
        block,
        folder,
        shader:
          data === undefined
            ? undefined
            : getResult(() => parseSerializedShader(data)).match(
                (shader) => shader,
                () => undefined,
              ),
      });
    }
  return exported;
};
