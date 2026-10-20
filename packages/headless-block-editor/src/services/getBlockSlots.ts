import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockNode } from "#src/models/BlockNode";

// A node's slots as the walks read them by name: the port's typed record, viewed once with each slot string-keyed
export const getBlockSlots = <TNode extends BlockNode>(
  children: BlockChildren<TNode>,
  node: TNode,
): Readonly<Record<string, readonly TNode[]>> => children(node);
