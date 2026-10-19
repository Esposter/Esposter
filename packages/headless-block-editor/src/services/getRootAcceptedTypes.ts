import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

// The types the root's content accepts, as the registry's root declares them
export const getRootAcceptedTypes = <TNode extends BlockNode>(registry: BlockRegistry<TNode>): TNode["type"][] =>
  registry.root.content;
