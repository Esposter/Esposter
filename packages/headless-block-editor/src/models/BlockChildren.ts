import type { BlockNode } from "#src/models/BlockNode";
import type { SlotKeys } from "#src/models/SlotKeys";

// A consumer's children port: a node's slots, switched on the node's type, so a slot the node's type lacks fails the typecheck
export type BlockChildren<TNode extends BlockNode> = (node: TNode) => BlockSlots<TNode>;

// A node's own slots, each the list of child nodes that slot holds, keyed by the slots its type's props declare
export type BlockSlots<TNode extends BlockNode, TChild extends BlockNode = TNode> = TNode extends BlockNode
  ? { [TSlot in SlotKeys<TNode["props"]>]: readonly TChild[] }
  : never;
