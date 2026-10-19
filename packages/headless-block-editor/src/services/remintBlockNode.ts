import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { getParsedSlotNodes } from "#src/services/getParsedSlotNodes";

// A copy of a node with a fresh id, and a fresh id on every node in its slots, so it shares none with the original
// The copy is a plain node: its props are checked by the node schema when the copy is pasted
export const remintBlockNode = <TNode extends BlockNode>(registry: BlockRegistry<TNode>, node: TNode): BlockNode => {
  const slotCopies = Object.fromEntries(
    Object.keys(getBlockTypeDefinition(registry, node.type)?.slots ?? {}).map((slot) => [
      slot,
      getParsedSlotNodes(node, slot).map((child) => remintBlockNode(registry, child)),
    ]),
  );
  return { props: { ...node.props, ...slotCopies, id: crypto.randomUUID() }, type: node.type };
};
