import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readMaterialKeywords } from "#src/services/genshinAssets/shared/readMaterialKeywords";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { toMaterialValues } from "#src/services/genshinAssets/shared/toMaterialValues";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

// Every material a component's export holds, read as its values, with the keywords its raw bytes beside it hold
export const readComponentMaterials = async (component: DerivedAssetComponent): Promise<MaterialValues[]> => {
  const directory = join(getComponentDirectory(component).assets, AssetType.Material);
  if (!existsSync(directory)) return [];
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json"));
  return Promise.all(
    names.map(async (name) => {
      const rawPath = join(directory, `${basename(name, ".json")}.dat`);
      return toMaterialValues(
        parseMachineJson<ExportedMaterial>(await readFile(join(directory, name), "utf8"), reviveSourcePathId),
        existsSync(rawPath) ? readMaterialKeywords(await readFile(rawPath)) : [],
      );
    }),
  );
};
