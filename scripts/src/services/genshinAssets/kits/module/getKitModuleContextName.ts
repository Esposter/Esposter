import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";

import { checkIsKitModuleFunction } from "#src/services/genshinAssets/kits/module/checkIsKitModuleFunction";
import { checkIsKitModuleNode } from "#src/services/genshinAssets/kits/module/checkIsKitModuleNode";
import { findKitModuleDeclaration } from "#src/services/genshinAssets/kits/module/findKitModuleDeclaration";
import { getEnclosingKitModuleFunction } from "#src/services/genshinAssets/kits/module/getEnclosingKitModuleFunction";
import { getKitModulePropertyName } from "#src/services/genshinAssets/kits/module/getKitModulePropertyName";
import { toKitModuleName } from "#src/services/genshinAssets/kits/module/toKitModuleName";
import ts from "typescript";

// The name an expression of a kit module goes by where it sits: the variable or property it initialises, prefixed by
// The properties up to the nearest variable, or the parameter it is passed as to a function of the module, the create
// Function's own name left out. One that sits in nothing named goes by its line
export const getKitModuleContextName = (source: KitModuleSource, node: ts.Node): string => {
  const { createFunction, createName, sourceFile } = source;
  const parts: string[] = [];
  let child: ts.Node = node;
  while (!ts.isSourceFile(child.parent)) {
    const { parent } = child;
    if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
      if (parent.name.text !== createName) parts.unshift(parent.name.text);
      break;
    } else if (ts.isPropertyAssignment(parent) || ts.isShorthandPropertyAssignment(parent)) {
      const propertyName = getKitModulePropertyName(parent.name);
      if (propertyName !== undefined) parts.unshift(propertyName);
      child = parent.parent;
    } else if (ts.isCallExpression(parent) && parent.arguments.includes(child as ts.Expression)) {
      const declaration = findKitModuleDeclaration(source, parent.expression);
      const callee =
        declaration !== undefined && ts.isVariableDeclaration(declaration) ? declaration.initializer : undefined;
      const parameter =
        callee !== undefined && checkIsKitModuleFunction(callee) && checkIsKitModuleNode(source, callee)
          ? callee.parameters[parent.arguments.indexOf(child as ts.Expression)]
          : undefined;
      if (parts.length === 0 && parameter !== undefined && ts.isIdentifier(parameter.name))
        parts.unshift(parameter.name.text);
      child = parent;
    } else if (
      ts.isReturnStatement(parent) ||
      ts.isBlock(parent) ||
      ts.isExpressionStatement(parent) ||
      ts.isIfStatement(parent)
    ) {
      const enclosingFunction = getEnclosingKitModuleFunction(parent);
      if (enclosingFunction === undefined || enclosingFunction === createFunction) break;
      child = enclosingFunction;
    } else child = parent;
  }
  return parts.length === 0
    ? `line${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1}`
    : toKitModuleName(parts);
};
