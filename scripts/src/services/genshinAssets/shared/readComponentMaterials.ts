import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readMaterialValues } from "#src/services/genshinAssets/shared/readMaterialValues";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Every material a component's export holds, read as its values
export const readComponentMaterials = async (component: DerivedAssetComponent): Promise<MaterialValues[]> => {
  const directory = join(getComponentDirectory(component).assets, "Material");
  if (!existsSync(directory)) return [];
  const names = await readdir(directory);
  return Promise.all(
    names.map(async (name) =>
      readMaterialValues(
        parseMachineJson<ExportedMaterial>(await readFile(join(directory, name), "utf8"), reviveSourcePathId),
      ),
    ),
  );
};
