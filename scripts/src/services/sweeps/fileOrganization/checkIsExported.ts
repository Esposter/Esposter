import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { getParent } from "#src/services/shared/getParent";

// A function or a variable declarator counts as exported when its statement is wrapped in an export declaration
export const checkIsExported = (declaration: SyntaxNode): boolean => {
  const parent = getParent(declaration);
  const statement = declaration.type === "VariableDeclarator" && parent ? getParent(parent) : parent;
  return statement?.type === "ExportNamedDeclaration" || statement?.type === "ExportDefaultDeclaration";
};
