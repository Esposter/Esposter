import type { BlockNode } from "#src/models/BlockNode";

// A consumer's children port: a node's slots, each the typed list of child nodes that slot holds, switched on the node's type
export type BlockChildren<TNode extends BlockNode> = (node: TNode) => Readonly<Record<string, readonly TNode[]>>;
