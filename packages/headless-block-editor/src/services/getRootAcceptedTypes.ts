import type { BlockRegistry } from "#src/models/BlockRegistry";

// The types the root's content accepts, as the registry's root declares them
export const getRootAcceptedTypes = (registry: BlockRegistry): string[] => registry.root.content;
