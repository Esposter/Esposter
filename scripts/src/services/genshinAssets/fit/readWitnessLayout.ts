import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SceneLayout } from "genshin-engine";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { readVouchedFileProvenance } from "#src/services/provenance/readVouchedFileProvenance";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A component's witness layout as `genshin:assets witness` wrote it beside the exports, read once its sidecar stamp names
// The install's game version, since a layout another version or no stamp vouches for places the wrong meshes
export const readWitnessLayout = async (component: DerivedAssetComponent): Promise<SceneLayout> => {
  const path = join(getComponentDirectory(component).root, WITNESS_LAYOUT_FILE_NAME);
  await readVouchedFileProvenance(path, await readGameVersion());
  return parseMachineJson<SceneLayout>(await readFile(path, "utf8"));
};
