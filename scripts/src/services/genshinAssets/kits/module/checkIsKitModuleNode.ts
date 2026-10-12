import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";
import type ts from "typescript";

// Whether a node is the module's own, which the checker may hand back from a tree of its own for the same file
export const checkIsKitModuleNode = ({ sourceFile }: KitModuleSource, node: ts.Node): boolean =>
  node.getSourceFile().fileName === sourceFile.fileName;
