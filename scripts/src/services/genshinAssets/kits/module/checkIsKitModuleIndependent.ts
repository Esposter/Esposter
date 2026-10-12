import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";

import { checkIsKitModuleNode } from "#src/services/genshinAssets/kits/module/checkIsKitModuleNode";
import { findKitModuleDeclaration } from "#src/services/genshinAssets/kits/module/findKitModuleDeclaration";
import ts from "typescript";

const checkContains = (outer: ts.Node, inner: ts.Node) => inner.pos >= outer.pos && inner.end <= outer.end;

// Whether an expression reads nothing declared inside the scope it sits in other than within itself, so it can be read
// Again where the scope starts
export const checkIsKitModuleIndependent = (source: KitModuleSource, expression: ts.Node, scope: ts.Node): boolean => {
  let isIndependent = true;
  const visit = (node: ts.Node) => {
    if (!isIndependent) return;
    else if (node.kind === ts.SyntaxKind.ThisKeyword) isIndependent = false;
    else if (ts.isIdentifier(node)) {
      const { parent } = node;
      const isPropertyName =
        (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
        (ts.isPropertyAssignment(parent) && parent.name === node) ||
        (ts.isBindingElement(parent) && parent.propertyName === node);
      const declaration = isPropertyName ? undefined : findKitModuleDeclaration(source, node);
      if (
        declaration !== undefined &&
        checkIsKitModuleNode(source, declaration) &&
        checkContains(scope, declaration) &&
        !checkContains(expression, declaration)
      )
        isIndependent = false;
    }
    ts.forEachChild(node, visit);
  };
  visit(expression);
  return isIndependent;
};
