import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WorldOptions } from "#src/models/genshinAssets/world/WorldOptions";

import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { WORLD_JSON_NAME } from "#src/services/genshinAssets/world/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The open world block a component's exports are laid out by: the one its map holds (Windrise's, set by hand), or the
// One `extract` derived from its capital and wrote beside its exports. Undefined for a component with no open world
export const readWorldOptions = async (component: DerivedAssetComponent): Promise<undefined | WorldOptions> => {
  const { isCapitalWorld, world } = DerivedAssetComponentMap[component];
  if (world) return world;
  if (!isCapitalWorld) return undefined;
  const path = join(getComponentDirectory(component).world, WORLD_JSON_NAME);
  if (!existsSync(path))
    throw new InvalidOperationError(Operation.Read, component, "has no derived world: run extract for it first");
  return parseMachineJson<WorldOptions>(await readFile(path, "utf8"));
};
