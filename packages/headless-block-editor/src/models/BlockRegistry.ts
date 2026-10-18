import type { BlockRootDefinition } from "#src/models/BlockRootDefinition";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

export interface BlockRegistry<
  TDefinition extends BlockTypeDefinition = BlockTypeDefinition,
  TRootProps extends Record<string, unknown> = Record<string, unknown>,
> {
  root: BlockRootDefinition<TRootProps>;
  types: TDefinition[];
}
