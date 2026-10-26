import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { getChildren } from "#src/services/shared/getChildren";
import { setParent } from "#src/services/shared/getParent";
import { parseSync, type Program } from "oxc-parser";

// The syntax tree of one TypeScript source, every node linked to the node it sits in, since a check reads a node's
// Context from its parent. Parentheses are kept as nodes, so a bracketed subject is seen where it was written. A source
// that does not parse is thrown, since the parser's tree for it is partial and a check would read it as clean
export const parseSource = (text: string): Program => {
  const { errors, program } = parseSync("source.ts", text, { lang: "ts", preserveParens: true });
  const [firstError] = errors;
  if (firstError) throw new Error(`cannot parse the source: ${firstError.message}`);
  const link = (node: SyntaxNode) => {
    for (const child of getChildren(node)) {
      setParent(child, node);
      link(child);
    }
  };
  link(program);
  return program;
};
