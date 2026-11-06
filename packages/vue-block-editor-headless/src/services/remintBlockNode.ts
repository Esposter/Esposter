import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockNode } from "#src/models/BlockNode";

import { getBlockSlots } from "#src/services/getBlockSlots";

// A copy of a node with a fresh id, and a fresh id on every node in its slots, so it shares none with the original
// The copy is a plain node: its props are checked by the node schema when the copy is pasted
export const remintBlockNode = <TNode extends BlockNode>(children: BlockChildren<TNode>, node: TNode): BlockNode => {
  const slotCopies = Object.fromEntries(
    Object.entries(getBlockSlots(children, node)).map(([slot, slotNodes]) => [
      slot,
      slotNodes.map((child) => remintBlockNode(children, child)),
    ]),
  );
  return { props: { ...node.props, ...slotCopies, id: crypto.randomUUID() }, type: node.type };
};
