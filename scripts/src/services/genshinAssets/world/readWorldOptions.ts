import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WorldOptions } from "#src/models/genshinAssets/world/WorldOptions";

import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { WORLD_JSON_NAME } from "#src/services/genshinAssets/world/constants";
import { formatProducerStaleness } from "#src/services/producerStamp/formatProducerStaleness";
import { readProducerStaleness } from "#src/services/producerStamp/readProducerStaleness";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Each component directory's check of its producer's commits, so each is warned of once per process however many
// Reads start together. A check that fails is dropped, so the next read checks again rather than skipping it
const stalenessCheckMap = new Map<string, Promise<void>>();

const warnProducerStaleness = async (component: DerivedAssetComponent, root: string) => {
  const warning = formatProducerStaleness(component, await readProducerStaleness(root));
  if (warning) console.warn(warning);
};

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
  const stalenessCheck = stalenessCheckMap.get(root) ?? warnProducerStaleness(component, root);
  stalenessCheckMap.set(root, stalenessCheck);
  const error = await getResultAsync(() => stalenessCheck).match(
    () => undefined,
    (checkError) => checkError,
  );
  if (error) {
    // Only this failed check is dropped, never a retry a later read has started since
    if (stalenessCheckMap.get(root) === stalenessCheck) stalenessCheckMap.delete(root);
    throw error;
  }
  return parseMachineJson<WorldOptions>(await readFile(path, "utf8"));
};
