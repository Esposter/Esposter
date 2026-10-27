import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { parents } from "#src/services/shared/getParent";

// The nearest block a node sits in, which is where a binding it declares can be read from
export const getScope = (node: SyntaxNode): SyntaxNode => {
  const parent = parents.get(node);
  if (parent?.type === "BlockStatement" || parent?.type === "Program") return parent;
  return parent === undefined ? node : getScope(parent);
};
