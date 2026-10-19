import type { BlockNode } from "#src/models/BlockNode";

import { getBlockPropValue } from "#src/services/getBlockPropValue";

// The children a node holds in one slot, as the node list of its document: a parse checks each slot's children against the
// Registry, and every slot holds nodes of the same union the document's content does, so the list is typed as that union
// A generic cannot map a slot key to its child type, so this cast is the core's one named assertion: the prop is unknown until
// Narrowed to an array, and the array is typed as the node union the parse already guaranteed
export const getParsedSlotNodes = <TNode extends BlockNode>(node: TNode, slot: string): TNode[] => {
  const children = getBlockPropValue(node.props, slot);
  return Array.isArray(children) ? (children as TNode[]) : [];
};
