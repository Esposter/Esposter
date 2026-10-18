import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

// The registry's definition of a block type, or undefined when the registry does not hold the type
export const getBlockTypeDefinition = <TDefinition extends BlockTypeDefinition>(
  registry: BlockRegistry<TDefinition>,
  type: string,
): TDefinition | undefined => registry.types.find((definition) => definition.type === type);
