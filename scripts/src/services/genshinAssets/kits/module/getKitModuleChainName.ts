import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";

import { getKitModuleContextName } from "#src/services/genshinAssets/kits/module/getKitModuleContextName";
import { toKitModuleName } from "#src/services/genshinAssets/kits/module/toKitModuleName";
import ts from "typescript";

// The name a value a kit module reads from outside a closure goes by: its binding's, then each property read from it,
// An element read keeping its array's name
export const getKitModuleChainName = (source: KitModuleSource, node: ts.Expression): string => {
  if (ts.isIdentifier(node)) return toKitModuleName([node.text]);
  else if (ts.isPropertyAccessExpression(node))
    return toKitModuleName([getKitModuleChainName(source, node.expression), node.name.text]);
  else if (ts.isElementAccessExpression(node) || ts.isNonNullExpression(node) || ts.isParenthesizedExpression(node))
    return getKitModuleChainName(source, node.expression);
  else return getKitModuleContextName(source, node);
};
