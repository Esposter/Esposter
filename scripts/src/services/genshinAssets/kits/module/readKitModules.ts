import type { KitModule } from "#src/models/genshinAssets/kits/module/KitModule";

import {
  KIT_MODULE_DIRECTORY,
  KIT_MODULE_FILE_SUFFIX,
  TRAVELER_KIT_MODULE_PATH,
} from "#src/services/genshinAssets/kits/constants";
import { analyseKitModule } from "#src/services/genshinAssets/kits/module/analyseKitModule";
import { createKitModuleProgram } from "#src/services/genshinAssets/kits/module/createKitModuleProgram";
import { loadKitModule } from "#src/services/genshinAssets/kits/module/loadKitModule";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Every kit module in the world package, each character's and the Traveler's, analysed in one program under the
// Package's own configuration and loaded with its sites probed
export const readKitModules = (): Promise<KitModule[]> => {
  const files = [
    ...readdirSync(KIT_MODULE_DIRECTORY)
      .filter((file) => file.endsWith(KIT_MODULE_FILE_SUFFIX))
      .map((file) => join(KIT_MODULE_DIRECTORY, file)),
    TRAVELER_KIT_MODULE_PATH,
  ];
  const program = createKitModuleProgram(files);
  return Promise.all(files.map((file) => loadKitModule(analyseKitModule(program, file))));
};
