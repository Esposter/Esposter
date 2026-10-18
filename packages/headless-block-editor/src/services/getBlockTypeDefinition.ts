import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

// The registry's definition of a block type, or undefined when the registry does not hold the type
export const getBlockTypeDefinition = (registry: BlockRegistry, type: string): BlockTypeDefinition | undefined =>
  registry.find((definition) => definition.type === type);
