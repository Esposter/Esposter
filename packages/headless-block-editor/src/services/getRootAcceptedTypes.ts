import type { BlockRegistry } from "#src/models/BlockRegistry";

// The types the root's content accepts: every type the registry defines
export const getRootAcceptedTypes = (registry: BlockRegistry): string[] => registry.map(({ type }) => type);
