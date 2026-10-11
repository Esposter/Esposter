import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WorldOptions } from "#src/models/genshinAssets/world/WorldOptions";

import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { WORLD_JSON_NAME } from "#src/services/genshinAssets/world/constants";
import { formatProducerStaleness } from "#src/services/producerStamp/formatProducerStaleness";
import { readProducerStaleness } from "#src/services/producerStamp/readProducerStaleness";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The open world block a component's exports are laid out by: the one its map holds (Windrise's, set by hand), or the
// The component directories whose producer's commits have been reported, so each is warned of once per process
const warnedDirectories = new Set<string>();

// The open world block a component's exports are laid out by: the one its map holds (Windrise's, set by hand), or the
// One `extract` derived from its capital and wrote beside its exports. Undefined for a component with no open world
export const readWorldOptions = async (component: DerivedAssetComponent): Promise<undefined | WorldOptions> => {
  const { isCapitalWorld, world } = DerivedAssetComponentMap[component];
  if (world) return world;
  if (!isCapitalWorld) return undefined;
  const { root, world: worldDirectory } = getComponentDirectory(component);
  const path = join(worldDirectory, WORLD_JSON_NAME);
  if (!existsSync(path))
    throw new InvalidOperationError(Operation.Read, component, "has no derived world: run extract for it first");
  if (!warnedDirectories.has(root)) {
    warnedDirectories.add(root);
    const warning = formatProducerStaleness(component, await readProducerStaleness(root));
    if (warning) console.warn(warning);
  }
  return parseMachineJson<WorldOptions>(await readFile(path, "utf8"));
};
