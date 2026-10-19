import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRootDefinition } from "#src/models/BlockRootDefinition";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

// A registry holds one definition per type, typed as the definitions the consumer wrote, so a union of per-type definitions is one registry
export interface BlockRegistry<
  TNode extends BlockNode = BlockNode,
  TRootProps extends object = object,
  TDefinition extends BlockTypeDefinition = BlockTypeDefinition,
> {
  root: BlockRootDefinition<TRootProps, TNode["type"]>;
  types: TDefinition[];
}
