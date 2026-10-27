import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { parents } from "#src/services/shared/getParent";

// A function or a variable declarator counts as exported when its statement is wrapped in an export declaration
export const checkIsExported = (declaration: SyntaxNode): boolean => {
  const parent = parents.get(declaration);
  const statement = declaration.type === "VariableDeclarator" && parent ? parents.get(parent) : parent;
  return statement?.type === "ExportNamedDeclaration" || statement?.type === "ExportDefaultDeclaration";
};
