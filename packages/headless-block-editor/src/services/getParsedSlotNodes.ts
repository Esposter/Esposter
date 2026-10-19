import type { BlockNode } from "#src/models/BlockNode";

// The children a parsed node holds in one slot, as the node list of its document: a parse checks each slot's children against
// The registry, and every slot holds nodes of the same union the document's content does, so the list is typed as that union
// This is the core's second assertion, and the last one outside the schema path
export const getParsedSlotNodes = <TNode extends BlockNode>(node: TNode, slot: string): TNode[] => {
  const children: unknown = Reflect.get(node.props, slot);
  return Array.isArray(children) ? (children as TNode[]) : [];
};
