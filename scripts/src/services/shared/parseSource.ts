import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";
import type { Program } from "oxc-parser";

import { getChildren } from "#src/services/shared/getChildren";
import { parseSourceUnlinked } from "#src/services/shared/parseSourceUnlinked";
import { setParent } from "#src/services/shared/setParent";

// The syntax tree of one TypeScript source, every node linked to the node it sits in, since a check reads a node's
// Context from its parent. A check that never reads a parent reads `parseSourceUnlinked`, which skips the walk that
// Links them
export const parseSource = (text: string): Program => {
  const program = parseSourceUnlinked(text);
  const link = (node: SyntaxNode) => {
    for (const child of getChildren(node)) {
      setParent(child, node);
      link(child);
    }
  };
  link(program);
  return program;
};
