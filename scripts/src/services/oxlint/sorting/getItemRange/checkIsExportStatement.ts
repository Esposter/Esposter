import type { ESTree } from "@oxlint/plugins";

// Whether a node is an export statement, which wraps the declaration it exports
export const checkIsExportStatement = (
  node: ESTree.Node,
): node is ESTree.ExportDefaultDeclaration | ESTree.ExportNamedDeclaration =>
  ["ExportDefaultDeclaration", "ExportNamedDeclaration"].includes(node.type);
