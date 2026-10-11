import type { KitModuleFunction } from "#src/models/genshinAssets/kits/module/KitModuleFunction";
import type ts from "typescript";

import { checkIsKitModuleFunction } from "#src/services/genshinAssets/kits/module/checkIsKitModuleFunction";

export const getEnclosingKitModuleFunction = (node: ts.Node): KitModuleFunction | undefined => {
  for (let parent = node.parent; parent !== undefined; parent = parent.parent)
    if (checkIsKitModuleFunction(parent)) return parent;
  return undefined;
};
