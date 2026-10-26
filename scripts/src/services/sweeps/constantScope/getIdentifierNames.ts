import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { getDescendants } from "#src/services/sweeps/getDescendants";

export const getIdentifierNames = (node: SyntaxNode): string[] =>
  getDescendants(node).flatMap((descendant) => (descendant.type === "Identifier" ? [descendant.name] : []));
