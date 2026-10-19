import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

// Each webpage node type's definition, keyed by its type and typed by the node that type holds
export type WebpageNodeDefinitionMap = {
  [K in WebpageNode["type"]]: NodeTypeDefinition<Extract<WebpageNode, { type: K }>>;
};
