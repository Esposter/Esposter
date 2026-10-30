import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { composeInterfaceTree } from "#src/services/genshinAssets/interface/composeInterfaceTree";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { readUiBlockEntries } from "#src/services/genshinAssets/ui/readUiBlockEntries";
import { readUiBlockIndex } from "#src/services/genshinAssets/ui/readUiBlockIndex";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// A screen's interface as the game lays it out: the block holding it is found through an indexed asset beside it.
// Its UI index is read for the root of that name, and the tree under it is composed from the root's container alone.
// A container is one prefab, and the root's objects are the prefab's.
// The tree is written beside the exports
export const extractComponentInterface = async (component: DerivedAssetComponent): Promise<InterfaceNode> => {
  const { interface: interfaceOptions } = DerivedAssetComponentMap[component];
  if (!interfaceOptions) throw new InvalidOperationError(Operation.Read, component, "names no interface");
  const [block] = await readAssetBlocks(interfaceOptions.anchorPattern);
  if (!block) throw new InvalidOperationError(Operation.Read, interfaceOptions.anchorPattern, "in no block");
  const entries = await readUiBlockEntries(await readUiBlockIndex(block));
  const root = entries.find(({ name }) => name === interfaceOptions.root);
  if (!root) throw new InvalidOperationError(Operation.Read, interfaceOptions.root, `not in ${block}`);
  const tree = composeInterfaceTree(
    entries.filter(({ container }) => container === root.container),
    root,
  );
  writeJsonFile(join(getComponentDirectory(component).root, "interface", "interface.json"), tree);
  return tree;
};
