import type { BlockNode } from "#src/models/BlockNode";
import type { BlockSlots } from "#src/models/BlockSlots";

// A consumer's children port: a node's slots, switched on the node's type, so a slot the node's type lacks fails the typecheck
export type BlockChildren<TNode extends BlockNode> = (node: TNode) => BlockSlots<TNode>;
