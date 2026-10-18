// A node of the tree: its type names an entry of the registry, and its props hold its id, its own fields and each slot's children
export interface BlockNode {
  props: Record<string, unknown>;
  type: string;
}
