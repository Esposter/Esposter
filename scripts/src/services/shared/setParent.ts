import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { parents } from "#src/services/shared/parents";

export const setParent = (node: SyntaxNode, parent: SyntaxNode): void => {
  parents.set(node, parent);
};
