import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";

import { WebpageNodeTypeMap } from "#shared/services/pageBuilder/webpage/WebpageNodeTypeMap";

// The definitions of the types the nodes hold, each once and in the registry's order, so a type's CSS and script are
// Emitted once whatever its node count and in an order no edit reshuffles
export const getWebpageNodeTypeDefinitions = (nodes: WebpageNode[]) => {
  const types = new Set(nodes.map(({ type }) => type));
  return Object.values(WebpageNodeTypeMap).filter(({ type }) => types.has(type));
};
