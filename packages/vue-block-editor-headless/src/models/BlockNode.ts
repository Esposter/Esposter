import type { BlockNodeProps } from "#src/models/BlockNodeProps";

// A node of the tree: its type names an entry of the registry.
// Its props hold its id, its own fields and each slot's children
export interface BlockNode<TType extends string = string, TProps extends BlockNodeProps = BlockNodeProps> {
  props: TProps;
  type: TType;
}
