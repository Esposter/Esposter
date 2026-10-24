import type { BlockNode } from "headless-block-editor";

// A palette group: its title and the node types it lists, in the order shown
export interface PageBuilderPaletteCategory<TNode extends BlockNode = BlockNode> {
  category: string;
  types: readonly TNode["type"][];
}
