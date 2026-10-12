import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";

import ts from "typescript";

// The node of the module's own tree at the place of one the checker handed back from a tree of its own for the same
// File, where node identity holds
const toModuleNode = <T extends ts.Node>({ sourceFile }: KitModuleSource, node: T): T => {
  if (node.getSourceFile() === sourceFile || node.getSourceFile().fileName !== sourceFile.fileName) return node;
  let ancestor: ts.Node = sourceFile;
  for (;;) {
    if (ancestor.pos === node.pos && ancestor.end === node.end && ancestor.kind === node.kind) return ancestor as T;
    const child = ancestor
      .getChildren(sourceFile)
      .find((candidate) => candidate.pos <= node.pos && candidate.end >= node.end);
    if (child === undefined) return node;
    ancestor = child;
  }
};

// The declaration an identifier names, through an import or a shorthand property, in the module's own tree where it
// Is the module's
export const findKitModuleDeclaration = (source: KitModuleSource, node: ts.Node): ts.Declaration | undefined => {
  const { checker } = source;
  const symbol =
    ts.isShorthandPropertyAssignment(node.parent) && node.parent.name === node
      ? checker.getShorthandAssignmentValueSymbol(node.parent)
      : checker.getSymbolAtLocation(node);
  if (symbol === undefined) return undefined;
  const resolvedSymbol = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const declaration = resolvedSymbol.valueDeclaration ?? resolvedSymbol.declarations?.[0];
  return declaration === undefined ? undefined : toModuleNode(source, declaration);
};
