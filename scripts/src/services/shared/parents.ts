import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

// The node each parsed node sits in, kept beside the tree so the nodes keep the parser's own types. Read it with
// `parents.get(node)`, which is undefined for the root; `setParent` is the one place that writes it
export const parents: WeakMap<SyntaxNode, SyntaxNode> = new WeakMap<SyntaxNode, SyntaxNode>();
