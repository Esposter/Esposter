import type { BlockRootDefinition } from "#src/models/BlockRootDefinition";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

export interface BlockRegistry<TDefinition extends BlockTypeDefinition = BlockTypeDefinition> {
  root: BlockRootDefinition;
  types: TDefinition[];
}
