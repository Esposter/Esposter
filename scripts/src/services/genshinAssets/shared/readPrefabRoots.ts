import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { CAB_MAP_PATH } from "#src/services/genshinAssets/shared/constants";
import { findRootsByName } from "#src/services/genshinAssets/shared/findRootsByName";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import { parseCabMap } from "#src/services/recreation/animeStudio/parseCabMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// The prefab roots a GameObject's name is found under, read from the props' layout dumps. Those dumps are the ones
// `extract` writes, so a block whose layout is not yet dumped is refused rather than exported here
export const readPrefabRoots = async (name: string): Promise<AssetRoot[]> => {
  const { layout } = getComponentDirectory(DerivedAssetComponent.Props);
  if (!existsSync(layout))
    throw new InvalidOperationError(Operation.Read, name, "names no prefab root: no props layout is dumped yet");
  const cabMap = parseCabMap(await readFile(CAB_MAP_PATH));
  return findRootsByName(await readSceneLayout(layout), cabMap, name);
};
