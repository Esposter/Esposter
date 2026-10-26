import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

// The node each parsed node sits in, kept beside the tree so the nodes keep the parser's own types
const parents = new WeakMap<SyntaxNode, SyntaxNode>();

export const getParent = (node: SyntaxNode): SyntaxNode | undefined => parents.get(node);

export const setParent = (node: SyntaxNode, parent: SyntaxNode): void => {
  parents.set(node, parent);
};
