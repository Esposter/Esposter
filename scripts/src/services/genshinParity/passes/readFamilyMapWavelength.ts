import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SceneLayout } from "genshin-engine";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readTextureWavelength } from "#src/services/genshinParity/passes/readTextureWavelength";
import { jsonDateParse } from "@esposter/shared";
import { LoginPartFamily, LoginPartFamilyMeshRegexMap } from "genshin-world";
import { WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A family's normal-map wavelength in metres, read off the component's exported layout and its meshes and maps. None for
// A family the login does not name, which holds no map a parity pass reads
export const readFamilyMapWavelength = async (
  component: DerivedAssetComponent,
  family: string,
): Promise<number | undefined> => {
  const familyName = Object.values(LoginPartFamily).find((name) => name === family);
  if (familyName === undefined) return undefined;
  const directory = getComponentDirectory(component);
  const layout = jsonDateParse<SceneLayout>(await readFile(join(directory.root, WITNESS_LAYOUT_FILE_NAME), "utf8"));
  return readTextureWavelength({
    assets: directory.assets,
    checkIsFamilyMesh: (mesh) => LoginPartFamilyMeshRegexMap[familyName].test(mesh),
    layout,
  });
};
