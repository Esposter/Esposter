import type { KitModuleFunction } from "#src/models/genshinAssets/kits/module/KitModuleFunction";

import ts from "typescript";

export const checkIsKitModuleFunction = (node: ts.Node): node is KitModuleFunction =>
  ts.isArrowFunction(node) ||
  ts.isFunctionExpression(node) ||
  ts.isFunctionDeclaration(node) ||
  ts.isMethodDeclaration(node);
