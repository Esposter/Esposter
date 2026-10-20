import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockNode } from "#src/models/BlockNode";

// The children a node holds in one slot, read through the port, or none for a slot the port does not return
export const getSlotChildren = <TNode extends BlockNode>(
  children: BlockChildren<TNode>,
  node: TNode,
  slot: string,
): readonly TNode[] => {
  const slots = children(node);
  return Object.hasOwn(slots, slot) ? (slots[slot] ?? []) : [];
};
