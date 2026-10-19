import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRootDefinition } from "#src/models/BlockRootDefinition";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

export interface BlockRegistry<TNode extends BlockNode = BlockNode, TRootProps extends object = object> {
  root: BlockRootDefinition<TRootProps, TNode["type"]>;
  types: BlockTypeDefinition<TNode>[];
}
