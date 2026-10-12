import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readMaterialValues } from "#src/services/genshinAssets/shared/readMaterialValues";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";

// Every material a component's export holds, read as its values, with the keywords its raw bytes beside it hold
export const readComponentMaterials = async (component: DerivedAssetComponent): Promise<MaterialValues[]> => {
  const directory = join(getComponentDirectory(component).assets, AssetType.Material);
  if (!existsSync(directory)) return [];
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json"));
  return readMaterialValues(
    names.map((name) => ({
      jsonPath: join(directory, name),
      rawPath: join(directory, `${basename(name, ".json")}.dat`),
    })),
  );
};
